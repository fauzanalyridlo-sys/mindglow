import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { consumeAuthRateLimit } from "@/lib/auth-rate-limit";

export const runtime = "nodejs";

const requestSchema = z.object({
  email: z.string().trim().email().max(255),
}).strict();

const GENERIC_MESSAGE =
  "Jika email terdaftar, instruksi reset password akan dikirim. Periksa kotak masuk email kamu.";

function response(message: string, status = 200) {
  return NextResponse.json(
    { success: status === 200, message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return response("Origin request tidak diizinkan.", 403);
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return response("Content-Type harus application/json.", 415);
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > 2000) {
    return response("Ukuran request terlalu besar.", 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return response("Format JSON tidak valid.", 400);
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return response("Alamat email tidak valid.", 400);
  }

  const email = parsed.data.email.toLowerCase();

  try {
    // Maksimal 3 permintaan per email dalam jendela 15 menit.
    // Respons tetap generik jika batas tercapai.
    const rateLimit = await consumeAuthRateLimit(
      "email",
      email,
      3
    );

    if (!rateLimit.allowed) {
      return response(GENERIC_MESSAGE);
    }

    const user = await prisma.users.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      return response(GENERIC_MESSAGE);
    }

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await prisma.password_reset_tokens.upsert({
      where: { email: user.email },
      create: {
        email: user.email,
        token: tokenHash,
        created_at: new Date(),
      },
      update: {
        token: tokenHash,
        created_at: new Date(),
      },
    });

    const appUrl = process.env.APP_URL;
    if (!appUrl) {
      throw new Error("APP_URL belum dikonfigurasi.");
    }

    const resetUrl = new URL("/reset-password", appUrl);
    resetUrl.searchParams.set("token", rawToken);

    try {
      await sendEmail({
        to: user.email,
        subject: "Reset password MindGlow",
        text: [
          "Kami menerima permintaan untuk mengatur ulang password akun MindGlow kamu.",
          "",
          `Buka tautan berikut dalam 1 jam: ${resetUrl.toString()}`,
          "",
          "Jika kamu tidak meminta reset password, abaikan email ini.",
          "Demi keamanan, jangan bagikan tautan ini kepada siapa pun.",
        ].join("\n"),
      });
    } catch (error) {
      await prisma.password_reset_tokens.deleteMany({
        where: {
          email: user.email,
          token: tokenHash,
        },
      });
      throw error;
    }

    return response(GENERIC_MESSAGE);
  } catch (error) {
    console.error(
      "Permintaan reset password gagal:",
      error instanceof Error ? error.message : "Kesalahan tidak diketahui."
    );

    // Respons tetap generik agar tidak membocorkan status akun.
    return response(GENERIC_MESSAGE);
  }
}
