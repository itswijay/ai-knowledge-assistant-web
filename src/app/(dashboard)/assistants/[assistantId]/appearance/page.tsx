"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Palette, Sparkles } from "lucide-react";

import { AssistantAppearanceForm } from "@/components/assistants/assistant-appearance-form";
import { AssistantLivePreview } from "@/components/assistants/assistant-live-preview";
import type { AppearanceValues } from "@/features/assistants/assistant-schemas";
import { useAssistant } from "@/features/assistants/use-assistant";

export default function AssistantAppearancePage() {
  const params = useParams<{ assistantId: string }>();
  const assistantId = params.assistantId;

  const { assistant } = useAssistant(assistantId);
  const [liveValues, setLiveValues] = React.useState<AppearanceValues | null>(
    null,
  );

  if (!assistant) {
    return null;
  }

  const welcomeMessage =
    liveValues?.welcomeMessage ?? assistant.welcomeMessage;
  const logoUrl =
    liveValues?.logoUrl !== undefined ? liveValues.logoUrl : assistant.logoUrl;
  const primaryColor =
    liveValues?.primaryColor ?? assistant.primaryColor;

  return (
    <div className="space-y-6">
      {/* Information Header */}
      <div className="rounded-xl border bg-muted/30 p-4 space-y-1.5">
        <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
          <Palette className="size-4 text-primary" aria-hidden="true" />
          <span>Branding & Appearance</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Customize how your assistant looks to your organization and end users.
          Edits to your welcome message, brand color, and logo update in the live preview
          in real-time and only modified fields are saved.
        </p>
      </div>

      {/* Two-Column Form + Live Preview Grid */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 rounded-xl border bg-card p-6 shadow-xs">
          <AssistantAppearanceForm
            assistant={assistant}
            onValuesChange={setLiveValues}
          />
        </div>

        {/* Right Column: Sticky Live Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
          <AssistantLivePreview
            name={assistant.name}
            welcomeMessage={welcomeMessage}
            logoUrl={logoUrl}
            primaryColor={primaryColor}
          />
        </div>
      </div>
    </div>
  );
}
