import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as chatApi from "@/lib/api/chat";
import { ApiError } from "@/lib/api/errors";
import { deduplicateSources, useChat } from "./use-chat";

vi.mock("@/lib/api/chat", () => ({
  sendChatMessage: vi.fn(),
}));

describe("useChat hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with assistant welcome message", () => {
    const { result } = renderHook(() =>
      useChat({
        assistantId: "asst-1",
        initialWelcomeMessage: "Welcome to Acme Support!",
      }),
    );

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toMatchObject({
      role: "assistant",
      content: "Welcome to Acme Support!",
      sources: [],
    });
    expect(result.current.isSending).toBe(false);
  });

  it("initializes with default welcome message if none provided", () => {
    const { result } = renderHook(() =>
      useChat({
        assistantId: "asst-1",
      }),
    );

    expect(result.current.messages[0].content).toBe(
      "Hello! How can I help you today?",
    );
  });

  it("sends question and populates answer with deduplicated sources", async () => {
    vi.mocked(chatApi.sendChatMessage).mockResolvedValueOnce({
      answer: "The return window is 30 days.",
      sources: [
        { document: "policy.pdf", page: 1 },
        { document: "policy.pdf", page: 1 }, // duplicate
        { document: "returns.pdf", page: 4 },
      ],
    });

    const { result } = renderHook(() =>
      useChat({
        assistantId: "asst-1",
      }),
    );

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.sendMessage("How long do I have to return?");
    });

    expect(success).toBe(true);
    expect(chatApi.sendChatMessage).toHaveBeenCalledWith("asst-1", {
      message: "How long do I have to return?",
    });

    // Initial welcome + user message + assistant answer = 3 messages
    expect(result.current.messages).toHaveLength(3);

    const userMsg = result.current.messages[1];
    expect(userMsg.role).toBe("user");
    expect(userMsg.content).toBe("How long do I have to return?");

    const assistantMsg = result.current.messages[2];
    expect(assistantMsg.role).toBe("assistant");
    expect(assistantMsg.content).toBe("The return window is 30 days.");
    expect(assistantMsg.isPending).toBe(false);
    expect(assistantMsg.sources).toEqual([
      { document: "policy.pdf", page: 1 },
      { document: "returns.pdf", page: 4 },
    ]);
  });

  it("renders fallback response as normal assistant message", async () => {
    const fallbackAnswer =
      "I couldn't find enough information in the knowledge base to answer that question.";

    vi.mocked(chatApi.sendChatMessage).mockResolvedValueOnce({
      answer: fallbackAnswer,
      sources: [],
    });

    const { result } = renderHook(() =>
      useChat({
        assistantId: "asst-1",
      }),
    );

    await act(async () => {
      await result.current.sendMessage("What is the CEO's favorite food?");
    });

    expect(result.current.messages).toHaveLength(3);
    const assistantMsg = result.current.messages[2];
    expect(assistantMsg.content).toBe(fallbackAnswer);
    expect(assistantMsg.sources).toEqual([]);
    expect(assistantMsg.error).toBeUndefined();
  });

  it("rejects blank and whitespace-only messages", async () => {
    const { result } = renderHook(() =>
      useChat({
        assistantId: "asst-1",
      }),
    );

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.sendMessage("     ");
    });

    expect(success).toBe(false);
    expect(chatApi.sendChatMessage).not.toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(1);
  });

  it("rejects messages exceeding 2,000 characters", async () => {
    const { result } = renderHook(() =>
      useChat({
        assistantId: "asst-1",
      }),
    );

    const longMessage = "a".repeat(2001);
    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.sendMessage(longMessage);
    });

    expect(success).toBe(false);
    expect(chatApi.sendChatMessage).not.toHaveBeenCalled();
  });

  it("preserves failed question with error and allows retry on 502 error", async () => {
    vi.mocked(chatApi.sendChatMessage).mockRejectedValueOnce(
      new ApiError(502, "Gemini generation failed"),
    );

    const { result } = renderHook(() =>
      useChat({
        assistantId: "asst-1",
      }),
    );

    await act(async () => {
      await result.current.sendMessage("Tell me about warranty");
    });

    // Welcome + failed user message (pending assistant bubble removed)
    expect(result.current.messages).toHaveLength(2);
    const userMsg = result.current.messages[1];
    expect(userMsg.role).toBe("user");
    expect(userMsg.content).toBe("Tell me about warranty");
    expect(userMsg.error).toContain("AI generation service is temporarily unavailable");
    expect(result.current.lastFailedQuestion).toBe("Tell me about warranty");

    // Retry the failed question
    vi.mocked(chatApi.sendChatMessage).mockResolvedValueOnce({
      answer: "Warranty covers 2 years.",
      sources: [{ document: "warranty.pdf", page: 2 }],
    });

    await act(async () => {
      await result.current.retryQuestion(userMsg.id);
    });

    expect(chatApi.sendChatMessage).toHaveBeenCalledTimes(2);
    // After retry succeeds, messages has new user message and assistant answer
    expect(result.current.messages.some((m) => m.content === "Warranty covers 2 years.")).toBe(
      true,
    );
  });

  it("clears conversation and restores welcome message on resetChat", async () => {
    vi.mocked(chatApi.sendChatMessage).mockResolvedValueOnce({
      answer: "Answer 1",
      sources: [],
    });

    const { result } = renderHook(() =>
      useChat({
        assistantId: "asst-1",
        initialWelcomeMessage: "Welcome!",
      }),
    );

    await act(async () => {
      await result.current.sendMessage("Question 1");
    });

    expect(result.current.messages.length).toBeGreaterThan(1);

    act(() => {
      result.current.resetChat();
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe("Welcome!");
    expect(result.current.lastFailedQuestion).toBeNull();
  });

  it("deduplicateSources correctly handles identical sources and empty list", () => {
    expect(deduplicateSources([])).toEqual([]);
    expect(
      deduplicateSources([
        { document: "a.pdf", page: 1 },
        { document: "a.pdf", page: 1 },
        { document: "a.pdf", page: 2 },
        { document: "b.pdf", page: 1 },
      ]),
    ).toEqual([
      { document: "a.pdf", page: 1 },
      { document: "a.pdf", page: 2 },
      { document: "b.pdf", page: 1 },
    ]);
  });
});
