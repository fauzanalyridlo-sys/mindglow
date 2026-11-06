import { NextRequest, NextResponse } from "next/server";
import { deleteSession, touchCurrentSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (!origin || origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { error: "Origin tidak diizinkan." },
      { status: 403 }
    );
  }

  const user = await touchCurrentSession();

  if (!user) {
    await deleteSession();

    return NextResponse.json(
      { error: "Sesi berakhir. Silakan login kembali." },
      { status: 401 }
    );
  }

  return NextResponse.json(
    { success: true },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
