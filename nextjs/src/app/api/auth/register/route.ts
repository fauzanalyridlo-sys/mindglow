import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export const runtime = "nodejs";

const registerSchema = z
  .object({
    email: z.email().max(255),
    username: z
      .string()
      .trim()
      .min(3, "Username minimal 3 karakter.")
      .max(50, "Username maksimal 50 karakter.")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username hanya boleh berisi huruf, angka, dan underscore."
      ),
    password: z.string().min(8, "Password minimal 8 karakter.").max(72),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
  });

export async function POST(request: NextRequest) {
  // Batasi request lintas origin.
  const origin = request.headers.get("origin");

  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { success: false, message: "Permintaan tidak diizinkan." },
      { status: 403 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Format JSON tidak valid." },
      { status: 400 }
    );
  }

  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Data pendaftaran tidak valid.",
        errors: z.flattenError(parsed.error),
      },
      { status: 400 }
    );
  }

  const { username, password, confirmPassword } = parsed.data;
  const email = parsed.data.email.trim().toLowerCase();

  // Jangan pernah mengembalikan password ke respons.
  void confirmPassword;

  try {
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email atau username sudah digunakan.",
        },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);
    const now = new Date();

    const user = await prisma.users.create({
      data: {
        name: username,
        username,
        email,
        password: passwordHash,
        created_at: now,
        updated_at: now,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
      },
    });

    await createSession(user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Pendaftaran berhasil.",
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          username: user.username,
        },
      },
      {
        status: 201,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Email atau username sudah digunakan.",
        },
        { status: 409 }
      );
    }

    console.error("Register gagal:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan server.",
      },
      { status: 500 }
    );
  }
}
