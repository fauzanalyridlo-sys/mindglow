import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { consumeAuthRateLimit } from "@/lib/auth-rate-limit";

export const runtime = "nodejs";

const loginSchema = z.object({
  emailUsername: z.string().trim().min(1).max(255),
  password: z.string().min(1).max(1024),
});

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (origin && origin !== request.nextUrl.origin) {
    return jsonError("Permintaan tidak diizinkan.", 403);
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().startsWith("application/json")) {
    return jsonError("Content-Type harus application/json.", 415);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Format JSON tidak valid.", 400);
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Email/username atau password tidak valid.", 400);
  }

  const { emailUsername, password } = parsed.data;

  try {
    const rateLimit = await consumeAuthRateLimit(
      "email",
      emailUsername.trim().toLowerCase(),
      5,
    );

    if (!rateLimit.allowed) {
      return jsonError(
        "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.",
        429,
      );
    }

    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { email: emailUsername.toLowerCase() },
          { username: emailUsername },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        password: true,
        email_verified_at: true,
      },
    });

    // Jangan membedakan pesan untuk akun yang tidak ditemukan
    // dan password yang salah.
    if (!user) {
      return jsonError("Email/username atau password salah.", 401);
    }

    // Akun Google tanpa password lokal tidak dapat login
    // menggunakan email/username dan password.
    if (!user.password) {
      return jsonError("Email/username atau password salah.", 401);
    }

    const passwordValid = await compare(password, user.password);

    if (!passwordValid) {
      return jsonError("Email/username atau password salah.", 401);
    }

    if (!user.email_verified_at) {
      return jsonError(
        "Email kamu belum diverifikasi. Silakan periksa kotak masuk email untuk tautan verifikasi.",
        403,
      );
    }

    await createSession(user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Login berhasil.",
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          username: user.username,
        },
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Login gagal:", error);
    return jsonError("Terjadi kesalahan server.", 500);
  }
}
