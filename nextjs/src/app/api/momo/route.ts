import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function responseError(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
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

    const pet = existing ?? await prisma.momo_pets.upsert({
      where: { user_id: user.id },
      create: { user_id: user.id },
      update: {},
    });

    return NextResponse.json(
      {
        success: true,
        isNew: !existing,
        data: {
          score: pet.score,
          energy: pet.energy,
          happiness: pet.happiness,
          fullness: pet.fullness,
          lastCheckin: pet.last_checkin
            ? pet.last_checkin.toISOString().slice(0, 10)
            : "",
        },
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
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

    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return responseError("Data Momo tidak valid.", 400);
    }

    const data = body as Record<string, unknown>;

    const integerInRange = (
      value: unknown,
      min: number,
      max: number
    ): value is number =>
      typeof value === "number" &&
      Number.isInteger(value) &&
      value >= min &&
      value <= max;

    const validDate =
      data.lastCheckin === "" ||
      (
        typeof data.lastCheckin === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(data.lastCheckin) &&
        !Number.isNaN(
          Date.parse(`${data.lastCheckin}T00:00:00.000Z`)
        )
      );

    if (
      !integerInRange(data.score, 0, 1_000_000) ||
      !integerInRange(data.energy, 0, 100) ||
      !integerInRange(data.happiness, 0, 100) ||
      !integerInRange(data.fullness, 0, 100) ||
      !validDate
    ) {
      return responseError("Nilai status Momo tidak valid.", 400);
    }

    const lastCheckin =
      data.lastCheckin === ""
        ? null
        : new Date(`${data.lastCheckin}T00:00:00.000Z`);

    const pet = await prisma.momo_pets.upsert({
      where: { user_id: user.id },
      create: {
        user_id: user.id,
        score: data.score,
        energy: data.energy,
        happiness: data.happiness,
        fullness: data.fullness,
        last_checkin: lastCheckin,
      },
      update: {
        score: data.score,
        energy: data.energy,
        happiness: data.happiness,
        fullness: data.fullness,
        last_checkin: lastCheckin,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          score: pet.score,
          energy: pet.energy,
          happiness: pet.happiness,
          fullness: pet.fullness,
          lastCheckin: pet.last_checkin
            ? pet.last_checkin.toISOString().slice(0, 10)
            : "",
        },
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("PUT /api/momo:", error);
    return responseError("Gagal menyimpan data Momo.", 500);
  }
}
