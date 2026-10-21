import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "mindglow_session";
const SESSION_DURATION_DAYS = 7;

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

export async function createSession(userId: bigint) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  );

  await prisma.mindglow_sessions.create({
    data: {
      user_id: userId,
      token_hash: hashToken(token),
      expires_at: expires,
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
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return null;
  }

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

  if (!session || session.expires_at <= new Date()) {
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
