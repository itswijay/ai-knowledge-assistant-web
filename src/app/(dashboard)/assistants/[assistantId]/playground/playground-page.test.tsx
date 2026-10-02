import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as chatApi from "@/lib/api/chat";
import { ApiError } from "@/lib/api/errors";
import {
  useAssistant,
  useAssistantDocuments,
} from "@/features/assistants/use-assistant";
import { useOrganization } from "@/features/organizations/use-organization";
import type { Assistant, Document } from "@/types/domain";
import PlaygroundPage from "./page";

vi.mock("next/navigation", () => ({
  useParams: () => ({ assistantId: "asst-1" }),
}));

vi.mock("@/features/organizations/use-organization", () => ({
  useOrganization: vi.fn(),
}));

vi.mock("@/features/assistants/use-assistant", () => ({
  useAssistant: vi.fn(),
  useAssistantDocuments: vi.fn(),
}));

vi.mock("@/lib/api/chat", () => ({
  sendChatMessage: vi.fn(),
}));

const mockAssistant: Assistant = {
  id: "asst-1",
  organizationId: "org-1",
  name: "Acme Helper",
  description: "Knowledge assistant for Acme corp",
  welcomeMessage: "Welcome to Acme Support! How can I assist you?",
  assistantInstructions: "Answer questions using facts only.",
  logoUrl: null,
  primaryColor: "#0f766e",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const mockDocs: Document[] = [
  {
    id: "doc-1",
    assistantId: "asst-1",
    originalFilename: "handbook.pdf",
    createdAt: "2026-01-01T00:00:00Z",
  },
];

describe("PlaygroundPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    // Provide scrollIntoView mock for jsdom
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("renders assistant welcome message, document count, and status banner", () => {
    render(<PlaygroundPage />);

    expect(
      screen.getByText("Welcome to Acme Support! How can I assist you?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Interactive Testing Playground")).toBeInTheDocument();
    expect(screen.getByText("1 document indexed")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset conversation" })).toBeInTheDocument();
  });

  it("displays helpful banner when 0 documents are uploaded", () => {
    vi.mocked(useAssistantDocuments).mockReturnValueOnce({
      documents: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<PlaygroundPage />);

    expect(
      screen.getByText(/No documents uploaded yet. Grounded answers require knowledge documents/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Upload PDFs/i })).toHaveAttribute(
      "href",
      "/assistants/asst-1/knowledge",
    );
  });

  it("validates 2,000 character limit and disables submission", async () => {
    const user = userEvent.setup();
    render(<PlaygroundPage />);

    const textarea = screen.getByRole("textbox", { name: "Ask a question" });
    const sendButton = screen.getByRole("button", { name: "Send message" });

    // Initially blank -> disabled
    expect(sendButton).toBeDisabled();

    // Type valid message
    await user.type(textarea, "Hello");
    expect(screen.getByText("5 / 2,000")).toBeInTheDocument();
    expect(sendButton).not.toBeDisabled();
  });

  it("sends question on Enter key and displays grounded answer with source", async () => {
    const user = userEvent.setup();
    vi.mocked(chatApi.sendChatMessage).mockResolvedValueOnce({
      answer: "The refund window is 14 days according to our policy.",
      sources: [{ document: "handbook.pdf", page: 3 }],
    });

    render(<PlaygroundPage />);

    const textarea = screen.getByRole("textbox", { name: "Ask a question" });
    await user.type(textarea, "What is the refund window?{enter}");

    await waitFor(() => {
      expect(chatApi.sendChatMessage).toHaveBeenCalledWith("asst-1", {
        message: "What is the refund window?",
      });
      expect(
        screen.getByText("The refund window is 14 days according to our policy."),
      ).toBeInTheDocument();
      expect(screen.getByText("1 Source cited")).toBeInTheDocument();
    });
  });

  it("renders backend fallback response as normal assistant answer without error", async () => {
    const user = userEvent.setup();
    const fallback =
      "I couldn't find enough information in the knowledge base to answer that question.";

    vi.mocked(chatApi.sendChatMessage).mockResolvedValueOnce({
      answer: fallback,
      sources: [],
    });

    render(<PlaygroundPage />);

    const textarea = screen.getByRole("textbox", { name: "Ask a question" });
    const sendButton = screen.getByRole("button", { name: "Send message" });

    await user.type(textarea, "Who won the 1994 World Cup?");
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(fallback)).toBeInTheDocument();
    });
    // No error alerts or citations rendered
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/source cited/i)).not.toBeInTheDocument();
  });

  it("handles 502 service error with retry affordance that resubmits question", async () => {
    const user = userEvent.setup();
    vi.mocked(chatApi.sendChatMessage).mockRejectedValueOnce(
      new ApiError(502, "Bad Gateway"),
    );

    render(<PlaygroundPage />);

    const textarea = screen.getByRole("textbox", { name: "Ask a question" });
    await user.type(textarea, "How to request time off?{enter}");

    await waitFor(() => {
      expect(
        screen.getByText(/AI generation service is temporarily unavailable/i),
      ).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole("button", { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();

    // Now mock success for retry
    vi.mocked(chatApi.sendChatMessage).mockResolvedValueOnce({
      answer: "Submit requests via the portal 2 weeks in advance.",
      sources: [{ document: "handbook.pdf", page: 10 }],
    });

    await user.click(retryBtn);

    await waitFor(() => {
      expect(chatApi.sendChatMessage).toHaveBeenCalledTimes(2);
      expect(
        screen.getByText("Submit requests via the portal 2 weeks in advance."),
      ).toBeInTheDocument();
    });
  });

  it("resets conversation when Reset chat button is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(chatApi.sendChatMessage).mockResolvedValueOnce({
      answer: "Answer to question",
      sources: [],
    });

    render(<PlaygroundPage />);

    const textarea = screen.getByRole("textbox", { name: "Ask a question" });
    await user.type(textarea, "First question{enter}");

    await waitFor(() => {
      expect(screen.getByText("Answer to question")).toBeInTheDocument();
    });

    const resetBtn = screen.getByRole("button", { name: "Reset conversation" });
    await user.click(resetBtn);

    // Question and answer are cleared, only welcome message remains
    expect(screen.queryByText("First question")).not.toBeInTheDocument();
    expect(screen.queryByText("Answer to question")).not.toBeInTheDocument();
    expect(
      screen.getByText("Welcome to Acme Support! How can I assist you?"),
    ).toBeInTheDocument();
  });
});
