import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as assistantsApi from "@/lib/api/assistants";
import * as documentsApi from "@/lib/api/documents";
import { useOrganization } from "@/features/organizations/use-organization";
import type { Assistant, Document } from "@/types/domain";
import {
  useAssistant,
  useAssistantDocuments,
  useCreateAssistant,
  useDeleteAssistant,
  useUpdateAssistant,
} from "./use-assistant";

vi.mock("@/features/organizations/use-organization", () => ({
  useOrganization: vi.fn(),
}));

vi.mock("@/lib/api/assistants", () => ({
  getAssistant: vi.fn(),
  createAssistant: vi.fn(),
  updateAssistant: vi.fn(),
  deleteAssistant: vi.fn(),
}));

vi.mock("@/lib/api/documents", () => ({
  listDocuments: vi.fn(),
}));

const mockAssistant: Assistant = {
  id: "asst-1",
  organizationId: "org-1",
  name: "Documentation Bot",
  description: "Helps with docs",
  welcomeMessage: "Hi!",
  assistantInstructions: "Instructions",
  logoUrl: null,
  primaryColor: "#2563EB",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const mockDocs: Document[] = [
  {
    id: "doc-1",
    assistantId: "asst-1",
    originalFilename: "user-guide.pdf",
    createdAt: "2026-01-02T00:00:00Z",
  },
];

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe("useAssistant and useAssistantDocuments hooks", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.mocked(useOrganization).mockReturnValue({
      organizations: [],
      selectedOrganizationId: "org-1",
      selectedOrganization: null,
      isLoading: false,
      isError: false,
      error: null,
      switchOrganization: vi.fn(),
      createOrganization: vi.fn(),
      isCreating: false,
    });
  });

  it("fetches single assistant by ID", async () => {
    vi.mocked(assistantsApi.getAssistant).mockResolvedValueOnce(mockAssistant);

    const { result } = renderHook(() => useAssistant("asst-1"), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(assistantsApi.getAssistant).toHaveBeenCalledWith("asst-1");
    expect(result.current.assistant).toEqual(mockAssistant);
  });

  it("fetches assistant documents", async () => {
    vi.mocked(documentsApi.listDocuments).mockResolvedValueOnce(mockDocs);

    const { result } = renderHook(() => useAssistantDocuments("asst-1"), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(documentsApi.listDocuments).toHaveBeenCalledWith("asst-1");
    expect(result.current.documents).toEqual(mockDocs);
  });

  it("creates an assistant with useCreateAssistant", async () => {
    vi.mocked(assistantsApi.createAssistant).mockResolvedValueOnce(mockAssistant);

    const { result } = renderHook(() => useCreateAssistant(), {
      wrapper: createWrapper(queryClient),
    });

    let created: Assistant | undefined;
    await act(async () => {
      created = await result.current.mutateAsync({ name: "Documentation Bot" });
    });

    expect(assistantsApi.createAssistant).toHaveBeenCalledWith("org-1", {
      name: "Documentation Bot",
    });
    expect(created).toEqual(mockAssistant);
  });

  it("updates an assistant with useUpdateAssistant", async () => {
    const updated = { ...mockAssistant, name: "Updated Bot" };
    vi.mocked(assistantsApi.updateAssistant).mockResolvedValueOnce(updated);

    const { result } = renderHook(() => useUpdateAssistant("asst-1"), {
      wrapper: createWrapper(queryClient),
    });

    let res: Assistant | undefined;
    await act(async () => {
      res = await result.current.mutateAsync({ name: "Updated Bot" });
    });

    expect(assistantsApi.updateAssistant).toHaveBeenCalledWith("asst-1", {
      name: "Updated Bot",
    });
    expect(res).toEqual(updated);
  });

  it("deletes an assistant with useDeleteAssistant", async () => {
    vi.mocked(assistantsApi.deleteAssistant).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteAssistant("asst-1"), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(assistantsApi.deleteAssistant).toHaveBeenCalledWith("asst-1");
  });
});
