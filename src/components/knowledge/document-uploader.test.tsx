import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUploadDocument } from "@/features/documents/use-documents";
import { ApiError } from "@/lib/api/errors";
import { DocumentUploader } from "./document-uploader";

vi.mock("@/features/documents/use-documents", () => ({
  useUploadDocument: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("DocumentUploader", () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUploadDocument).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useUploadDocument>);
  });

  it("rejects non-PDF files with client-side validation error", async () => {
    const user = userEvent.setup();
    render(<DocumentUploader assistantId="asst-1" />);

    const invalidFile = new File(["test"], "notes.txt", { type: "text/plain" });
    const input = screen.getByLabelText("Upload PDF document");

    await user.upload(input, invalidFile);

    expect(
      screen.getByText("Only PDF documents are supported."),
    ).toBeInTheDocument();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("rejects files exceeding 10 MiB with client-side validation error", async () => {
    const user = userEvent.setup();
    render(<DocumentUploader assistantId="asst-1" />);

    // Create a mock 11 MiB file
    const largeFile = new File(["a"], "large.pdf", { type: "application/pdf" });
    Object.defineProperty(largeFile, "size", { value: 11 * 1024 * 1024 });

    const input = screen.getByLabelText("Upload PDF document");
    await user.upload(input, largeFile);

    expect(
      screen.getByText("File exceeds the maximum upload limit of 10 MiB."),
    ).toBeInTheDocument();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("uploads valid PDF and displays page and chunk count in success toast", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValueOnce({
      documentId: "doc-1",
      assistantId: "asst-1",
      originalFilename: "policy.pdf",
      processedPageCount: 4,
      chunkCount: 6,
    });

    render(<DocumentUploader assistantId="asst-1" />);

    const validFile = new File(["pdf binary"], "policy.pdf", {
      type: "application/pdf",
    });
    const input = screen.getByLabelText("Upload PDF document");

    await user.upload(input, validFile);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(validFile);
      expect(toast.success).toHaveBeenCalledWith(
        'Successfully uploaded "policy.pdf" (4 pages, 6 chunks).',
      );
    });
  });

  it("displays 403 permission error message", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockRejectedValueOnce(new ApiError(403, "Forbidden"));

    render(<DocumentUploader assistantId="asst-1" />);

    const validFile = new File(["pdf binary"], "policy.pdf", {
      type: "application/pdf",
    });
    const input = screen.getByLabelText("Upload PDF document");

    await user.upload(input, validFile);

    expect(
      await screen.findByText(
        "You do not have permission to upload documents. Owner or Admin role required.",
      ),
    ).toBeInTheDocument();
  });

  it("displays 422 unprocessable PDF error message", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockRejectedValueOnce(
      new ApiError(422, "PDF contains no extractable text; OCR is not supported."),
    );

    render(<DocumentUploader assistantId="asst-1" />);

    const validFile = new File(["pdf binary"], "scanned.pdf", {
      type: "application/pdf",
    });
    const input = screen.getByLabelText("Upload PDF document");

    await user.upload(input, validFile);

    expect(
      await screen.findByText("PDF contains no extractable text; OCR is not supported."),
    ).toBeInTheDocument();
  });

  it("displays indeterminate loading state and disables input while uploading", () => {
    vi.mocked(useUploadDocument).mockReturnValueOnce({
      mutateAsync: mockMutateAsync,
      isPending: true,
    } as unknown as ReturnType<typeof useUploadDocument>);

    render(<DocumentUploader assistantId="asst-1" />);

    expect(
      screen.getByText("Uploading & vectorizing document..."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Upload PDF document")).toBeDisabled();
  });
});
