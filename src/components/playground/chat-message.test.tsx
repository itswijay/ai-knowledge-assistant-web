import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { ChatMessageItem } from "@/features/chat";
import { ChatMessage } from "./chat-message";

describe("ChatMessage", () => {
  it("renders user message bubble and sender info", () => {
    const message: ChatMessageItem = {
      id: "u-1",
      role: "user",
      content: "Can I get a refund after 14 days?",
      timestamp: Date.now(),
    };

    render(<ChatMessage message={message} />);

    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("Can I get a refund after 14 days?")).toBeInTheDocument();
  });

  it("renders user message with error banner and functional retry button", async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();

    const message: ChatMessageItem = {
      id: "u-failed",
      role: "user",
      content: "Failed question",
      error: "Upstream AI service error (502)",
      timestamp: Date.now(),
    };

    render(<ChatMessage message={message} onRetry={handleRetry} />);

    expect(screen.getByText("Upstream AI service error (502)")).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();

    await user.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledWith("u-failed");
  });

  it("renders assistant message with assistant name, initial, and content", () => {
    const message: ChatMessageItem = {
      id: "a-1",
      role: "assistant",
      content: "Refunds are processed within 5 business days.",
      timestamp: Date.now(),
    };

    render(
      <ChatMessage
        message={message}
        assistantName="Finance Bot"
        assistantColor="#0d9488"
      />,
    );

    expect(screen.getByText("Finance Bot")).toBeInTheDocument();
    expect(screen.getByText("F")).toBeInTheDocument();
    expect(
      screen.getByText("Refunds are processed within 5 business days."),
    ).toBeInTheDocument();
  });

  it("renders thinking animation when assistant message is pending", () => {
    const message: ChatMessageItem = {
      id: "a-pending",
      role: "assistant",
      content: "",
      isPending: true,
      timestamp: Date.now(),
    };

    render(<ChatMessage message={message} assistantName="DocBot" />);

    expect(screen.getByLabelText("Assistant is thinking")).toBeInTheDocument();
    expect(screen.getByText("Thinking...")).toBeInTheDocument();
  });

  it("renders sources disclosure when assistant message includes citations", () => {
    const message: ChatMessageItem = {
      id: "a-sources",
      role: "assistant",
      content: "According to company policy, remote work is supported.",
      sources: [{ document: "policy.pdf", page: 7 }],
      timestamp: Date.now(),
    };

    render(<ChatMessage message={message} assistantName="HR Assistant" />);

    expect(screen.getByText("1 Source cited")).toBeInTheDocument();
  });
});
