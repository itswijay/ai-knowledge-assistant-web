import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET as handleCallback } from "./callback/route";
import { GET as handleConfirmation } from "./confirm/route";

const mocks = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  verifyOtp: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      exchangeCodeForSession: mocks.exchangeCodeForSession,
      verifyOtp: mocks.verifyOtp,
    },
  }),
}));

describe("authentication route handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exchanges a PKCE code and removes it from the redirect", async () => {
    mocks.exchangeCodeForSession.mockResolvedValueOnce({ error: null });

    const response = await handleCallback(
      new NextRequest(
        "https://app.example/auth/callback?code=secret-code&next=%2Fassistants",
      ),
    );

    expect(mocks.exchangeCodeForSession).toHaveBeenCalledWith("secret-code");
    expect(response.headers.get("location")).toBe(
      "https://app.example/assistants",
    );
  });

  it("returns invalid callback requests to a generic login error", async () => {
    const response = await handleCallback(
      new NextRequest("https://app.example/auth/callback?error=access_denied"),
    );

    expect(response.headers.get("location")).toBe(
      "https://app.example/login?auth_error=callback",
    );
    expect(mocks.exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("verifies supported email token hashes without leaking them", async () => {
    mocks.verifyOtp.mockResolvedValueOnce({ error: null });

    const response = await handleConfirmation(
      new NextRequest(
        "https://app.example/auth/confirm?token_hash=secret-token&type=signup&next=%2F",
      ),
    );

    expect(mocks.verifyOtp).toHaveBeenCalledWith({
      token_hash: "secret-token",
      type: "signup",
    });
    expect(response.headers.get("location")).toBe("https://app.example/");
  });

  it("rejects unsupported email token types", async () => {
    const response = await handleConfirmation(
      new NextRequest(
        "https://app.example/auth/confirm?token_hash=secret-token&type=unknown",
      ),
    );

    expect(response.headers.get("location")).toBe(
      "https://app.example/login?auth_error=confirmation",
    );
    expect(mocks.verifyOtp).not.toHaveBeenCalled();
  });
});
