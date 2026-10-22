import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const moodLabels = [
  "Lelah/Down",
  "Cemas",
  "Biasa aja",
  "Tenang",
  "Semangat!",
] as const;

function getTodayWIB() {
  const dateString = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return new Date(`${dateString}T00:00:00.000Z`);
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "Silakan login terlebih dahulu.",
      },
      {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  const today = getTodayWIB();

  const checkin = await prisma.daily_check_ins.findUnique({
    where: {
      user_id_checkin_date: {
        user_id: user.id,
        checkin_date: today,
      },
    },
  });

  if (!checkin) {
    return NextResponse.json(
      {
        success: true,
        data: null,
        message: "Belum ada Check-in hari ini.",
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  let activities: string[] = [];
  let otherActivity = "";

  if (checkin.activity) {
    try {
      const parsed: unknown = JSON.parse(checkin.activity);

      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "activities" in parsed &&
        Array.isArray(parsed.activities)
      ) {
        activities = parsed.activities.filter(
          (item): item is string => typeof item === "string"
        );
      }

      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "otherActivity" in parsed &&
        typeof parsed.otherActivity === "string"
      ) {
        otherActivity = parsed.otherActivity;
      }
    } catch {
      // Data aktivitas lama yang bukan JSON tetap aman dibaca.
    }
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        id: checkin.id.toString(),
        date: checkin.checkin_date.toISOString().slice(0, 10),
        mood: moodLabels[checkin.mood - 1] ?? "Tidak diketahui",
        energyLevel: checkin.energy,
        sleepHours: Number(checkin.sleep_hours),
        activities,
        otherActivity,
      },
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}
