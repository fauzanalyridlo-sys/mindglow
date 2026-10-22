import { NextRequest, NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(1024),
  newPassword: z.string().min(8).max(72),
  confirmPassword: z.string(),
}).strict().refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: "Konfirmasi password baru tidak cocok.",
    path: ["confirmPassword"],
  }
);

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return errorResponse("Silakan login terlebih dahulu.", 401);
  }

  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return errorResponse("Origin request tidak diizinkan.", 403);
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().startsWith("application/json")) {
    return errorResponse("Content-Type harus application/json.", 415);
  }

  const rawBody = await request.text();

  if (Buffer.byteLength(rawBody, "utf8") > 5000) {
    return errorResponse("Ukuran request terlalu besar.", 413);
  }

  let body: unknown;

  try {
    body = JSON.parse(rawBody);
  } catch {
    return errorResponse("Format JSON tidak valid.", 400);
  }

  const parsed = passwordSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse("Data password tidak valid.", 400);
  }

  const { currentPassword, newPassword } = parsed.data;

  const account = await prisma.users.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      password: true,
    },
  });

  if (!account) {
    return errorResponse("Pengguna tidak ditemukan.", 404);
  }

  const passwordValid = await compare(
    currentPassword,
    account.password
  );

  if (!passwordValid) {
    return errorResponse("Password lama tidak sesuai.", 400);
  }

  if (currentPassword === newPassword) {
    return errorResponse(
      "Password baru harus berbeda dari password lama.",
      400
    );
  }

  const newPasswordHash = await hash(newPassword, 12);

  // Pastikan password belum berubah sejak diverifikasi.
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.users.updateMany({
      where: {
        id: account.id,
        password: account.password,
      },
      data: {
        password: newPasswordHash,
        updated_at: new Date(),
      },
    });

    if (updated.count !== 1) {
      return false;
    }

    // Cabut seluruh session pengguna, termasuk session saat ini.
    await tx.mindglow_sessions.deleteMany({
      where: { user_id: account.id },
    });

    return true;
  });

  if (!result) {
    return errorResponse(
      "Password telah berubah. Silakan coba lagi.",
      409
    );
  }

  const response = NextResponse.json(
    {
      success: true,
      message:
        "Password berhasil diperbarui. Silakan login kembali.",
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );

  response.cookies.delete("mindglow_session");

  return response;
}
