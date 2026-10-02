"use client";

import * as React from "react";
import { AlertCircle, Bot, RotateCcw, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ChatMessageItem } from "@/features/chat";
import { cn } from "@/lib/utils";
import { SourceCitations } from "./source-citations";

export interface ChatMessageProps {
  message: ChatMessageItem;
  assistantName?: string;
  assistantColor?: string;
  assistantLogoUrl?: string | null;
  onRetry?: (messageId: string) => void;
}

export function ChatMessage({
  message,
  assistantName = "Assistant",
  assistantColor = "#0f766e",
  assistantLogoUrl,
  onRetry,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const initial = assistantName.charAt(0).toUpperCase() || "A";

  const formattedTime = React.useMemo(() => {
    try {
      return new Date(message.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }, [message.timestamp]);

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1.5 max-w-2xl ml-auto">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground px-1">
          <span>You</span>
          <span>•</span>
          <span>{formattedTime}</span>
        </div>

        <div className="rounded-2xl rounded-tr-xs bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-xs">
          <p className="whitespace-pre-wrap break-words leading-relaxed select-text">
            {message.content}
          </p>
        </div>

        {message.error ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive w-full animate-in fade-in-50 duration-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
              <span>{message.error}</span>
            </div>
            {onRetry ? (
              <Button
                variant="outline"
                size="xs"
                onClick={() => onRetry(message.id)}
                className="shrink-0 h-6 border-destructive/30 hover:bg-destructive/10 hover:text-destructive gap-1 text-xs"
              >
                <RotateCcw className="size-3" aria-hidden="true" />
                Retry
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 max-w-2xl mr-auto">
      <Avatar
        size="sm"
        className="shrink-0 mt-0.5 border shadow-2xs"
        style={{ borderColor: `${assistantColor}40` }}
      >
        {assistantLogoUrl ? (
          <AvatarImage src={assistantLogoUrl} alt={assistantName} />
        ) : null}
        <AvatarFallback
          style={{
            backgroundColor: `${assistantColor}15`,
            color: assistantColor,
          }}
          className="font-semibold text-xs"
        >
          {initial}
        </AvatarFallback>
      </Avatar>

      <div className="space-y-1.5 min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-1">
          <span className="font-medium text-foreground">{assistantName}</span>
          <span>•</span>
          <span>{formattedTime}</span>
        </div>

        <div className="rounded-2xl rounded-tl-xs border border-border/70 bg-card p-4 text-sm shadow-2xs">
          {message.isPending ? (
            <div
              className="flex items-center gap-2 py-1 text-muted-foreground"
              aria-label="Assistant is thinking"
            >
              <div className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.3s]" />
                <span className="size-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]" />
                <span className="size-1.5 rounded-full bg-primary/70 animate-bounce" />
              </div>
              <span className="text-xs font-medium">Thinking...</span>
            </div>
          ) : (
            <>
              <div className="whitespace-pre-wrap break-words leading-relaxed text-foreground select-text">
                {message.content}
              </div>

              {message.sources && message.sources.length > 0 ? (
                <SourceCitations sources={message.sources} />
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
