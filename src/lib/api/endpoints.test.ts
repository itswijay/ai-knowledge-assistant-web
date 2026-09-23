import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createAssistant,
  deleteAssistant,
  getAssistant,
  listAssistants,
  mapAssistant,
  updateAssistant,
} from "./assistants";
import { mapChatResult, sendChatMessage } from "./chat";
import { apiClient } from "./client";
import {
  deleteDocument,
  listDocuments,
  mapDocument,
  mapDocumentUploadResult,
  uploadDocument,
} from "./documents";
import { getHealth } from "./health";
import { getCurrentUser, mapCurrentUser } from "./me";
import { createOrganization, getOrganization, listOrganizations, mapOrganization } from "./organizations";

describe("organizations endpoints and mappers", () => {
  it("maps OrganizationResponse to Organization domain object", () => {
    const raw = {
      id: "org-1",
      name: "Engineering Corp",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-02T00:00:00Z",
    };
    const mapped = mapOrganization(raw);
    expect(mapped).toEqual({
      id: "org-1",
      name: "Engineering Corp",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-02T00:00:00Z",
    });
  });

  it("lists organizations via GET /api/v1/organizations", async () => {
    const spy = vi.spyOn(apiClient, "get").mockResolvedValue([
      {
        id: "org-1",
        name: "Engineering Corp",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-02T00:00:00Z",
      },
    ]);

    const result = await listOrganizations();
    expect(spy).toHaveBeenCalledWith("/api/v1/organizations", undefined);
    expect(result[0].id).toBe("org-1");
    expect(result[0].name).toBe("Engineering Corp");
  });

  it("fetches single organization via GET /api/v1/organizations/:id", async () => {
    const spy = vi.spyOn(apiClient, "get").mockResolvedValue({
      id: "org-1",
      name: "Engineering Corp",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-02T00:00:00Z",
    });

    const result = await getOrganization("org-1");
    expect(spy).toHaveBeenCalledWith("/api/v1/organizations/org-1", undefined);
    expect(result.id).toBe("org-1");
  });

  it("creates organization via POST /api/v1/organizations", async () => {
    const spy = vi.spyOn(apiClient, "post").mockResolvedValue({
      id: "org-2",
      name: "New Org",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    });

    const result = await createOrganization({ name: "New Org" });
    expect(spy).toHaveBeenCalledWith("/api/v1/organizations", { name: "New Org" }, undefined);
    expect(result.name).toBe("New Org");
  });
});

describe("assistants endpoints and mappers", () => {
  it("maps AssistantResponse to Assistant domain object", () => {
    const raw = {
      id: "ast-1",
      organization_id: "org-1",
      name: "Support Bot",
      description: "Handles customer support",
      welcome_message: "Hello, how can I help?",
      assistant_instructions: "Answer politely using the documentation.",
      logo_url: "https://example.com/logo.png",
      primary_color: "#2563eb",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-02T00:00:00Z",
    };

    const mapped = mapAssistant(raw);
    expect(mapped).toEqual({
      id: "ast-1",
      organizationId: "org-1",
      name: "Support Bot",
      description: "Handles customer support",
      welcomeMessage: "Hello, how can I help?",
      assistantInstructions: "Answer politely using the documentation.",
      logoUrl: "https://example.com/logo.png",
      primaryColor: "#2563eb",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-02T00:00:00Z",
    });
  });

  it("calls listAssistants with organization path", async () => {
    const spy = vi.spyOn(apiClient, "get").mockResolvedValue([]);
    await listAssistants("org-123");
    expect(spy).toHaveBeenCalledWith("/api/v1/organizations/org-123/assistants", undefined);
  });

  it("calls getAssistant with assistant path", async () => {
    const spy = vi.spyOn(apiClient, "get").mockResolvedValue({
      id: "ast-1",
      organization_id: "org-1",
      name: "Bot",
      description: null,
      welcome_message: "Hi",
      assistant_instructions: "Instructions",
      logo_url: null,
      primary_color: "#000000",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    });

    const result = await getAssistant("ast-1");
    expect(spy).toHaveBeenCalledWith("/api/v1/assistants/ast-1", undefined);
    expect(result.name).toBe("Bot");
  });

  it("calls createAssistant with organization path and payload", async () => {
    const spy = vi.spyOn(apiClient, "post").mockResolvedValue({
      id: "ast-1",
      organization_id: "org-1",
      name: "Bot",
      description: null,
      welcome_message: "Hi",
      assistant_instructions: "Instructions",
      logo_url: null,
      primary_color: "#000000",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    });

    await createAssistant("org-1", { name: "Bot" });
    expect(spy).toHaveBeenCalledWith(
      "/api/v1/organizations/org-1/assistants",
      { name: "Bot" },
      undefined,
    );
  });

  it("calls updateAssistant with patch method and payload", async () => {
    const spy = vi.spyOn(apiClient, "patch").mockResolvedValue({
      id: "ast-1",
      organization_id: "org-1",
      name: "Updated Bot",
      description: null,
      welcome_message: "Hi",
      assistant_instructions: "Instructions",
      logo_url: null,
      primary_color: "#000000",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-02T00:00:00Z",
    });

    const result = await updateAssistant("ast-1", { name: "Updated Bot" });
    expect(spy).toHaveBeenCalledWith(
      "/api/v1/assistants/ast-1",
      { name: "Updated Bot" },
      undefined,
    );
    expect(result.name).toBe("Updated Bot");
  });

  it("calls deleteAssistant with delete method", async () => {
    const spy = vi.spyOn(apiClient, "delete").mockResolvedValue(undefined);
    await deleteAssistant("ast-1");
    expect(spy).toHaveBeenCalledWith("/api/v1/assistants/ast-1", undefined);
  });
});

describe("documents endpoints and mappers", () => {
  it("maps DocumentResponse and DocumentUploadResponse accurately", () => {
    const rawDoc = {
      id: "doc-1",
      assistant_id: "ast-1",
      original_filename: "handbook.pdf",
      created_at: "2026-01-01T00:00:00Z",
    };
    expect(mapDocument(rawDoc)).toEqual({
      id: "doc-1",
      assistantId: "ast-1",
      originalFilename: "handbook.pdf",
      createdAt: "2026-01-01T00:00:00Z",
    });

    const rawUpload = {
      document_id: "doc-1",
      assistant_id: "ast-1",
      original_filename: "handbook.pdf",
      processed_page_count: 5,
      chunk_count: 12,
    };
    expect(mapDocumentUploadResult(rawUpload)).toEqual({
      documentId: "doc-1",
      assistantId: "ast-1",
      originalFilename: "handbook.pdf",
      processedPageCount: 5,
      chunkCount: 12,
    });
  });

  it("calls listDocuments", async () => {
    const spy = vi.spyOn(apiClient, "get").mockResolvedValue([]);
    await listDocuments("ast-1");
    expect(spy).toHaveBeenCalledWith("/api/v1/assistants/ast-1/documents", undefined);
  });

  it("calls uploadDocument with FormData", async () => {
    const spy = vi.spyOn(apiClient, "upload").mockResolvedValue({
      document_id: "doc-1",
      assistant_id: "ast-1",
      original_filename: "test.pdf",
      processed_page_count: 2,
      chunk_count: 4,
    });

    const file = new File(["dummy"], "test.pdf", { type: "application/pdf" });
    const result = await uploadDocument("ast-1", file);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(result.chunkCount).toBe(4);
  });

  it("calls deleteDocument", async () => {
    const spy = vi.spyOn(apiClient, "delete").mockResolvedValue(undefined);
    await deleteDocument("doc-1");
    expect(spy).toHaveBeenCalledWith("/api/v1/documents/doc-1", undefined);
  });
});

describe("chat endpoints and mappers", () => {
  it("maps ChatResponse to ChatResult", () => {
    const raw = {
      answer: "The refund window is 30 days.",
      sources: [{ document: "refund_policy.pdf", page: 3 }],
    };
    expect(mapChatResult(raw)).toEqual({
      answer: "The refund window is 30 days.",
      sources: [{ document: "refund_policy.pdf", page: 3 }],
    });
  });

  it("sends chat message via POST /api/v1/assistants/:id/chat", async () => {
    const spy = vi.spyOn(apiClient, "post").mockResolvedValue({
      answer: "Hello",
      sources: [],
    });

    const result = await sendChatMessage("ast-1", { message: "Hi" });
    expect(spy).toHaveBeenCalledWith(
      "/api/v1/assistants/ast-1/chat",
      { message: "Hi" },
      undefined,
    );
    expect(result.answer).toBe("Hello");
  });
});

describe("me and health endpoints", () => {
  it("maps and fetches current user", async () => {
    const spy = vi.spyOn(apiClient, "get").mockResolvedValue({
      id: "usr-123",
      email: "user@example.com",
    });

    const result = await getCurrentUser();
    expect(spy).toHaveBeenCalledWith("/api/v1/auth/me", undefined);
    expect(result.id).toBe("usr-123");
    expect(result.email).toBe("user@example.com");
  });

  it("calls health check with authRequired: false", async () => {
    const spy = vi.spyOn(apiClient, "get").mockResolvedValue({
      status: "ok",
    });

    const result = await getHealth();
    expect(spy).toHaveBeenCalledWith("/health", { authRequired: false });
    expect(result.status).toBe("ok");
  });
});
