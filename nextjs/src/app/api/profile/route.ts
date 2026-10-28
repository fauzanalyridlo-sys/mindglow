import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const profileSchema = z.object({
  username: z.string().trim()
    .min(3).max(50)
    .regex(/^[a-zA-Z0-9_]+$/),
  email: z.email().trim().toLowerCase().max(255),
  phone: z.union([
    z.string().trim().max(30),
    z.null(),
  ]),
}).strict();

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

function formatProfile(user: {
  id: bigint;
  name: string;
  username: string | null;
  email: string;
  phone: string | null;
}) {
  return {
    id: user.id.toString(),
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
  };
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return errorResponse("Silakan login terlebih dahulu.", 401);
  }

  const profile = await prisma.users.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      phone: true,
    },
  });

  if (!profile) {
    return errorResponse("Pengguna tidak ditemukan.", 404);
  }

  return NextResponse.json(
    {
      success: true,
      data: formatProfile(profile),
    },
    {
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

  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Data profil tidak valid.",
        errors: z.treeifyError(parsed.error),
      },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  try {
    const updated = await prisma.users.update({
      where: { id: user.id },
      data: {
        name: parsed.data.username,
        username: parsed.data.username,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        updated_at: new Date(),
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Profil berhasil diperbarui.",
        data: formatProfile(updated),
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return errorResponse(
        "Username atau email sudah digunakan.",
        409
      );
    }

    throw error;
  }
}
