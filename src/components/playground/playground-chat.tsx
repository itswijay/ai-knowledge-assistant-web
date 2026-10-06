"use client";

import * as React from "react";
import { BookOpen, Info, RotateCcw, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useChat } from "@/features/chat";
import type { Assistant } from "@/types/domain";
import { ChatInput } from "./chat-input";
import { ChatMessage } from "./chat-message";

export interface PlaygroundChatProps {
  assistant: Assistant;
  documentCount?: number;
}

export function PlaygroundChat({ assistant, documentCount = 0 }: PlaygroundChatProps) {
  const {
    messages,
    isSending,
    sendMessage,
    retryQuestion,
    resetChat,
  } = useChat({
    assistantId: assistant.id,
    initialWelcomeMessage: assistant.welcomeMessage,
  });

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages or pending changes without stealing focus, respecting prefers-reduced-motion
  React.useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    messagesEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [messages.length, isSending]);

  return (
    <div className="flex flex-col h-[min(680px,calc(100svh-12rem))] min-h-[460px] rounded-xl border border-border bg-card shadow-xs overflow-hidden">
      {/* Playground Header / Status Bar */}
      <div className="flex items-center justify-between border-b border-border/80 bg-muted/30 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className="size-2 rounded-full"
            style={{ backgroundColor: assistant.primaryColor }}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-heading text-sm font-semibold text-foreground">
                Testing Session
              </span>
              <span className="rounded-full border border-border/70 bg-background/80 px-2 py-0.2 font-mono text-[10px] text-muted-foreground">
                In-Memory
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <BookOpen className="size-3 text-primary" aria-hidden="true" />
              {documentCount === 1
                ? "1 document indexed"
                : `${documentCount} documents indexed`}
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={resetChat}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          aria-label="Reset conversation"
        >
          <RotateCcw className="size-3" aria-hidden="true" />
          <span>Reset chat</span>
        </Button>
      </div>

      {/* Messages Scroll Area */}
      <div
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5"
        role="log"
        aria-live="polite"
        aria-label="Conversation history"
      >
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            assistantName={assistant.name}
            assistantColor={assistant.primaryColor}
            assistantLogoUrl={assistant.logoUrl}
            onRetry={retryQuestion}
          />
        ))}

        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* Fixed Composer at Bottom */}
      <div className="border-t border-border/80 bg-background/90 p-4 shrink-0 backdrop-blur-xs">
        <ChatInput onSend={sendMessage} isPending={isSending} />
      </div>
    </div>
  );
}
