import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

    let body: { expectedVersion?: unknown } | null;

    try {
      body = await request.json() as { expectedVersion?: unknown };
    } catch {
      return responseError("Format JSON tidak valid.", 400);
    }

    if (
      !body ||
      typeof body.expectedVersion !== "number" ||
      !Number.isSafeInteger(body.expectedVersion) ||
      body.expectedVersion < 0
    ) {
      return responseError("Versi data Momo tidak valid.", 400);
    }

    const now = new Date();

    // Reset hanya berhasil jika versi database masih sesuai dengan klien.
    const updated = await prisma.$queryRaw<Array<{
      version: number;
      name: string;
      animations: boolean;
      auto_move: boolean;
      chase: boolean;
      last_checkin: Date | null;
      last_seen: Date | null;
    }>>`
      UPDATE public.momo_pets
      SET
        score = 0,
        energy = 80,
        happiness = 70,
        fullness = 65,
        asleep = FALSE,
        skin = 'salju',
        accessory = 'none',
        last_seen = ${now},
        updated_at = ${now},
        version = version + 1
      WHERE
        user_id = ${user.id}
        AND version = ${body.expectedVersion}
      RETURNING
        version, name, animations, auto_move, chase,
        last_checkin, last_seen
    `;

    if (updated.length === 0) {
      const currentPet = await prisma.momo_pets.findUnique({
        where: { user_id: user.id },
        select: { version: true },
      });

      if (!currentPet) {
        return responseError("Data Momo tidak ditemukan.", 404);
      }

      return responseError(
        "Data Momo sudah berubah di perangkat lain. Muat ulang halaman sebelum reset.",
        409
      );
    }

    const pet = updated[0];

    return NextResponse.json(
      {
        success: true,
        data: {
          version: pet.version,
          name: pet.name,
          animations: pet.animations,
          autoMove: pet.auto_move,
          chase: pet.chase,
          lastCheckin: pet.last_checkin
            ? pet.last_checkin.toISOString().slice(0, 10)
            : "",
          lastSeen: (pet.last_seen ?? now).getTime(),
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("POST /api/momo/reset:", error);
    return responseError("Gagal mereset Momo.", 500);
  }
}
