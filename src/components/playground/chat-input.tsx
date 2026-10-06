"use client";

import * as React from "react";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  isPending?: boolean;
  placeholder?: string;
  className?: string;
}

const MAX_CHAR_COUNT = 2000;

export function ChatInput({
  onSend,
  disabled = false,
  isPending = false,
  placeholder = "Ask a question about your documents... (Press Enter to send, Shift+Enter for new line)",
  className,
}: ChatInputProps) {
  const [text, setText] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const trimmed = text.trim();
  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHAR_COUNT;
  const canSubmit = trimmed.length > 0 && !isOverLimit && !disabled && !isPending;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!canSubmit) return;

    onSend(trimmed);
    setText("");

    // Keep focus in the input after sending without focus-stealing issues
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative space-y-2", className)}>
      <div className="relative rounded-xl border border-input bg-card shadow-2xs focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 transition-all">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isPending}
          placeholder={placeholder}
          rows={3}
          aria-label="Ask a question"
          aria-invalid={isOverLimit}
          aria-describedby={isOverLimit ? "char-limit-error" : undefined}
          className="w-full resize-none bg-transparent px-3.5 py-3 text-sm placeholder:text-muted-foreground outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />

        <div className="flex items-center justify-between border-t border-border/60 px-3 py-2 bg-muted/10">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-[11px] tabular-nums",
                isOverLimit
                  ? "text-destructive font-semibold"
                  : charCount > 1800
                    ? "text-amber-600 dark:text-amber-400 font-medium"
                    : "text-muted-foreground",
              )}
              aria-live="polite"
            >
              {charCount.toLocaleString()} / {MAX_CHAR_COUNT.toLocaleString()}
            </span>
            {isOverLimit ? (
              <span
                id="char-limit-error"
                role="alert"
                aria-live="assertive"
                className="text-[11px] text-destructive"
              >
                Exceeds 2,000 character limit
              </span>
            ) : null}
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={!canSubmit}
            className="h-8 gap-1.5 px-3 text-xs shadow-xs"
            aria-label="Send message"
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Send className="size-3.5" aria-hidden="true" />
                <span>Send</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
