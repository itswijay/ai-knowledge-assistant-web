import { describe, expect, it } from "vitest";

import {
  appearanceSchema,
  createAssistantSchema,
  settingsSchema,
} from "./assistant-schemas";

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

describe("appearanceSchema", () => {
  it("accepts valid appearance values", () => {
    const result = appearanceSchema.safeParse({
      welcomeMessage: "Hello! How can I assist?",
      logoUrl: "https://example.com/logo.png",
      primaryColor: "#0f766e",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty logoUrl", () => {
    const result = appearanceSchema.safeParse({
      welcomeMessage: "Hello!",
      logoUrl: "",
      primaryColor: "#2563EB",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty or whitespace-only welcomeMessage", () => {
    const result = appearanceSchema.safeParse({
      welcomeMessage: "   ",
      primaryColor: "#2563EB",
    });
    expect(result.success).toBe(false);
  });

  it("rejects welcomeMessage exceeding 500 characters", () => {
    const result = appearanceSchema.safeParse({
      welcomeMessage: "x".repeat(501),
      primaryColor: "#2563EB",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid logoUrl formats", () => {
    expect(
      appearanceSchema.safeParse({
        welcomeMessage: "Hi",
        logoUrl: "ftp://example.com/logo.png",
        primaryColor: "#2563EB",
      }).success,
    ).toBe(false);

    expect(
      appearanceSchema.safeParse({
        welcomeMessage: "Hi",
        logoUrl: "https://user:pass@example.com/logo.png",
        primaryColor: "#2563EB",
      }).success,
    ).toBe(false);

    expect(
      appearanceSchema.safeParse({
        welcomeMessage: "Hi",
        logoUrl: "not-a-url",
        primaryColor: "#2563EB",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid hex primaryColor", () => {
    expect(
      appearanceSchema.safeParse({
        welcomeMessage: "Hi",
        primaryColor: "#12345",
      }).success,
    ).toBe(false);

    expect(
      appearanceSchema.safeParse({
        welcomeMessage: "Hi",
        primaryColor: "rgb(255,0,0)",
      }).success,
    ).toBe(false);
  });
});

describe("settingsSchema", () => {
  it("accepts valid settings values", () => {
    const result = settingsSchema.safeParse({
      name: "Updated Assistant",
      description: "Updated description",
      assistantInstructions: "Be helpful and cite sources.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name or assistantInstructions", () => {
    expect(
      settingsSchema.safeParse({
        name: "",
        assistantInstructions: "Some instructions",
      }).success,
    ).toBe(false);

    expect(
      settingsSchema.safeParse({
        name: "Valid Name",
        assistantInstructions: "   ",
      }).success,
    ).toBe(false);
  });

  it("rejects instructions exceeding 4,000 characters", () => {
    const result = settingsSchema.safeParse({
      name: "Valid Name",
      assistantInstructions: "a".repeat(4001),
    });
    expect(result.success).toBe(false);
  });
});
