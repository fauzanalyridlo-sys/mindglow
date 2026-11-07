import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "mindglow_session";
const SESSION_IDLE_TIMEOUT_MS = 10 * 60 * 1000;
const SESSION_MAX_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function sessionCookieOptions(expires: Date) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires,
  };
}

function getSessionExpiry(now: Date, createdAt: Date) {
  return new Date(
    Math.min(
      now.getTime() + SESSION_IDLE_TIMEOUT_MS,
      createdAt.getTime() + SESSION_MAX_DURATION_MS
    )
  );
}

export async function createSession(userId: bigint) {
  const token = randomBytes(32).toString("hex");
  const now = new Date();

  const idleExpiresAt = new Date(
    now.getTime() + SESSION_IDLE_TIMEOUT_MS
  );

  const absoluteExpiresAt = new Date(
    now.getTime() + SESSION_MAX_DURATION_MS
  );

  await prisma.mindglow_sessions.create({
    data: {
      user_id: userId,
      token_hash: hashToken(token),
      expires_at: idleExpiresAt,
    },
  });

  const cookieStore = await cookies();

  // Cookie bertahan sampai batas maksimum.
  // Masa idle sebenarnya tetap dikontrol oleh database.
  cookieStore.set(
    SESSION_COOKIE,
    token,
    sessionCookieOptions(absoluteExpiresAt)
  );
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return null;
  }

  const tokenHash = hashToken(token);

  const session = await prisma.mindglow_sessions.findUnique({
    where: {
      token_hash: tokenHash,
    },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  const now = new Date();

  const absoluteExpiresAt = new Date(
    session.created_at.getTime() + SESSION_MAX_DURATION_MS
  );

  // Session ditolak apabila idle timeout atau batas maksimum tercapai.
  if (
    session.expires_at <= now ||
    absoluteExpiresAt <= now
  ) {
    await prisma.mindglow_sessions.deleteMany({
      where: {
        token_hash: tokenHash,
      },
    });

    return null;
  }

  // Perpanjang session berdasarkan aktivitas terakhir.
  const nextExpiresAt = getSessionExpiry(now, session.created_at);

  if (nextExpiresAt > session.expires_at) {
    await prisma.mindglow_sessions.updateMany({
      where: {
        token_hash: tokenHash,
        expires_at: {
          gt: now,
          lt: nextExpiresAt,
        },
      },
      data: {
        expires_at: nextExpiresAt,
      },
    });
  }

  return session.users;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token && /^[a-f0-9]{64}$/.test(token)) {
    await prisma.mindglow_sessions.deleteMany({
      where: {
        token_hash: hashToken(token),
      },
    });
  }

  cookieStore.delete(SESSION_COOKIE);
}
