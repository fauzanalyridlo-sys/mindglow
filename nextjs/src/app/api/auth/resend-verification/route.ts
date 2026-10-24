import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email-verification";

export const runtime = "nodejs";

const requestSchema = z.object({
  email: z.email().max(255),
});

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { success: false, message: "Permintaan tidak diizinkan." },
      { status: 403 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Format JSON tidak valid." },
      { status: 400 },
    );
  }

  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Alamat email tidak valid." },
      { status: 400 },
    );
  }

  const email = parsed.data.email.trim().toLowerCase();

  try {
    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        email_verified_at: true,
        password: true,
      },
    });

    // Respons yang sama mencegah orang mengetahui email mana yang terdaftar.
    const genericResponse = {
      success: true,
      message:
        "Jika akun tersedia dan belum terverifikasi, instruksi verifikasi akan dikirim ke email tersebut.",
    };

    if (!user || user.email_verified_at || !user.password) {
      return NextResponse.json(genericResponse, {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      });
    }

    await sendVerificationEmail(user.id, user.email);

    return NextResponse.json(genericResponse, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(
      "Pengiriman ulang verifikasi gagal:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      {
        success: false,
        message: "Email verifikasi belum dapat dikirim. Silakan coba lagi nanti.",
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
