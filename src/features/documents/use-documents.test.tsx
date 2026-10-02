import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as documentsApi from "@/lib/api/documents";
import { useOrganization } from "@/features/organizations/use-organization";
import type { Document, DocumentUploadResult } from "@/types/domain";
import {
  useDeleteDocument,
  useDocuments,
  useUploadDocument,
} from "./use-documents";

vi.mock("@/features/organizations/use-organization", () => ({
  useOrganization: vi.fn(),
}));

vi.mock("@/lib/api/documents", () => ({
  listDocuments: vi.fn(),
  uploadDocument: vi.fn(),
  deleteDocument: vi.fn(),
}));

const mockDocs: Document[] = [
  {
    id: "doc-1",
    assistantId: "asst-1",
    originalFilename: "handbook.pdf",
    createdAt: "2026-01-01T00:00:00Z",
  },
];

const mockUploadResult: DocumentUploadResult = {
  documentId: "doc-new",
  assistantId: "asst-1",
  originalFilename: "manual.pdf",
  processedPageCount: 3,
  chunkCount: 5,
};

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe("useDocuments hooks", () => {
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

  it("fetches documents for assistant", async () => {
    vi.mocked(documentsApi.listDocuments).mockResolvedValueOnce(mockDocs);

    const { result } = renderHook(() => useDocuments("asst-1"), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(documentsApi.listDocuments).toHaveBeenCalledWith("asst-1");
    expect(result.current.documents).toEqual(mockDocs);
  });

  it("uploads a document and invalidates query", async () => {
    vi.mocked(documentsApi.uploadDocument).mockResolvedValueOnce(mockUploadResult);

    const { result } = renderHook(() => useUploadDocument("asst-1"), {
      wrapper: createWrapper(queryClient),
    });

    const file = new File(["test content"], "manual.pdf", {
      type: "application/pdf",
    });

    let uploaded: DocumentUploadResult | undefined;
    await act(async () => {
      uploaded = await result.current.mutateAsync(file);
    });

    expect(documentsApi.uploadDocument).toHaveBeenCalledWith("asst-1", file);
    expect(uploaded).toEqual(mockUploadResult);
  });

  it("deletes a document and invalidates query", async () => {
    vi.mocked(documentsApi.deleteDocument).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteDocument("asst-1"), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync("doc-1");
    });

    expect(documentsApi.deleteDocument).toHaveBeenCalledWith("doc-1");
  });
});
