import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

function normalizeUsername(value: string): string {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);

  return normalized.length >= 3 ? normalized : "user";
}

export async function generateUniqueUsername(
  preferredName: string,
): Promise<string> {
  const base = normalizeUsername(preferredName);

  for (;;) {
    const suffix = randomBytes(4).toString("hex");
    const candidate = `${base.slice(0, 41)}_${suffix}`;

    const existing = await prisma.users.findUnique({
      where: { username: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }
}
