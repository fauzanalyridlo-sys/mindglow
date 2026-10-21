import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const updateTaskSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  course: z.string().trim().min(1).max(255).optional(),
  deadline: z.iso.date().optional(),
  priority: z.enum(["Rendah", "Sedang", "Tinggi"]).optional(),
  type: z.enum(["Kelompok", "Individu"]).optional(),
  completed: z.boolean().optional(),
}).strict().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Minimal satu field harus dikirim." }
);

type RouteContext = {
  params: Promise<{ id: string }>;
};

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

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

function validOrigin(request: NextRequest) {
  return request.headers.get("origin") === request.nextUrl.origin;
}

async function getTaskId(context: RouteContext) {
  const { id } = await context.params;

  if (!/^[1-9]\d*$/.test(id)) return null;

  try {
    const parsed = BigInt(id);
    if (parsed > BigInt("9223372036854775807")) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) return jsonError("Silakan login terlebih dahulu.", 401);

  if (!validOrigin(request)) {
    return jsonError("Origin request tidak diizinkan.", 403);
  }

  const taskId = await getTaskId(context);

  if (!taskId) return jsonError("ID tugas tidak valid.", 400);

  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().startsWith("application/json")) {
    return jsonError("Content-Type harus application/json.", 415);
  }

  const rawBody = await request.text();

  if (Buffer.byteLength(rawBody, "utf8") > 10_000) {
    return jsonError("Ukuran request terlalu besar.", 413);
  }

  let body: unknown;

  try {
    body = JSON.parse(rawBody);
  } catch {
    return jsonError("Format JSON tidak valid.", 400);
  }

  const parsed = updateTaskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Data perubahan tugas tidak valid.",
        errors: parsed.error.flatten(),
      },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const existingTask = await prisma.academic_tasks.findFirst({
    where: {
      id: taskId,
      user_id: user.id,
    },
    select: { id: true },
  });

  if (!existingTask) {
    return jsonError("Tugas tidak ditemukan.", 404);
  }

  const { deadline, ...rest } = parsed.data;

  const result = await prisma.academic_tasks.updateMany({
    where: {
      id: taskId,
      user_id: user.id,
    },
    data: {
      ...rest,
      ...(deadline
        ? { deadline: new Date(`${deadline}T00:00:00.000Z`) }
        : {}),
      updated_at: new Date(),
    },
  });

  if (result.count === 0) {
    return jsonError("Tugas tidak ditemukan.", 404);
  }

  const updatedTask = await prisma.academic_tasks.findFirst({
    where: {
      id: taskId,
      user_id: user.id,
    },
  });

  if (!updatedTask) {
    return jsonError("Tugas tidak ditemukan.", 404);
  }

  return NextResponse.json(
    {
      success: true,
      message: "Tugas berhasil diperbarui.",
      data: serializeTask(updatedTask),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) return jsonError("Silakan login terlebih dahulu.", 401);

  if (!validOrigin(request)) {
    return jsonError("Origin request tidak diizinkan.", 403);
  }

  const taskId = await getTaskId(context);

  if (!taskId) return jsonError("ID tugas tidak valid.", 400);

  const result = await prisma.academic_tasks.deleteMany({
    where: {
      id: taskId,
      user_id: user.id,
    },
  });

  if (result.count === 0) {
    return jsonError("Tugas tidak ditemukan.", 404);
  }

  return NextResponse.json(
    {
      success: true,
      message: "Tugas berhasil dihapus.",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
