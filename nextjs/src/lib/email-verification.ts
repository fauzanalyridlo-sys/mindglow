import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const TOKEN_EXPIRY_HOURS = 24;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function sendVerificationEmail(
  userId: bigint,
  email: string,
) {
  const appUrl = process.env.APP_URL;

  if (!appUrl) {
    throw new Error("APP_URL belum dikonfigurasi.");
  }

  let verificationUrl: URL;

  try {
    verificationUrl = new URL("/verify-email", appUrl);
  } catch {
    throw new Error("APP_URL tidak valid.");
  }

  if (
    verificationUrl.protocol !== "http:" &&
    verificationUrl.protocol !== "https:"
  ) {
    throw new Error("APP_URL harus menggunakan HTTP atau HTTPS.");
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(
    Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
  );

  await prisma.email_verification_tokens.deleteMany({
    where: { user_id: userId },
  });

  await prisma.email_verification_tokens.create({
    data: {
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
    },
  });

  verificationUrl.searchParams.set("token", token);

  try {
    await sendEmail({
      to: email,
      subject: "Verifikasi Email MindGlow",
      text: [
        "Halo!",
        "",
        "Terima kasih sudah mendaftar di MindGlow.",
        "Silakan verifikasi alamat email kamu melalui tautan berikut:",
        "",
        verificationUrl.toString(),
        "",
        "Tautan ini berlaku selama 24 jam.",
        "Jika kamu tidak merasa mendaftar, abaikan email ini.",
        "",
        "Salam hangat,",
        "Tim MindGlow",
      ].join("\n"),
    });
  } catch {
    await prisma.email_verification_tokens.deleteMany({
      where: { token_hash: tokenHash },
    });

    throw new Error("Email verifikasi gagal dikirim.");
  }
}

export function getVerificationTokenHash(token: string): string {
  return hashToken(token);
}
