import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const {
  mockFindUnique,
  mockDeleteMany,
  mockUpdateMany,
  mockCreate,
  mockCookies,
  mockCookieGet,
  mockCookieSet,
  mockCookieDelete,
} = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockDeleteMany: vi.fn(),
  mockUpdateMany: vi.fn(),
  mockCreate: vi.fn(),
  mockCookies: vi.fn(),
  mockCookieGet: vi.fn(),
  mockCookieSet: vi.fn(),
  mockCookieDelete: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  cookies: mockCookies,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    mindglow_sessions: {
      findUnique: mockFindUnique,
      deleteMany: mockDeleteMany,
      updateMany: mockUpdateMany,
      create: mockCreate,
    },
  },
}));

import {
  createSession,
  deleteSession,
  getCurrentUser,
  touchCurrentSession,
} from "@/lib/auth";

const TOKEN = "a".repeat(64);
const NOW = new Date("2026-11-06T10:00:00.000Z");

const user = {
  id: BigInt(11),
  name: "Test User",
  email: "test@example.com",
  username: "testuser",
};

function makeSession(overrides: Record<string, unknown> = {}) {
  return {
    id: "session-test-id",
    user_id: BigInt(11),
    token_hash: "test-hash",
    expires_at: new Date(NOW.getTime() + 7 * 24 * 60 * 60 * 1000),
    last_activity_at: new Date(NOW.getTime() - 60 * 1000),
    users: user,
    ...overrides,
  };
}

describe("Session idle timeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    vi.clearAllMocks();

    mockCookieGet.mockReturnValue({
      value: TOKEN,
    });

    mockCookies.mockResolvedValue({
      get: mockCookieGet,
      set: mockCookieSet,
      delete: mockCookieDelete,
    });

    mockDeleteMany.mockResolvedValue({ count: 1 });
    mockUpdateMany.mockResolvedValue({ count: 1 });
    mockCreate.mockResolvedValue({});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("mengembalikan user jika sesi masih aktif", async () => {
    mockFindUnique.mockResolvedValue(makeSession());

    const result = await getCurrentUser();

    expect(result).toEqual(user);
    expect(mockDeleteMany).not.toHaveBeenCalled();
  });

  it("mengakhiri sesi jika tidak ada aktivitas selama 30 menit", async () => {
    mockFindUnique.mockResolvedValue(
      makeSession({
        last_activity_at: new Date(
          NOW.getTime() - 30 * 60 * 1000
        ),
      })
    );

    const result = await getCurrentUser();

    expect(result).toBeNull();
    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: {
        id: "session-test-id",
      },
    });
  });

  it("mengakhiri sesi jika masa berlaku 7 hari sudah habis", async () => {
    mockFindUnique.mockResolvedValue(
      makeSession({
        expires_at: NOW,
      })
    );

    const result = await getCurrentUser();

    expect(result).toBeNull();
    expect(mockDeleteMany).toHaveBeenCalledTimes(1);
  });

  it("memperbarui last_activity_at ketika aktivitas valid", async () => {
    mockFindUnique.mockResolvedValue(makeSession());

    const result = await touchCurrentSession();

    expect(result).toEqual(user);
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: {
        id: "session-test-id",
        expires_at: {
          gt: NOW,
        },
        last_activity_at: {
          gt: new Date(NOW.getTime() - 30 * 60 * 1000),
        },
      },
      data: {
        last_activity_at: NOW,
      },
    });
  });

  it("menolak sesi jika update database tidak berhasil", async () => {
    mockFindUnique.mockResolvedValue(makeSession());
    mockUpdateMany.mockResolvedValue({ count: 0 });

    const result = await touchCurrentSession();

    expect(result).toBeNull();
  });

  it("mengembalikan null jika cookie sesi tidak tersedia", async () => {
    mockCookieGet.mockReturnValue(undefined);

    const result = await getCurrentUser();

    expect(result).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("membuat sesi dengan masa berlaku 7 hari", async () => {
    await createSession(BigInt(11));

    expect(mockCreate).toHaveBeenCalledTimes(1);

    const createArgs = mockCreate.mock.calls[0][0];

    expect(createArgs.data.user_id).toBe(BigInt(11));
    expect(createArgs.data.last_activity_at).toEqual(NOW);
    expect(createArgs.data.expires_at).toEqual(
      new Date(NOW.getTime() + 7 * 24 * 60 * 60 * 1000)
    );

    expect(createArgs.data.token_hash).toMatch(/^[a-f0-9]{64}$/);

    expect(mockCookieSet).toHaveBeenCalledTimes(1);
    expect(mockCookieSet.mock.calls[0][0]).toBe("mindglow_session");
  });

  it("menghapus sesi dan cookie ketika logout", async () => {
    await deleteSession();

    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: {
        token_hash: expect.any(String),
      },
    });

    expect(mockCookieDelete).toHaveBeenCalledWith("mindglow_session");
  });
});
