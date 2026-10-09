"use client";

import * as React from "react";

import { sendChatMessage } from "@/lib/api/chat";
import { ApiError } from "@/lib/api/errors";
import type { ChatResult, ChatSource } from "@/types/domain";

export interface ChatMessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  isPending?: boolean;
  error?: string | null;
  timestamp: number;
}

export interface UseChatOptions {
  assistantId: string;
  initialWelcomeMessage?: string;
  sendFn?: (assistantId: string, payload: { message: string }) => Promise<ChatResult>;
}

export function deduplicateSources(sources: ChatSource[]): ChatSource[] {
  if (!sources || sources.length === 0) return [];
  const seen = new Set<string>();
  const deduped: ChatSource[] = [];

  for (const s of sources) {
    const key = `${s.document}::${s.page}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(s);
    }
  }

  return deduped;
}

function createWelcomeMessage(welcome?: string): ChatMessageItem {
  return {
    id: "welcome-message",
    role: "assistant",
    content: welcome || "Hello! How can I help you today?",
    sources: [],
    timestamp: Date.now(),
  };
}

export function useChat({
  assistantId,
  initialWelcomeMessage,
  sendFn,
}: UseChatOptions) {
  const [messages, setMessages] = React.useState<ChatMessageItem[]>(() => [
    createWelcomeMessage(initialWelcomeMessage),
  ]);
  const [isSending, setIsSending] = React.useState<boolean>(false);
  const [lastFailedQuestion, setLastFailedQuestion] = React.useState<string | null>(null);

  // Sync welcome message if it changes from initial undefined to loaded
  const initialWelcomeRef = React.useRef(initialWelcomeMessage);
  React.useEffect(() => {
    if (initialWelcomeMessage && initialWelcomeMessage !== initialWelcomeRef.current) {
      initialWelcomeRef.current = initialWelcomeMessage;
      setMessages((prev) => {
        if (prev.length === 1 && prev[0].id === "welcome-message") {
          return [createWelcomeMessage(initialWelcomeMessage)];
        }
        return prev;
      });
    }
  }, [initialWelcomeMessage]);

  const sendMessage = React.useCallback(
    async (text: string): Promise<boolean> => {
      const trimmed = text.trim();
      if (!trimmed || trimmed.length > 2000 || isSending) {
        return false;
      }

      const userMsgId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const pendingAsstId = `asst-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      const userMessage: ChatMessageItem = {
        id: userMsgId,
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };

      const pendingAssistantMessage: ChatMessageItem = {
        id: pendingAsstId,
        role: "assistant",
        content: "",
        isPending: true,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage, pendingAssistantMessage]);
      setIsSending(true);
      setLastFailedQuestion(null);

      try {
        const result = sendFn
          ? await sendFn(assistantId, { message: trimmed })
          : await sendChatMessage(assistantId, { message: trimmed });

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === pendingAsstId) {
              return {
                id: pendingAsstId,
                role: "assistant",
                content: result.answer,
                sources: deduplicateSources(result.sources || []),
                isPending: false,
                timestamp: Date.now(),
              };
            }
            return msg;
          }),
        );
        return true;
      } catch (err: unknown) {
        let errorMessage = "Failed to get an answer. Please try again.";

        if (err instanceof ApiError) {
          if (err.isNotFound) {
            errorMessage = "Assistant not found or unavailable in this organization.";
          } else if (err.status === 502 || err.status === 503) {
            errorMessage = "AI generation service is temporarily unavailable. Please retry.";
          } else if (err.isValidationError) {
            errorMessage = "Message length or format was rejected by the server.";
          } else {
            errorMessage = err.message || errorMessage;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setLastFailedQuestion(trimmed);

        // Update: mark user message with error and remove pending assistant bubble
        setMessages((prev) =>
          prev
            .filter((msg) => msg.id !== pendingAsstId)
            .map((msg) => {
              if (msg.id === userMsgId) {
                return {
                  ...msg,
                  error: errorMessage,
                };
              }
              return msg;
            }),
        );
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [assistantId, isSending],
  );

  const retryQuestion = React.useCallback(
    async (failedMessageId?: string): Promise<boolean> => {
      let questionToRetry: string | null = null;

      if (failedMessageId) {
        const target = messages.find((m) => m.id === failedMessageId);
        if (target) {
          questionToRetry = target.content;
          // Clear the error on that message
          setMessages((prev) =>
            prev.map((m) => (m.id === failedMessageId ? { ...m, error: null } : m)),
          );
        }
      }

      if (!questionToRetry) {
        questionToRetry = lastFailedQuestion;
      }

      if (!questionToRetry) {
        return false;
      }

      return sendMessage(questionToRetry);
    },
    [lastFailedQuestion, messages, sendMessage],
  );

  const resetChat = React.useCallback(() => {
    setMessages([createWelcomeMessage(initialWelcomeMessage)]);
    setIsSending(false);
    setLastFailedQuestion(null);
  }, [initialWelcomeMessage]);

  return {
    messages,
    isSending,
    lastFailedQuestion,
    sendMessage,
    retryQuestion,
    resetChat,
  };
}
