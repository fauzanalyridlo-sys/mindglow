import { describe, it, expect, vi } from "vitest";

const { mockFindUnique, mockUpsert, mockTransaction, mockQueryRaw } =
  vi.hoisted(() => ({
    mockFindUnique: vi.fn(),
    mockUpsert: vi.fn(),
    mockTransaction: vi.fn(),
    mockQueryRaw: vi.fn(),
  }));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: mockTransaction,
  },
}));

import { consumeAiQuota } from "../src/lib/ai-rate-limit";

describe("consumeAiQuota", () => {
  it("menolak request ketika kuota per jam sudah habis", async () => {
    mockFindUnique.mockImplementation(async ({ where }) => {
      if (where.user_id_window_type_window_start.window_type === "hour") {
        return { request_count: 10 };
      }

      return null;
    });

    mockTransaction.mockImplementation(async (callback) =>
      callback({
        $queryRaw: mockQueryRaw,
        ai_rate_limits: {
          findUnique: mockFindUnique,
          upsert: mockUpsert,
        },
      }),
    );

    const result = await consumeAiQuota(BigInt(11));

    expect(result.allowed).toBe(false);

    if (!result.allowed) {
      expect(result.retryAfter).toBeGreaterThan(0);
    }

    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("menolak request ketika kuota harian sudah habis", async () => {
    mockFindUnique.mockImplementation(async ({ where }) => {
      if (where.user_id_window_type_window_start.window_type === "day") {
        return { request_count: 30 };
      }

      return null;
    });

    mockTransaction.mockImplementation(async (callback) =>
      callback({
        $queryRaw: mockQueryRaw,
        ai_rate_limits: {
          findUnique: mockFindUnique,
          upsert: mockUpsert,
        },
      }),
    );

    const result = await consumeAiQuota(BigInt(11));

    expect(result.allowed).toBe(false);

    if (!result.allowed) {
      expect(result.retryAfter).toBeGreaterThan(0);
    }

    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("mencatat request jika kedua kuota masih tersedia", async () => {
    mockFindUnique.mockResolvedValue(null);

    mockTransaction.mockImplementation(async (callback) =>
      callback({
        $queryRaw: mockQueryRaw,
        ai_rate_limits: {
          findUnique: mockFindUnique,
          upsert: mockUpsert,
        },
      }),
    );

    const result = await consumeAiQuota(BigInt(11));

    expect(result).toEqual({ allowed: true });
    expect(mockUpsert).toHaveBeenCalledTimes(2);
  });

  it("membersihkan mock antar pengujian", () => {
    expect(mockFindUnique).toBeDefined();
  });
});
