import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

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
      },
    });

    // Jangan membedakan pesan untuk akun yang tidak ditemukan
    // dan password yang salah.
    if (!user) {
      return jsonError("Email/username atau password salah.", 401);
    }

    const passwordValid = await compare(password, user.password);

    if (!passwordValid) {
      return jsonError("Email/username atau password salah.", 401);
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
