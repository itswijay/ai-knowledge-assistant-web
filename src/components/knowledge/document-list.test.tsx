import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  useDeleteDocument,
  useDocuments,
} from "@/features/documents/use-documents";
import { ApiError } from "@/lib/api/errors";
import type { Document } from "@/types/domain";
import { DocumentList } from "./document-list";

vi.mock("@/features/documents/use-documents", () => ({
  useDocuments: vi.fn(),
  useDeleteDocument: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockDocs: Document[] = [
  {
    id: "doc-1",
    assistantId: "asst-1",
    originalFilename: "warranty-terms.pdf",
    createdAt: "2026-01-10T12:00:00Z",
  },
  {
    id: "doc-2",
    assistantId: "asst-1",
    originalFilename: "user-manual.pdf",
    createdAt: "2026-01-12T12:00:00Z",
  },
];

describe("DocumentList", () => {
  const mockDeleteMutateAsync = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeleteDocument).mockReturnValue({
      mutateAsync: mockDeleteMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteDocument>);
  });

  it("renders empty state when no documents are uploaded", () => {
    vi.mocked(useDocuments).mockReturnValueOnce({
      documents: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<DocumentList assistantId="asst-1" />);

    expect(screen.getByText("No documents uploaded yet")).toBeInTheDocument();
  });

  it("renders loading skeleton while fetching documents", () => {
    vi.mocked(useDocuments).mockReturnValueOnce({
      documents: [],
      isLoading: true,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<DocumentList assistantId="asst-1" />);

    expect(screen.getByLabelText("Loading documents")).toBeInTheDocument();
  });

  it("renders document list with filenames and timestamps", () => {
    vi.mocked(useDocuments).mockReturnValueOnce({
      documents: mockDocs,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<DocumentList assistantId="asst-1" />);

    expect(screen.getByText("warranty-terms.pdf")).toBeInTheDocument();
    expect(screen.getByText("user-manual.pdf")).toBeInTheDocument();
    expect(screen.getByText("2 documents indexed in knowledge base")).toBeInTheDocument();
  });

  it("opens confirmation dialog and deletes document on confirm", async () => {
    const user = userEvent.setup();
    mockDeleteMutateAsync.mockResolvedValueOnce(undefined);

    vi.mocked(useDocuments).mockReturnValueOnce({
      documents: mockDocs,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<DocumentList assistantId="asst-1" />);

    // Click delete button for the first document
    await user.click(
      screen.getByRole("button", { name: "Delete warranty-terms.pdf" }),
    );

    // Confirm dialog appears
    expect(screen.getByText("Delete document?")).toBeInTheDocument();
    expect(
      screen.getByText(/All associated text chunks and vector embeddings will be permanently removed/i),
    ).toBeInTheDocument();

    // Click confirm in dialog
    await user.click(screen.getByRole("button", { name: "Delete document" }));

    await waitFor(() => {
      expect(mockDeleteMutateAsync).toHaveBeenCalledWith("doc-1");
      expect(toast.success).toHaveBeenCalledWith(
        'Document "warranty-terms.pdf" deleted.',
      );
    });
  });

  it("displays 403 error toast when deletion is forbidden for non-admin", async () => {
    const user = userEvent.setup();
    mockDeleteMutateAsync.mockRejectedValueOnce(new ApiError(403, "Forbidden"));

    vi.mocked(useDocuments).mockReturnValueOnce({
      documents: mockDocs,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<DocumentList assistantId="asst-1" />);

    await user.click(
      screen.getByRole("button", { name: "Delete warranty-terms.pdf" }),
    );
    await user.click(screen.getByRole("button", { name: "Delete document" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "You do not have permission to delete documents. Owner or Admin role required.",
      );
    });
  });
});
