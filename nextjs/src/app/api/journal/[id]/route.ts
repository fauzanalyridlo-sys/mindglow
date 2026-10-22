import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const user = await getCurrentUser();

  if (!user) {
    return errorResponse("Silakan login terlebih dahulu.", 401);
  }

  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return errorResponse("Origin request tidak diizinkan.", 403);
  }

  const { id } = await context.params;

  // Hanya terima ID bilangan bulat positif.
  if (!/^[1-9]\d*$/.test(id)) {
    return errorResponse("ID jurnal tidak valid.", 400);
  }

  const journalId = BigInt(id);

  if (journalId > BigInt("9223372036854775807")) {
    return errorResponse("ID jurnal tidak valid.", 400);
  }

  // Filter berdasarkan ID jurnal dan pemiliknya.
  const result = await prisma.journals.deleteMany({
    where: {
      id: journalId,
      user_id: user.id,
    },
  });

  if (result.count === 0) {
    return errorResponse("Jurnal tidak ditemukan.", 404);
  }

  return NextResponse.json(
    {
      success: true,
      message: "Jurnal berhasil dihapus.",
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}
