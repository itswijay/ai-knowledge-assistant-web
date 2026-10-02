import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDocuments } from "@/features/documents/use-documents";
import KnowledgePage from "./page";

vi.mock("next/navigation", () => ({
  useParams: () => ({ assistantId: "asst-1" }),
}));

vi.mock("@/features/documents/use-documents", () => ({
  useDocuments: vi.fn(),
  useUploadDocument: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteDocument: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

describe("KnowledgePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDocuments).mockReturnValue({
      documents: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it("renders knowledge management view with uploader and document list", () => {
    render(<KnowledgePage />);

    expect(
      screen.getByText("Knowledge Ingestion & Grounding"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Upload Documents"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Knowledge Base Documents"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Select PDF"),
    ).toBeInTheDocument();
  });
});
