import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL belum dikonfigurasi.");
  }

  const caPath = path.join(
    process.cwd(),
    "certs",
    "supabase-prod-ca-2021.crt"
  );

  const ca = readFileSync(caPath, "utf8");

  const adapter = new PrismaPg({
    connectionString,
    max: 1,
    connectionTimeoutMillis: 10000,
    options: "-c timezone=UTC",
    ssl: {
      ca,
      rejectUnauthorized: true,
    },
  });

  return new PrismaClient({
    adapter,
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;
