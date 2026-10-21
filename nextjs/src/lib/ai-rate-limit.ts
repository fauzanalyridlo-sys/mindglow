import "server-only";

import { prisma } from "@/lib/prisma";

const HOURLY_LIMIT = 10;
const DAILY_LIMIT = 30;

type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfter: number };

export async function consumeAiQuota(
  userId: bigint
): Promise<RateLimitResult> {
  const now = new Date();

  const hourStart = new Date(now);
  hourStart.setUTCMinutes(0, 0, 0);

  const dayStart = new Date(now);
  dayStart.setUTCHours(0, 0, 0, 0);

  const nextHour = new Date(hourStart.getTime() + 60 * 60 * 1000);
  const nextDay = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  return prisma.$transaction(async (tx) => {
    // Kunci baris pengguna untuk mencegah dua request
    // dari akun yang sama mengubah kuota secara bersamaan.
    await tx.$queryRaw`
      SELECT id
      FROM users
      WHERE id = ${userId}
      FOR UPDATE
    `;

    const windows = [
      {
        type: "hour",
        start: hourStart,
        limit: HOURLY_LIMIT,
        reset: nextHour,
      },
      {
        type: "day",
        start: dayStart,
        limit: DAILY_LIMIT,
        reset: nextDay,
      },
    ] as const;

    // Periksa kedua batas sebelum mengurangi kuota.
    for (const window of windows) {
      const existing = await tx.ai_rate_limits.findUnique({
        where: {
          user_id_window_type_window_start: {
            user_id: userId,
            window_type: window.type,
            window_start: window.start,
          },
        },
      });

      if (existing && existing.request_count >= window.limit) {
        return {
          allowed: false,
          retryAfter: Math.max(
            1,
            Math.ceil((window.reset.getTime() - now.getTime()) / 1000)
          ),
        };
      }
    }

    // Semua batas aman: catat satu request.
    for (const window of windows) {
      await tx.ai_rate_limits.upsert({
        where: {
          user_id_window_type_window_start: {
            user_id: userId,
            window_type: window.type,
            window_start: window.start,
          },
        },
        create: {
          user_id: userId,
          window_type: window.type,
          window_start: window.start,
          request_count: 1,
        },
        update: {
          request_count: { increment: 1 },
          updated_at: now,
        },
      });
    }

    return { allowed: true };
  });
}
