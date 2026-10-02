import { describe, expect, it } from "vitest";

import { createOrganizationSchema } from "./schemas";

describe("createOrganizationSchema", () => {
  it("accepts valid names", () => {
    const result = createOrganizationSchema.safeParse({ name: "Acme Corp" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Acme Corp");
    }
  });

  it("trims whitespace from name", () => {
    const result = createOrganizationSchema.safeParse({ name: "  Acme Corp  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Acme Corp");
    }
  });

  it("rejects empty names or whitespace-only names", () => {
    const emptyResult = createOrganizationSchema.safeParse({ name: "" });
    expect(emptyResult.success).toBe(false);

    const whitespaceResult = createOrganizationSchema.safeParse({ name: "   " });
    expect(whitespaceResult.success).toBe(false);
  });

  it("accepts names with exactly 120 characters", () => {
    const result = createOrganizationSchema.safeParse({ name: "a".repeat(120) });
    expect(result.success).toBe(true);
  });

  it("rejects names with more than 120 characters", () => {
    const result = createOrganizationSchema.safeParse({ name: "a".repeat(121) });
    expect(result.success).toBe(false);
  });
});
