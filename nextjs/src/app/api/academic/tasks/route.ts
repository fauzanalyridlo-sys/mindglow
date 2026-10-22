import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const taskSchema = z.object({
  name: z.string().trim().min(1).max(255),
  course: z.string().trim().min(1).max(255),
  deadline: z.iso.date(),
  priority: z.enum(["Rendah", "Sedang", "Tinggi"]),
  type: z.enum(["Kelompok", "Individu"]),
}).strict();

function serializeTask(task: {
  id: bigint;
  name: string;
  course: string;
  deadline: Date;
  priority: string;
  type: string;
  completed: boolean;
}) {
  return {
    id: task.id.toString(),
    name: task.name,
    course: task.course,
    deadline: task.deadline.toISOString().slice(0, 10),
    priority: task.priority,
    type: task.type,
    completed: task.completed,
  };
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const tasks = await prisma.academic_tasks.findMany({
    where: { user_id: user.id },
    orderBy: [
      { completed: "asc" },
      { deadline: "asc" },
      { created_at: "desc" },
    ],
  });

  return NextResponse.json(
    {
      success: true,
      data: tasks.map(serializeTask),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const origin = request.headers.get("origin");

  if (origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { success: false, message: "Origin request tidak diizinkan." },
      { status: 403 }
    );
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().startsWith("application/json")) {
    return NextResponse.json(
      { success: false, message: "Content-Type harus application/json." },
      { status: 415 }
    );
  }

  const rawBody = await request.text();

  if (Buffer.byteLength(rawBody, "utf8") > 10_000) {
    return NextResponse.json(
      { success: false, message: "Ukuran request terlalu besar." },
      { status: 413 }
    );
  }

  let body: unknown;

  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { success: false, message: "Format JSON tidak valid." },
      { status: 400 }
    );
  }

  const parsed = taskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Data tugas tidak valid.",
        errors: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  const { name, course, deadline, priority, type } = parsed.data;

  const task = await prisma.academic_tasks.create({
    data: {
      user_id: user.id,
      name,
      course,
      deadline: new Date(`${deadline}T00:00:00.000Z`),
      priority,
      type,
    },
  });

  return NextResponse.json(
    {
      success: true,
      message: "Tugas berhasil ditambahkan.",
      data: serializeTask(task),
    },
    {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
