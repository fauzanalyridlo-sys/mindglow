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

  // Rentang 7 hari kalender: hari ini sampai 6 hari berikutnya.
  const nextWeek = new Date(today);
  nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);

  const [checkin, upcomingTasks, priorityTasks] = await Promise.all([
    prisma.daily_check_ins.findUnique({
      where: {
        user_id_checkin_date: {
          user_id: user.id,
          checkin_date: today,
        },
      },
    }),

    prisma.academic_tasks.findMany({
      where: {
        user_id: user.id,
        completed: false,
        deadline: {
          gte: today,
          lt: nextWeek,
        },
      },
      select: {
        id: true,
        type: true,
      },
    }),

    prisma.academic_tasks.findMany({
      where: {
        user_id: user.id,
        completed: false,
      },
      orderBy: [
        { deadline: "asc" },
        { created_at: "desc" },
      ],
      take: 5,
    }),
  ]);

  const groupCount = upcomingTasks.filter(
    (task) => task.type === "Kelompok"
  ).length;

  const sortedPriorityTasks = [...priorityTasks].sort((a, b) => {
    const priorityOrder: Record<string, number> = {
      Tinggi: 0,
      Sedang: 1,
      Rendah: 2,
    };

    const priorityDiff =
      (priorityOrder[a.priority] ?? 3) -
      (priorityOrder[b.priority] ?? 3);

    if (priorityDiff !== 0) return priorityDiff;

    return a.deadline.getTime() - b.deadline.getTime();
  });

  return NextResponse.json(
    {
      success: true,
      data: {
        user: {
          name: user.name,
        },

        todayMood: checkin
          ? {
              mood:
                moodLabels[checkin.mood - 1] ??
                "Tidak diketahui",
              energyLevel: checkin.energy,
              sleepHours: Number(checkin.sleep_hours),
            }
          : null,

        upcomingTasks: {
          count: upcomingTasks.length,
          groupCount,
        },

        priorityTasks: sortedPriorityTasks.map((task) => ({
          id: task.id.toString(),
          name: task.name,
          course: task.course,
          deadline: task.deadline.toISOString().slice(0, 10),
          priority: task.priority,
          type: task.type,
          completed: task.completed,
        })),
      },
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}
