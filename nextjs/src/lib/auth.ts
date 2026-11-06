import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "mindglow_session";
const SESSION_DURATION_DAYS = 7;
const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;

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

async function getSessionFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return null;
  }

  const now = new Date();
  const idleCutoff = new Date(now.getTime() - SESSION_IDLE_TIMEOUT_MS);

  const session = await prisma.mindglow_sessions.findUnique({
    where: {
      token_hash: hashToken(token),
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

  if (
    session.expires_at <= now ||
    session.last_activity_at <= idleCutoff
  ) {
    await prisma.mindglow_sessions.deleteMany({
      where: {
        id: session.id,
      },
    });

    return null;
  }

  return session;
}

export async function createSession(userId: bigint) {
  const token = randomBytes(32).toString("hex");
  const now = new Date();

  const expires = new Date(
    now.getTime() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  );

  await prisma.mindglow_sessions.create({
    data: {
      user_id: userId,
      token_hash: hashToken(token),
      expires_at: expires,
      last_activity_at: now,
    },
  });

  const cookieStore = await cookies();

  cookieStore.set(
    SESSION_COOKIE,
    token,
    sessionCookieOptions(expires)
  );
}

export async function getCurrentUser() {
  const session = await getSessionFromCookie();

  return session?.users ?? null;
}

export async function touchCurrentSession() {
  const session = await getSessionFromCookie();

  if (!session) {
    return null;
  }

  const now = new Date();
  const idleCutoff = new Date(now.getTime() - SESSION_IDLE_TIMEOUT_MS);

  const updated = await prisma.mindglow_sessions.updateMany({
    where: {
      id: session.id,
      expires_at: {
        gt: now,
      },
      last_activity_at: {
        gt: idleCutoff,
      },
    },
    data: {
      last_activity_at: now,
    },
  });

  if (updated.count === 0) {
    return null;
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
