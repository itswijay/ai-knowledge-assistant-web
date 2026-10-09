"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, RotateCcw, X, Sparkles } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChatInput } from "@/components/playground/chat-input";
import { ChatMessage } from "@/components/playground/chat-message";
import { useChat } from "@/features/chat";
import { getWidgetConfig, sendWidgetChatMessage } from "@/lib/api/widget";
import { getReadableTextColor } from "@/lib/utils/contrast";

interface WidgetPageProps {
  params: Promise<{ assistantId: string }>;
}

export default function WidgetPage({ params }: WidgetPageProps) {
  const resolvedParams = React.use(params);
  const assistantId = resolvedParams.assistantId;

  const {
    data: config,
    isLoading: isConfigLoading,
    isError: isConfigError,
    error: configError,
  } = useQuery({
    queryKey: ["widget-config", assistantId],
    queryFn: () => getWidgetConfig(assistantId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const {
    messages,
    isSending,
    sendMessage,
    retryQuestion,
    resetChat,
  } = useChat({
    assistantId,
    initialWelcomeMessage: config?.welcome_message,
    sendFn: sendWidgetChatMessage,
  });

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    messagesEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [messages.length, isSending]);

  const handleClose = () => {
    if (typeof window !== "undefined" && window.parent) {
      window.parent.postMessage({ type: "kdok:close" }, "*");
    }
  };

  const primaryColor = config?.primary_color || "#2563EB";
  const textColor = getReadableTextColor(primaryColor);
  const assistantName = config?.name || "Assistant";
  const initial = assistantName.charAt(0).toUpperCase() || "K";

  if (isConfigLoading) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center p-6 text-center space-y-3">
        <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
        <p className="text-xs text-muted-foreground">Connecting to knowledge dock...</p>
      </div>
    );
  }

  if (isConfigError || !config) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center p-6 text-center space-y-3">
        <div className="size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <X className="size-5" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">Assistant Unavailable</h2>
        <p className="text-xs text-muted-foreground max-w-xs">
          This knowledge assistant could not be loaded or may have been deleted.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-background select-none">
      {/* Widget Header */}
      <header
        className="flex items-center justify-between px-4 py-3 border-b border-border/80 shadow-2xs shrink-0"
        style={{
          backgroundColor: primaryColor,
          color: textColor,
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="size-8 shrink-0 border border-white/20 shadow-xs">
            {config.logo_url ? (
              <AvatarImage src={config.logo_url} alt={assistantName} />
            ) : null}
            <AvatarFallback
              className="text-xs font-bold"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: textColor,
              }}
            >
              {initial}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col min-w-0">
            <span className="font-heading text-sm font-semibold truncate leading-tight">
              {assistantName}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] opacity-90">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Grounded Knowledge</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={resetChat}
            className="hover:bg-white/20 text-current transition-colors"
            title="Reset conversation"
            aria-label="Reset conversation"
          >
            <RotateCcw className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleClose}
            className="hover:bg-white/20 text-current transition-colors"
            title="Close chat"
            aria-label="Close chat"
          >
            <X className="size-4" />
          </Button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <main
        className="flex-1 overflow-y-auto p-4 space-y-4 select-text"
        role="log"
        aria-live="polite"
        aria-label="Conversation history"
      >
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            assistantName={assistantName}
            assistantColor={primaryColor}
            assistantLogoUrl={config.logo_url}
            onRetry={retryQuestion}
          />
        ))}
        <div ref={messagesEndRef} aria-hidden="true" />
      </main>

      {/* Input Area */}
      <footer className="p-3 border-t border-border/80 bg-card/60 backdrop-blur-xs space-y-2 shrink-0">
        <ChatInput
          onSend={sendMessage}
          isPending={isSending}
          disabled={isSending}
          placeholder="Ask a question..."
          className="text-xs"
        />

        {/* Powered by kdok branding */}
        <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground pt-1">
          <span>Powered by</span>
          <a
            href="https://kdok.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground/80 hover:text-foreground hover:underline transition-colors inline-flex items-center gap-0.5"
          >
            <Sparkles className="size-2.5 text-primary" />
            kdok
          </a>
        </div>
      </footer>
    </div>
  );
}
