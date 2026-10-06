"use client";

import * as React from "react";
import { Bot, CheckCircle2, Eye, Sparkles } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getReadableTextColor } from "@/lib/utils/contrast";

export interface AssistantLivePreviewProps {
  name: string;
  welcomeMessage: string;
  logoUrl?: string | null;
  primaryColor: string;
}

export function AssistantLivePreview({
  name,
  welcomeMessage,
  logoUrl,
  primaryColor,
}: AssistantLivePreviewProps) {
  const [imgError, setImgError] = React.useState(false);

  // Reset imgError if logoUrl changes
  React.useEffect(() => {
    setImgError(false);
  }, [logoUrl]);

  const fallbackInitial = name.trim().charAt(0).toUpperCase() || "A";
  const validColor = /^#[0-9A-Fa-f]{6}$/.test(primaryColor)
    ? primaryColor
    : "#2563EB";
  const textColor = getReadableTextColor(validColor);

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
      {/* Preview Header */}
      <div className="flex items-center justify-between border-b border-border/80 bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
          <Eye className="size-3.5 text-primary" aria-hidden="true" />
          <span>Live Appearance Preview</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: validColor }}
            aria-hidden="true"
          />
          <span>{validColor}</span>
        </div>
      </div>

      {/* Mockup Container */}
      <div className="p-5 space-y-5 bg-background/50">
        {/* Assistant Header Mockup */}
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-border/70 bg-card shadow-2xs">
          <div className="flex items-center gap-3">
            <Avatar
              size="default"
              className="border shadow-2xs transition-all"
              style={{ borderColor: validColor }}
            >
              {logoUrl && !imgError ? (
                <AvatarImage
                  src={logoUrl}
                  alt={name}
                  onError={() => setImgError(true)}
                />
              ) : null}
              <AvatarFallback
                style={{
                  backgroundColor: validColor,
                  color: textColor,
                }}
                className="font-semibold text-xs transition-colors"
              >
                {fallbackInitial}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-sm font-semibold text-foreground">
                  {name || "Assistant"}
                </span>
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: validColor }}
                  title="Branding color"
                />
              </div>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Sparkles className="size-3 text-primary" aria-hidden="true" />
                Grounded AI Assistant
              </span>
            </div>
          </div>

          <div
            className="rounded-full px-2 py-0.5 text-[10px] font-medium border"
            style={{
              borderColor: `${validColor}40`,
              backgroundColor: `${validColor}15`,
              color: validColor,
            }}
          >
            Active
          </div>
        </div>

        {/* Live Welcome Message Bubble Mockup */}
        <div className="space-y-2">
          <span className="text-[11px] font-medium text-muted-foreground px-1 uppercase tracking-wider">
            Welcome Greeting Mockup
          </span>

          <div className="flex items-start gap-2.5 max-w-md">
            <Avatar
              size="sm"
              className="border shrink-0 mt-0.5"
              style={{ borderColor: validColor }}
            >
              {logoUrl && !imgError ? (
                <AvatarImage src={logoUrl} alt={name} />
              ) : null}
              <AvatarFallback
                style={{
                  backgroundColor: validColor,
                  color: textColor,
                }}
                className="font-semibold text-[10px]"
              >
                {fallbackInitial}
              </AvatarFallback>
            </Avatar>

            <div className="rounded-2xl rounded-tl-xs border border-border/70 bg-card p-3.5 text-xs text-foreground shadow-2xs space-y-1">
              <p className="whitespace-pre-wrap leading-relaxed select-none">
                {welcomeMessage || "Hello! How can I help you today?"}
              </p>
            </div>
          </div>
        </div>

        {/* Contrast & Accessibility Verification Card */}
        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 p-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-primary" aria-hidden="true" />
            <span>Readable text contrast verified</span>
          </div>
          <span
            className="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold"
            style={{
              backgroundColor: validColor,
              color: textColor,
            }}
          >
            Aa sample
          </span>
        </div>
      </div>
    </div>
  );
}
