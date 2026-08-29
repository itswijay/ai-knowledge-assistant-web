import { describe, expect, it } from "vitest";

import { loginSchema, signupSchema } from "./schemas";

describe("authentication schemas", () => {
  it("normalizes a valid email address", () => {
    expect(
      loginSchema.parse({ email: "  user@example.com ", password: "secret" }),
    ).toEqual({ email: "user@example.com", password: "secret" });
  });

  it("requires a valid email and password for login", () => {
    expect(loginSchema.safeParse({ email: "invalid", password: "" }).success).toBe(
      false,
    );
  });

  it("requires at least eight signup password characters", () => {
    const result = signupSchema.safeParse({
      email: "user@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
  });
});
