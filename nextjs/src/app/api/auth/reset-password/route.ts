import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const resetSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/),
  newPassword: z.string().min(8).max(72),
  confirmPassword: z.string(),
}).strict().refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: "Konfirmasi password baru tidak cocok.",
    path: ["confirmPassword"],
  }
);

function response(message: string, status: number) {
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
  if (Buffer.byteLength(rawBody, "utf8") > 5000) {
    return response("Ukuran request terlalu besar.", 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return response("Format JSON tidak valid.", 400);
  }

  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) {
    return response("Data reset password tidak valid.", 400);
  }

  const { token, newPassword } = parsed.data;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const passwordHash = await hash(newPassword, 12);
  const now = new Date();
  const expiresBefore = new Date(now.getTime() - 60 * 60 * 1000);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const resetRecord = await tx.password_reset_tokens.findFirst({
        where: {
          token: tokenHash,
          created_at: { gt: expiresBefore },
        },
        select: { email: true },
      });

      if (!resetRecord) {
        return false;
      }

      const user = await tx.users.findUnique({
        where: { email: resetRecord.email },
        select: { id: true },
      });

      if (!user) {
        await tx.password_reset_tokens.deleteMany({
          where: { email: resetRecord.email, token: tokenHash },
        });
        return false;
      }

      const deleted = await tx.password_reset_tokens.deleteMany({
        where: {
          email: resetRecord.email,
          token: tokenHash,
          created_at: { gt: expiresBefore },
        },
      });

      if (deleted.count !== 1) {
        return false;
      }

      await tx.users.update({
        where: { id: user.id },
        data: {
          password: passwordHash,
          updated_at: now,
        },
      });

      await tx.mindglow_sessions.deleteMany({
        where: { user_id: user.id },
      });

      return true;
    });

    if (!result) {
      return response(
        "Tautan reset tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru.",
        400
      );
    }

    return response("Password berhasil direset. Silakan login kembali.", 200);
  } catch (error) {
    console.error(
      "Reset password gagal:",
      error instanceof Error ? error.message : "Kesalahan tidak diketahui."
    );
    return response("Reset password gagal. Silakan coba lagi.", 500);
  }
}
