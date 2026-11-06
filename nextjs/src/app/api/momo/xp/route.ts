import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const XP_POINTS = {
  creeper: 1,
  pet: 1,
  feed: 2,
  play: 5,
  orb: 2,
} as const;

const xpSchema = z.object({
  action: z.enum(["creeper", "pet", "feed", "play", "orb"]),
  requestId: z.string().uuid(),
  expectedVersion: z.number().int().min(0),
}).strict();

const MAX_SCORE = 1_000_000;

class RateLimitError extends Error {
  constructor() {
    super("Batas aktivitas XP tercapai. Coba lagi setelah 60 detik.");
    this.name = "RateLimitError";
  }
}

class VersionConflictError extends Error {
  constructor() {
    super("Data Momo berubah di perangkat lain. Muat ulang halaman.");
    this.name = "VersionConflictError";
  }
}

function responseError(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return responseError("Silakan login terlebih dahulu.", 401);
    }

    if (request.headers.get("origin") !== request.nextUrl.origin) {
      return responseError("Origin request tidak diizinkan.", 403);
    }

    const contentType = request.headers.get("content-type") ?? "";

    if (!contentType.toLowerCase().startsWith("application/json")) {
      return responseError("Content-Type harus application/json.", 415);
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return responseError("Format JSON tidak valid.", 400);
    }

    const parsed = xpSchema.safeParse(body);

    if (!parsed.success) {
      return responseError("Data aktivitas XP tidak valid.", 400);
    }

      const { action, requestId, expectedVersion } = parsed.data;
    const points = XP_POINTS[action];
    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      await tx.momo_pets.upsert({
        where: { user_id: user.id },
        create: {
          user_id: user.id,
          name: "Momo",
          score: 0,
          energy: 80,
          happiness: 70,
          fullness: 65,
          asleep: false,
          skin: "salju",
          accessory: "none",
          animations: true,
          auto_move: true,
          chase: true,
          last_seen: now,
        },
        update: {},
      });

      // Catat transaksi lebih dulu agar request duplikat tidak
      // menghabiskan kuota rate limit.
      const inserted = await tx.momo_xp_events.createMany({
        data: [{
          user_id: user.id,
          request_id: requestId,
          action,
          points,
        }],
        skipDuplicates: true,
      });

      const currentPet = await tx.momo_pets.findUniqueOrThrow({
        where: { user_id: user.id },
      });

      if (inserted.count === 0) {
          return {
            score: currentPet.score,
            version: currentPet.version,
            awarded: false,
            duplicate: true,
          };
        }

        if (currentPet.version !== expectedVersion) {
          throw new VersionConflictError();
        }

        // Maksimal 60 aktivitas dalam satu jendela 60 detik.
      // Operasi UPSERT ini atomik dan diserialisasi oleh row lock
      // PostgreSQL untuk setiap user_id.
      const rateLimit = await tx.$queryRaw<Array<{
        request_count: number;
      }>>`
        INSERT INTO public.momo_xp_rate_limits
          (user_id, window_started_at, request_count)
        VALUES
          (${user.id}, clock_timestamp(), 1)
        ON CONFLICT (user_id) DO UPDATE
        SET
          window_started_at = CASE
            WHEN public.momo_xp_rate_limits.window_started_at
              <= EXCLUDED.window_started_at - INTERVAL '60 seconds'
            THEN EXCLUDED.window_started_at
            ELSE public.momo_xp_rate_limits.window_started_at
          END,
          request_count = CASE
            WHEN public.momo_xp_rate_limits.window_started_at
              <= EXCLUDED.window_started_at - INTERVAL '60 seconds'
            THEN 1
            ELSE public.momo_xp_rate_limits.request_count + 1
          END
        WHERE
          public.momo_xp_rate_limits.window_started_at
            <= EXCLUDED.window_started_at - INTERVAL '60 seconds'
          OR public.momo_xp_rate_limits.request_count < 60
        RETURNING request_count
      `;

      if (rateLimit.length === 0) {
        // Exception akan membatalkan transaksi, termasuk pencatatan
        // event, sehingga request dapat dicoba kembali nanti.
        throw new RateLimitError();
      }

      const updated = await tx.momo_pets.updateMany({
          where: {
            user_id: user.id,
            version: expectedVersion,
            score: { lte: MAX_SCORE - points },
          },
          data: {
            score: { increment: points },
            version: { increment: 1 },
            last_seen: now,
          },
        });

        const pet = await tx.momo_pets.findUniqueOrThrow({
          where: { user_id: user.id },
        });

        if (updated.count === 0 && pet.version !== expectedVersion) {
          throw new VersionConflictError();
        }

        return {
          score: pet.score,
          version: pet.version,
          awarded: updated.count === 1,
          duplicate: false,
        };
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof VersionConflictError) {
      return responseError(error.message, 409);
    }

    if (error instanceof RateLimitError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 429,
          headers: {
            "Cache-Control": "no-store",
            "Retry-After": "60",
          },
        }
      );
    }

    const diagnostic =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : String(error);

    console.error("POST /api/momo/xp:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan XP Momo.",
        ...(process.env.NODE_ENV === "development"
          ? { debug: diagnostic }
          : {}),
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
