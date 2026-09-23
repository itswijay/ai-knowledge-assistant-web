import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient, buildUrl, request } from "./client";
import { ApiError } from "./errors";

vi.mock("@/lib/env", () => ({
  getPublicEnv: () => ({
    NEXT_PUBLIC_SUPABASE_URL: "https://test-project.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
    NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:8000",
  }),
}));

const mockGetSession = vi.fn();
const mockRefreshSession = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
      refreshSession: mockRefreshSession,
    },
  }),
}));

describe("buildUrl", () => {
  it("constructs url with path and base url", () => {
    const url = buildUrl("/api/v1/assistants");
    expect(url).toBe("http://127.0.0.1:8000/api/v1/assistants");
  });

  it("handles paths without leading slashes", () => {
    const url = buildUrl("api/v1/assistants");
    expect(url).toBe("http://127.0.0.1:8000/api/v1/assistants");
  });

  it("appends query parameters cleanly", () => {
    const url = buildUrl("/api/v1/search", {
      q: "test",
      limit: 10,
      active: true,
      empty: null,
      missing: undefined,
    });
    expect(url).toBe("http://127.0.0.1:8000/api/v1/search?q=test&limit=10&active=true");
  });
});

describe("request and apiClient", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "mock-valid-token" } },
      error: null,
    });
    mockRefreshSession.mockResolvedValue({
      data: { session: { access_token: "mock-refreshed-token" } },
      error: null,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("automatically attaches Supabase access token to Authorization header", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await apiClient.get<{ success: boolean }>("/api/v1/test");

    expect(result).toEqual({ success: true });
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [url, init] = (global.fetch as any).mock.calls[0];
    expect(url).toBe("http://127.0.0.1:8000/api/v1/test");
    const headers = new Headers(init.headers);
    expect(headers.get("Authorization")).toBe("Bearer mock-valid-token");
  });

  it("throws 401 ApiError if authentication is required but no token is found", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    await expect(apiClient.get("/api/v1/protected")).rejects.toThrow(ApiError);
  });

  it("skips auth header when authRequired is false", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await request("/health", { authRequired: false });

    const [, init] = (global.fetch as any).mock.calls[0];
    const headers = new Headers(init.headers);
    expect(headers.has("Authorization")).toBe(false);
  });

  it("serializes JSON request body and sets Content-Type", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "org-1" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await apiClient.post("/api/v1/organizations", { name: "Acme Corp" });

    const [, init] = (global.fetch as any).mock.calls[0];
    const headers = new Headers(init.headers);
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ name: "Acme Corp" }));
  });

  it("handles FormData for file uploads without overriding Content-Type", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ document_id: "doc-123" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const formData = new FormData();
    formData.append("file", new Blob(["mock pdf"], { type: "application/pdf" }), "manual.pdf");

    await apiClient.upload("/api/v1/assistants/ast-1/documents", formData);

    const [, init] = (global.fetch as any).mock.calls[0];
    const headers = new Headers(init.headers);
    expect(headers.has("Content-Type")).toBe(false);
    expect(init.body).toBe(formData);
  });

  it("handles 204 No Content response", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    );

    const result = await apiClient.delete("/api/v1/assistants/ast-1");
    expect(result).toBeUndefined();
  });

  it("parses error response into structured ApiError", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ detail: "Assistant not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(apiClient.get("/api/v1/assistants/missing-id")).rejects.toThrow(ApiError);
  });

  it("retries once on 401 when token can be refreshed", async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      callCount += 1;
      if (callCount === 1) {
        return Promise.resolve(
          new Response(JSON.stringify({ detail: "Token expired" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({ refreshed: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    });

    const result = await apiClient.get<{ refreshed: boolean }>("/api/v1/retry-test");

    expect(result).toEqual({ refreshed: true });
    expect(global.fetch).toHaveBeenCalledTimes(2);

    const secondCallHeaders = new Headers((global.fetch as any).mock.calls[1][1].headers);
    expect(secondCallHeaders.get("Authorization")).toBe("Bearer mock-refreshed-token");
  });

  it("handles abort signals cleanly", async () => {
    const controller = new AbortController();
    global.fetch = vi.fn().mockImplementation((_, init) => {
      if (init.signal?.aborted) {
        const error = new DOMException("The operation was aborted.", "AbortError");
        return Promise.reject(error);
      }
      return Promise.resolve(new Response(JSON.stringify({ ok: true })));
    });

    controller.abort();
    await expect(
      apiClient.get("/api/v1/aborted", { signal: controller.signal }),
    ).rejects.toThrow("The operation was aborted.");
  });
});
