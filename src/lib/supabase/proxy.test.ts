import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateSession } from "./proxy";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  getClaims: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: mocks.createServerClient,
}));

vi.mock("@/lib/env", () => ({
  getPublicEnv: () => ({
    NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
    NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:8000",
  }),
}));

describe("Supabase auth Proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createServerClient.mockReturnValue({
      auth: { getClaims: mocks.getClaims },
    });
  });

  it("redirects unauthenticated dashboard requests to login", async () => {
    mocks.getClaims.mockResolvedValueOnce({ data: null });

    const response = await updateSession(
      new NextRequest("https://app.example/assistants?view=list"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://app.example/login?next=%2Fassistants%3Fview%3Dlist",
    );
  });

  it("allows unauthenticated auth screens", async () => {
    mocks.getClaims.mockResolvedValueOnce({ data: null });

    const response = await updateSession(
      new NextRequest("https://app.example/signup"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects authenticated users away from auth screens", async () => {
    mocks.getClaims.mockResolvedValueOnce({
      data: { claims: { sub: "user-123" } },
    });

    const response = await updateSession(
      new NextRequest("https://app.example/login?next=%2Fassistants"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://app.example/");
  });

  it("allows unauthenticated widget page requests without redirecting", async () => {
    mocks.getClaims.mockResolvedValueOnce({ data: null });

    const response = await updateSession(
      new NextRequest("https://app.example/widget/7d9116e3-4cdd-495c-b215-cc9eee299a00"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("allows unauthenticated widget.js script requests without redirecting", async () => {
    mocks.getClaims.mockResolvedValueOnce({ data: null });

    const response = await updateSession(
      new NextRequest("https://app.example/widget.js"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});

