import { describe, expect, it } from "vitest";

import { createAssistantSchema } from "./assistant-schemas";

describe("createAssistantSchema", () => {
  it("accepts valid required fields", () => {
    const result = createAssistantSchema.safeParse({
      name: "Customer Assistant",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Customer Assistant");
    }
  });

  it("trims name and description", () => {
    const result = createAssistantSchema.safeParse({
      name: "  Customer Assistant  ",
      description: "  Helpful bot  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Customer Assistant");
      expect(result.data.description).toBe("Helpful bot");
    }
  });

  it("rejects empty name", () => {
    const result = createAssistantSchema.safeParse({
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 100 characters", () => {
    const result = createAssistantSchema.safeParse({
      name: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid hex colors", () => {
    const result = createAssistantSchema.safeParse({
      name: "Assistant",
      primaryColor: "#2563EB",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid hex colors", () => {
    const result = createAssistantSchema.safeParse({
      name: "Assistant",
      primaryColor: "blue",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional empty strings for optional fields", () => {
    const result = createAssistantSchema.safeParse({
      name: "Assistant",
      description: "",
      welcomeMessage: "",
      assistantInstructions: "",
      primaryColor: "",
    });
    expect(result.success).toBe(true);
  });
});
