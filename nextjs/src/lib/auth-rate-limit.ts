import "server-only";

import { createHmac } from "node:crypto";
import { prisma } from "@/lib/prisma";

const WINDOW_MS = 15 * 60 * 1000;

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
};

function hashKey(value: string): string {
  const secret = process.env.RATE_LIMIT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("RATE_LIMIT_SECRET belum dikonfigurasi dengan benar.");
  }

  return createHmac("sha256", secret)
    .update(value)
    .digest("hex");
}

export async function consumeAuthRateLimit(
  category: "email" | "ip",
  identifier: string,
  limit: number,
): Promise<RateLimitResult> {
  if (!identifier || !Number.isInteger(limit) || limit < 1) {
    throw new Error("Parameter rate limit tidak valid.");
  }

  const now = new Date();
  const cutoff = new Date(now.getTime() - WINDOW_MS);
  const rateKey = hashKey(`${category}:${identifier}`);

  const rows = await prisma.$queryRaw<Array<{ request_count: number }>>`
    INSERT INTO auth_rate_limits (
      rate_key,
      window_start,
      request_count,
      updated_at
    )
    VALUES (
      ${rateKey},
      ${now},
      1,
      ${now}
    )
    ON CONFLICT (rate_key)
    DO UPDATE SET
      window_start = CASE
        WHEN auth_rate_limits.window_start <= ${cutoff}
          THEN ${now}
        ELSE auth_rate_limits.window_start
      END,
      request_count = CASE
        WHEN auth_rate_limits.window_start <= ${cutoff}
          THEN 1
        ELSE auth_rate_limits.request_count + 1
      END,
      updated_at = ${now}
    WHERE
      auth_rate_limits.window_start <= ${cutoff}
      OR auth_rate_limits.request_count < ${limit}
    RETURNING request_count
  `;

  if (rows.length === 0) {
    return { allowed: false, remaining: 0 };
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - rows[0].request_count),
  };
}
