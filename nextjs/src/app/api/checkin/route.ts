import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const moodLabels = [
  "Lelah/Down",
  "Cemas",
  "Biasa aja",
  "Tenang",
  "Semangat!",
] as const;

const checkinSchema = z.object({
  mood: z.enum(moodLabels),
  energyLevel: z.number().int().min(1).max(5),
  sleepHours: z.number()
    .min(0)
    .max(24)
    .refine((value) => Number.isInteger(value * 2), {
      message: "Durasi tidur harus kelipatan 0,5 jam.",
    }),
  activities: z.array(z.enum([
    "Kuliah",
    "Proyek Kelompok",
    "Lab/Praktikum",
  ])).max(3),
  otherActivity: z.string().trim().max(255),
}).strict();

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

function getTodayWIB() {
  const dateString = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return new Date(`${dateString}T00:00:00.000Z`);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return errorResponse("Silakan login terlebih dahulu.", 401);
  }

  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return errorResponse("Origin request tidak diizinkan.", 403);
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().startsWith("application/json")) {
    return errorResponse("Content-Type harus application/json.", 415);
  }

  const rawBody = await request.text();

  if (Buffer.byteLength(rawBody, "utf8") > 10_000) {
    return errorResponse("Ukuran request terlalu besar.", 413);
  }

  let body: unknown;

  try {
    body = JSON.parse(rawBody);
  } catch {
    return errorResponse("Format JSON tidak valid.", 400);
  }

  const parsed = checkinSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Data Check-in tidak valid.",
        errors: z.treeifyError(parsed.error),
      },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  const { mood, energyLevel, sleepHours, activities, otherActivity } =
    parsed.data;

  const moodNumber = moodLabels.indexOf(mood) + 1;
  const today = getTodayWIB();
  const now = new Date();

  const activityData = JSON.stringify({
    activities,
    otherActivity,
  });

  const checkin = await prisma.daily_check_ins.upsert({
    where: {
      user_id_checkin_date: {
        user_id: user.id,
        checkin_date: today,
      },
    },
    create: {
      user_id: user.id,
      checkin_date: today,
      mood: moodNumber,
      energy: energyLevel,
      sleep_hours: sleepHours,
      activity: activityData,
      created_at: now,
      updated_at: now,
    },
    update: {
      mood: moodNumber,
      energy: energyLevel,
      sleep_hours: sleepHours,
      activity: activityData,
      updated_at: now,
    },
  });

  return NextResponse.json(
    {
      success: true,
      message: "Check-in hari ini berhasil disimpan.",
      data: {
        id: checkin.id.toString(),
        date: checkin.checkin_date.toISOString().slice(0, 10),
        mood,
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
