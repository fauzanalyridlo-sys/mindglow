import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "Silakan login terlebih dahulu.",
      },
      {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  return NextResponse.json(
    {
      success: true,
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        username: user.username,
      },
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}
