import { generateUniqueUsername } from "@/lib/username";
import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client, type TokenPayload } from "google-auth-library";
import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { consumeAuthRateLimit } from "@/lib/auth-rate-limit";

export const runtime = "nodejs";

const googleClient = new OAuth2Client();

const schema = z.object({
  credential: z.string().min(1).max(10000),
});

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (!origin || origin !== request.nextUrl.origin) {
    return jsonError("Permintaan tidak diizinkan.", 403);
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!/^application\/json(?:\s*;|\s*$)/i.test(contentType)) {
    return jsonError("Content-Type harus application/json.", 415);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Format JSON tidak valid.", 400);
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Token Google tidak valid.", 400);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    console.error("GOOGLE_CLIENT_ID belum dikonfigurasi.");
    return jsonError("Konfigurasi Google Sign-In belum tersedia.", 500);
  }

  let payload: TokenPayload | undefined;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: parsed.data.credential,
      audience: clientId,
    });

    payload = ticket.getPayload();
  } catch {
    return jsonError("Token Google tidak valid atau kedaluwarsa.", 401);
  }

  try {

    if (
      !payload ||
      !payload.sub ||
      !payload.email ||
      payload.email_verified !== true
    ) {
      return jsonError("Akun Google tidak dapat diverifikasi.", 401);
    }

    const googleId = payload.sub;
    const email = payload.email.trim().toLowerCase();

    const rateLimit = await consumeAuthRateLimit("email", email, 10);

    if (!rateLimit.allowed) {
      return jsonError(
        "Terlalu banyak percobaan login Google. Coba lagi dalam 15 menit.",
        429,
      );
    }
    const name = payload.name?.trim() || email.split("@")[0];

    const existingOAuth = await prisma.oauth_accounts.findUnique({
      where: {
        provider_provider_account_id: {
          provider: "google",
          provider_account_id: googleId,
        },
      },
      select: {
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

    let user = existingOAuth?.users;

    if (!user) {
      const existingEmail = await prisma.users.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existingEmail) {
        return jsonError(
          "Email sudah terdaftar. Silakan login menggunakan metode sebelumnya.",
          409,
        );
      }

      const username = await generateUniqueUsername(name);

      user = await prisma.$transaction(async (tx) => {
        const createdUser = await tx.users.create({
          data: {
            name,
            username,
            email,
            email_verified_at: new Date(),
            password: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        });

        await tx.oauth_accounts.create({
          data: {
            user_id: createdUser.id,
            provider: "google",
            provider_account_id: googleId,
          },
        });

        return createdUser;
      });
    }

    await createSession(user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Login dengan Google berhasil.",
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          username: user.username,
        },
      },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return jsonError(
        "Akun sedang diproses atau email sudah digunakan. Silakan coba login kembali.",
        409,
      );
    }

    console.error(
      "Google Sign-In gagal:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return jsonError("Terjadi kesalahan pada server.", 500);
  }
}
