import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const momoUpdateSchema = z.object({
  version: z.number().int().min(0),
  name: z.string().trim().min(1).max(12),
  energy: z.number().int().min(0).max(100),
  happiness: z.number().int().min(0).max(100),
  fullness: z.number().int().min(0).max(100),
  asleep: z.boolean(),
  skin: z.enum(["salju", "jahe", "abu", "siam", "malam"]),
  accessory: z.enum(["none", "syal", "kacamata", "topi", "mahkota"]),
  animations: z.boolean(),
  autoMove: z.boolean(),
  chase: z.boolean(),
}).strict();

function responseError(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

const defaultMomo = {
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
} as const;

const skinUnlockLevels = {
  salju: 1,
  jahe: 2,
  abu: 3,
  siam: 4,
  malam: 5,
} as const;

const accessoryUnlockLevels = {
  none: 1,
  syal: 2,
  kacamata: 3,
  topi: 4,
  mahkota: 6,
} as const;

function getLevelForScore(score: number) {
  return 1 + Math.floor(Math.sqrt(Math.max(0, score) / 15));
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return responseError("Silakan login terlebih dahulu.", 401);
    }

    const existing = await prisma.momo_pets.findUnique({
      where: { user_id: user.id },
    });

    const pet = await prisma.momo_pets.upsert({
      where: { user_id: user.id },
      create: {
        user_id: user.id,
        ...defaultMomo,
        last_seen: new Date(),
      },
      update: {},
    });

    return NextResponse.json(
      {
        success: true,
        isNew: !existing,
        userId: user.id.toString(),
        data: {
          name: pet.name,
          score: pet.score,
          version: pet.version,
          energy: pet.energy,
          happiness: pet.happiness,
          fullness: pet.fullness,
          asleep: pet.asleep,
          skin: pet.skin,
          accessory: pet.accessory,
          animations: pet.animations,
          autoMove: pet.auto_move,
          chase: pet.chase,
          lastSeen: (pet.last_seen ?? pet.updated_at).getTime(),
          lastCheckin: pet.last_checkin
            ? pet.last_checkin.toISOString().slice(0, 10)
            : "",
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/momo:", error);
    return responseError("Gagal memuat data Momo.", 500);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return responseError("Silakan login terlebih dahulu.", 401);
    }

    const origin = request.headers.get("origin");

    if (origin && origin !== new URL(request.url).origin) {
      return responseError("Origin request tidak diizinkan.", 403);
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return responseError("Format JSON tidak valid.", 400);
    }

    const parsed = momoUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return responseError("Nilai status Momo tidak valid.", 400);
    }

    const data = parsed.data;

    // Pastikan baris Momo tersedia sebelum update bersyarat.
    await prisma.momo_pets.upsert({
      where: { user_id: user.id },
      create: {
        user_id: user.id,
        ...defaultMomo,
        last_seen: new Date(),
      },
      update: {},
    });

    const now = new Date();

    // Version dan level unlock diperiksa dalam satu UPDATE atomik.
    const updated = await prisma.$queryRaw<Array<{
      name: string;
      score: number;
      version: number;
      energy: number;
      happiness: number;
      fullness: number;
      asleep: boolean;
      skin: string;
      accessory: string;
      animations: boolean;
      auto_move: boolean;
      chase: boolean;
      last_seen: Date | null;
      last_checkin: Date | null;
      updated_at: Date;
    }>>`
      UPDATE public.momo_pets
      SET
        name = ${data.name},
        energy = ${data.energy},
        happiness = ${data.happiness},
        fullness = ${data.fullness},
        asleep = ${data.asleep},
        skin = ${data.skin},
        accessory = ${data.accessory},
        animations = ${data.animations},
        auto_move = ${data.autoMove},
        chase = ${data.chase},
        last_seen = ${now},
        updated_at = ${now},
        version = version + 1
      WHERE
        user_id = ${user.id}
        AND version = ${data.version}
        AND (
          CASE ${data.skin}
            WHEN 'salju' THEN 1
            WHEN 'jahe' THEN 2
            WHEN 'abu' THEN 3
            WHEN 'siam' THEN 4
            WHEN 'malam' THEN 5
          END
        ) <= (1 + FLOOR(SQRT(GREATEST(score, 0)::numeric / 15)))::integer
        AND (
          CASE ${data.accessory}
            WHEN 'none' THEN 1
            WHEN 'syal' THEN 2
            WHEN 'kacamata' THEN 3
            WHEN 'topi' THEN 4
            WHEN 'mahkota' THEN 6
          END
        ) <= (1 + FLOOR(SQRT(GREATEST(score, 0)::numeric / 15)))::integer
      RETURNING
        name, score, version, energy, happiness, fullness, asleep,
        skin, accessory, animations, auto_move, chase,
        last_seen, last_checkin, updated_at
    `;

    if (updated.length === 0) {
      const currentPet = await prisma.momo_pets.findUnique({
        where: { user_id: user.id },
        select: { version: true, score: true },
      });

      if (!currentPet) {
        return responseError("Data Momo tidak ditemukan.", 404);
      }

      if (currentPet.version !== data.version) {
        return responseError(
          "Data Momo sudah berubah di perangkat lain. Muat ulang halaman.",
          409
        );
      }

      const currentLevel = getLevelForScore(currentPet.score);

      if (
        skinUnlockLevels[data.skin] > currentLevel ||
        accessoryUnlockLevels[data.accessory] > currentLevel
      ) {
        return responseError(
          "Skin atau aksesori tersebut belum terbuka pada level saat ini.",
          403
        );
      }

      return responseError("Data Momo gagal diperbarui.", 409);
    }

    const pet = updated[0];

    return NextResponse.json(
      {
        success: true,
        data: {
          name: pet.name,
          score: pet.score,
          version: pet.version,
          energy: pet.energy,
          happiness: pet.happiness,
          fullness: pet.fullness,
          asleep: pet.asleep,
          skin: pet.skin,
          accessory: pet.accessory,
          animations: pet.animations,
          autoMove: pet.auto_move,
          chase: pet.chase,
          lastSeen: (pet.last_seen ?? pet.updated_at).getTime(),
          lastCheckin: pet.last_checkin
            ? pet.last_checkin.toISOString().slice(0, 10)
            : "",
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("PUT /api/momo:", error);
    return responseError("Gagal menyimpan data Momo.", 500);
  }
}
