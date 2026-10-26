import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { NextRequest } from "next/server";

const {
  mockGetCurrentUser,
  mockConsumeAiQuota,
  mockFetch,
} = vi.hoisted(() => ({
  mockGetCurrentUser: vi.fn(),
  mockConsumeAiQuota: vi.fn(),
  mockFetch: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
}));

vi.mock("@/lib/ai-rate-limit", () => ({
  consumeAiQuota: mockConsumeAiQuota,
}));

vi.mock("server-only", () => ({}));

import { POST } from "@/app/api/ai/chat/route";

const endpoint = "http://localhost:3000/api/ai/chat";

function makeRequest(
  body: string,
  headers: Record<string, string> = {
    "content-type": "application/json",
    origin: "http://localhost:3000",
  },
) {
  return new NextRequest(endpoint, {
    method: "POST",
    headers,
    body,
  });
}

describe("POST /api/ai/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetCurrentUser.mockResolvedValue({
      id: BigInt(11),
    });

    mockConsumeAiQuota.mockResolvedValue({
      allowed: true,
    });

    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: "Terima kasih sudah bercerita. Apa yang paling membebani pikiranmu?",
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    vi.stubGlobal("fetch", mockFetch);

    vi.stubEnv("GROQ_API_KEY", "test-groq-key");
    vi.stubEnv("GROQ_MODEL", "test-model");
    vi.stubEnv("GROQ_TEST_URL", "http://provider.test/chat");
    vi.stubEnv("OPENROUTER_API_KEY", "");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("mengembalikan HTTP 401 jika pengguna belum login", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const response = await POST(
      makeRequest(
        JSON.stringify({
          message: "Aku sedang lelah.",
          history: [],
        }),
      ),
    );

    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.message).toContain("login");
    expect(mockConsumeAiQuota).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("mengembalikan HTTP 429 jika kuota habis", async () => {
    mockConsumeAiQuota.mockResolvedValue({
      allowed: false,
      retryAfter: 120,
    });

    const response = await POST(
      makeRequest(
        JSON.stringify({
          message: "Aku sedang merasa lelah.",
          history: [],
        }),
      ),
    );

    const body = await response.json();

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("120");
    expect(body.success).toBe(false);
    expect(body.message).toContain("Kuota chat AI");
    expect(mockConsumeAiQuota).toHaveBeenCalledWith(BigInt(11));
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("mengembalikan HTTP 200 ketika provider AI berhasil", async () => {
    const response = await POST(
      makeRequest(
        JSON.stringify({
          message: "Aku sedang merasa lelah.",
          history: [],
        }),
      ),
    );

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.reply).toContain("Terima kasih");
    expect(mockConsumeAiQuota).toHaveBeenCalledWith(BigInt(11));
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const providerRequest = mockFetch.mock.calls[0][1];
    const providerBody = JSON.parse(providerRequest.body);

    expect(providerBody.messages[0].role).toBe("system");
    expect(providerBody.messages.at(-1)).toEqual({
      role: "user",
      content: "Aku sedang merasa lelah.",
    });
  });

  it("menolak pesan kosong dengan HTTP 400", async () => {
    const response = await POST(
      makeRequest(
        JSON.stringify({
          message: "   ",
          history: [],
        }),
      ),
    );

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toContain("tidak valid");
    expect(mockConsumeAiQuota).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("menolak format JSON tidak valid dengan HTTP 400", async () => {
    const response = await POST(
      makeRequest("{json-tidak-valid"),
    );

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toContain("JSON");
    expect(mockConsumeAiQuota).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("menolak origin yang tidak diizinkan dengan HTTP 403", async () => {
    const response = await POST(
      makeRequest(
        JSON.stringify({
          message: "Halo",
          history: [],
        }),
        {
          "content-type": "application/json",
          origin: "https://origin-tidak-diizinkan.example",
        },
      ),
    );

    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.message).toContain("Origin");
    expect(mockConsumeAiQuota).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("menolak Content-Type yang bukan JSON dengan HTTP 415", async () => {
    const response = await POST(
      makeRequest(
        JSON.stringify({
          message: "Halo",
          history: [],
        }),
        {
          "content-type": "text/plain",
          origin: "http://localhost:3000",
        },
      ),
    );

    const body = await response.json();

    expect(response.status).toBe(415);
    expect(body.success).toBe(false);
    expect(mockConsumeAiQuota).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("mengembalikan HTTP 503 jika provider AI gagal", async () => {
    mockFetch.mockResolvedValue(
      new Response("Provider unavailable", {
        status: 503,
      }),
    );

    const response = await POST(
      makeRequest(
        JSON.stringify({
          message: "Aku sedang merasa lelah.",
          history: [],
        }),
      ),
    );

    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.success).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("mengembalikan HTTP 503 jika API key provider tidak tersedia", async () => {
    vi.stubEnv("GROQ_API_KEY", "");

    const response = await POST(
      makeRequest(
        JSON.stringify({
          message: "Halo",
          history: [],
        }),
      ),
    );

    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.success).toBe(false);
    expect(body.message).toContain("belum dikonfigurasi");
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
