import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  useAssistant,
  useAssistantDocuments,
} from "@/features/assistants/use-assistant";
import type { Assistant, Document } from "@/types/domain";
import AssistantOverviewPage from "./page";

vi.mock("next/navigation", () => ({
  useParams: () => ({ assistantId: "asst-1" }),
}));

vi.mock("@/features/assistants/use-assistant", () => ({
  useAssistant: vi.fn(),
  useAssistantDocuments: vi.fn(),
}));

const mockAssistant: Assistant = {
  id: "asst-uuid-1234",
  organizationId: "org-1",
  name: "Support Assistant",
  description: "Handles product support",
  welcomeMessage: "Welcome to support! How can I help?",
  assistantInstructions: "Answer only from retrieved context.",
  logoUrl: null,
  primaryColor: "#2563EB",
  createdAt: "2026-01-01T12:00:00Z",
  updatedAt: "2026-01-05T12:00:00Z",
};

const mockDocs: Document[] = [
  {
    id: "doc-1",
    assistantId: "asst-uuid-1234",
    originalFilename: "policy.pdf",
    createdAt: "2026-01-02T12:00:00Z",
  },
  {
    id: "doc-2",
    assistantId: "asst-uuid-1234",
    originalFilename: "faq.pdf",
    createdAt: "2026-01-03T12:00:00Z",
  },
];

describe("AssistantOverviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAssistant).mockReturnValue({
      assistant: mockAssistant,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    vi.mocked(useAssistantDocuments).mockReturnValue({
      documents: mockDocs,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it("renders overview stats, document count, and branding details", () => {
    render(<AssistantOverviewPage />);

    // Document count
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("documents uploaded")).toBeInTheDocument();

    // Primary color hex
    expect(screen.getByText("#2563EB")).toBeInTheDocument();

    // Instructions and welcome message preview
    expect(
      screen.getByText("Welcome to support! How can I help?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Answer only from retrieved context."),
    ).toBeInTheDocument();

    // Metadata
    expect(screen.getByText("asst-uuid-1234")).toBeInTheDocument();
  });

  it("copies assistant ID to clipboard", async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<AssistantOverviewPage />);

    await user.click(screen.getByRole("button", { name: "Copy assistant ID" }));

    expect(writeTextMock).toHaveBeenCalledWith("asst-uuid-1234");
  });
});
