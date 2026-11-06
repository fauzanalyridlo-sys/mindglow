import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { NextRequest } from "next/server";

const {
  mockTouchCurrentSession,
  mockDeleteSession,
} = vi.hoisted(() => ({
  mockTouchCurrentSession: vi.fn(),
  mockDeleteSession: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth", () => ({
  touchCurrentSession: mockTouchCurrentSession,
  deleteSession: mockDeleteSession,
}));

import { POST } from "@/app/api/auth/activity/route";

const endpoint = "http://localhost:3000/api/auth/activity";

function makeRequest(origin = "http://localhost:3000") {
  return new NextRequest(endpoint, {
    method: "POST",
    headers: { origin },
  });
}

describe("POST /api/auth/activity", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockTouchCurrentSession.mockResolvedValue({
      id: BigInt(11),
    });

    mockDeleteSession.mockResolvedValue(undefined);
  });

  it("mengembalikan HTTP 403 jika Origin berbeda", async () => {
    const response = await POST(
      makeRequest("https://attacker.example")
    );

    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toContain("Origin");
    expect(mockTouchCurrentSession).not.toHaveBeenCalled();
    expect(mockDeleteSession).not.toHaveBeenCalled();
  });

  it("mengembalikan HTTP 401 dan menghapus cookie jika sesi tidak valid", async () => {
    mockTouchCurrentSession.mockResolvedValue(null);

    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toContain("Sesi berakhir");
    expect(mockTouchCurrentSession).toHaveBeenCalledTimes(1);
    expect(mockDeleteSession).toHaveBeenCalledTimes(1);
  });

  it("mengembalikan HTTP 200 jika sesi masih valid", async () => {
    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(mockTouchCurrentSession).toHaveBeenCalledTimes(1);
    expect(mockDeleteSession).not.toHaveBeenCalled();
  });

  it("mengembalikan HTTP 403 jika Origin tidak tersedia", async () => {
    const request = new NextRequest(endpoint, {
      method: "POST",
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toContain("Origin");
    expect(mockTouchCurrentSession).not.toHaveBeenCalled();
  });
});
