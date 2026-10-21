import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const journalSchema = z.object({
  content: z.string().trim().min(1).max(10000),
}).strict();

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

function formatJournal(journal: {
  id: bigint;
  content: string;
  created_at: Date | null;
  updated_at: Date | null;
}) {
  return {
    id: journal.id.toString(),
    content: journal.content,
    createdAt: journal.created_at?.toISOString() ?? null,
    updatedAt: journal.updated_at?.toISOString() ?? null,
  };
}

// GET /api/journal
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return errorResponse("Silakan login terlebih dahulu.", 401);
  }

  const journals = await prisma.journals.findMany({
    where: {
      user_id: user.id,
    },
    orderBy: [
      { created_at: "desc" },
      { id: "desc" },
    ],
    take: 100,
  });

  return NextResponse.json(
    {
      success: true,
      data: journals.map(formatJournal),
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}

// POST /api/journal
export async function POST(request: NextRequest) {
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

  if (Buffer.byteLength(rawBody, "utf8") > 12000) {
    return errorResponse("Ukuran request terlalu besar.", 413);
  }

  let body: unknown;

  try {
    body = JSON.parse(rawBody);
  } catch {
    return errorResponse("Format JSON tidak valid.", 400);
  }

  const parsed = journalSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Isi jurnal tidak valid.",
        errors: z.treeifyError(parsed.error),
      },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  const now = new Date();

  const journal = await prisma.journals.create({
    data: {
      user_id: user.id,
      content: parsed.data.content,
      created_at: now,
      updated_at: now,
    },
  });

  return NextResponse.json(
    {
      success: true,
      message: "Jurnal berhasil disimpan.",
      data: formatJournal(journal),
    },
    {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
