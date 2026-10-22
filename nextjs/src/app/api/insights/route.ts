import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const DAYS = 7;

const moodLabels = [
  "Lelah/Down",
  "Cemas",
  "Biasa aja",
  "Tenang",
  "Semangat!",
] as const;

function getTodayWIB(): Date {
  const dateString = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return new Date(`${dateString}T00:00:00.000Z`);
}

function round(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
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
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const today = getTodayWIB();

  const startDate = new Date(today);
  startDate.setUTCDate(startDate.getUTCDate() - (DAYS - 1));

  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const checkins = await prisma.daily_check_ins.findMany({
    where: {
      user_id: user.id,
      checkin_date: {
        gte: startDate,
        lt: tomorrow,
      },
    },
    select: {
      checkin_date: true,
      mood: true,
      energy: true,
      sleep_hours: true,
      activity: true,
      condition: true,
    },
    orderBy: {
      checkin_date: "asc",
    },
  });

  const checkinByDate = new Map(
    checkins.map((checkin) => [
      checkin.checkin_date.toISOString().slice(0, 10),
      checkin,
    ])
  );

  const moodTrend = Array.from({ length: DAYS }, (_, index) => {
    const date = new Date(startDate);
    date.setUTCDate(startDate.getUTCDate() + index);

    const dateString = date.toISOString().slice(0, 10);
    const checkin = checkinByDate.get(dateString);

    return {
      date: dateString,
      mood: checkin?.mood ?? null,
      moodLabel: checkin
        ? moodLabels[checkin.mood - 1] ?? "Tidak diketahui"
        : null,
      energy: checkin?.energy ?? null,
      sleepHours: checkin
        ? Number(checkin.sleep_hours)
        : null,
    };
  });

  const totalCheckins = checkins.length;

  const averageMood = totalCheckins
    ? round(
        checkins.reduce((sum, item) => sum + item.mood, 0) /
          totalCheckins
      )
    : null;

  const averageEnergy = totalCheckins
    ? round(
        checkins.reduce((sum, item) => sum + item.energy, 0) /
          totalCheckins
      )
    : null;

  const averageSleepHours = totalCheckins
    ? round(
        checkins.reduce(
          (sum, item) => sum + Number(item.sleep_hours),
          0
        ) / totalCheckins
      )
    : null;

  const insights: string[] = [];

  if (totalCheckins === 0) {
    insights.push(
      "Belum ada data check-in dalam 7 hari terakhir. Mulai isi check-in harian untuk melihat pola keseharianmu."
    );
  } else {
    insights.push(
      `Kamu sudah melakukan check-in ${totalCheckins} dari ${DAYS} hari terakhir.`
    );

    if (totalCheckins >= 3) {
      if (averageMood !== null && averageMood >= 4) {
        insights.push(
          "Rata-rata mood yang kamu catat berada pada kategori positif selama periode ini."
        );
      } else if (averageMood !== null && averageMood <= 2) {
        insights.push(
          "Beberapa catatan mood menunjukkan kamu sedang menghadapi hari-hari yang cukup berat. Pertimbangkan untuk beristirahat atau berbagi cerita dengan orang yang kamu percaya."
        );
      }

      if (
        averageSleepHours !== null &&
        averageSleepHours < 7
      ) {
        insights.push(
          "Rata-rata tidur yang kamu catat kurang dari 7 jam. Coba perhatikan apakah waktu istirahatmu sudah cukup."
        );
      }
    }
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        period: "7d",
        startDate: startDate.toISOString().slice(0, 10),
        endDate: today.toISOString().slice(0, 10),
        totalCheckins,
        totalDays: DAYS,
        averageMood,
        averageEnergy,
        averageSleepHours,
        moodTrend,
        insights,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
