import { NextRequest, NextResponse } from "next/server";
import { getVerificationTokenHash } from "@/lib/email-verification";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const token = body?.token;

    if (
      typeof token !== "string" ||
      !/^[a-f0-9]{64}$/i.test(token)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Token verifikasi tidak valid.",
        },
        { status: 400 },
      );
    }

    const tokenHash = getVerificationTokenHash(token);
    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const verificationToken =
        await tx.email_verification_tokens.findUnique({
          where: { token_hash: tokenHash },
        });

      if (!verificationToken || verificationToken.expires_at <= now) {
        return "invalid" as const;
      }

      const consumed = await tx.email_verification_tokens.deleteMany({
        where: {
          token_hash: tokenHash,
          expires_at: { gt: now },
        },
      });

      if (consumed.count !== 1) {
        return "invalid" as const;
      }

      await tx.users.update({
        where: { id: verificationToken.user_id },
        data: { email_verified_at: now },
      });

      await tx.email_verification_tokens.deleteMany({
        where: { user_id: verificationToken.user_id },
      });

      return "verified" as const;
    });

    if (result === "invalid") {
      return NextResponse.json(
        {
          success: false,
          message: "Token tidak valid atau sudah kedaluwarsa. Silakan minta tautan verifikasi baru.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email berhasil diverifikasi. Kamu sekarang bisa melanjutkan ke MindGlow.",
    });
  } catch (error) {
    console.error(
      "Verifikasi email gagal:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memverifikasi email.",
      },
      { status: 500 },
    );
  }
}
