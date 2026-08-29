import { describe, expect, it } from "vitest";

import { parsePublicEnv } from "./env";

const validEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
  NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:8000",
};

describe("parsePublicEnv", () => {
  it("returns a valid public configuration", () => {
    expect(parsePublicEnv(validEnv)).toEqual(validEnv);
  });

  it("reports invalid field names without exposing their values", () => {
    expect(() =>
      parsePublicEnv({
        ...validEnv,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
        NEXT_PUBLIC_API_BASE_URL: "not a URL",
      }),
    ).toThrow(
      "Invalid public environment configuration: NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  });
});
