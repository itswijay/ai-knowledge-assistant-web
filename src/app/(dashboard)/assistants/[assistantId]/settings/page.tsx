"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Settings } from "lucide-react";

import { AssistantDangerZone } from "@/components/assistants/assistant-danger-zone";
import { AssistantSettingsForm } from "@/components/assistants/assistant-settings-form";
import { useAssistant } from "@/features/assistants/use-assistant";

export default function AssistantSettingsPage() {
  const params = useParams<{ assistantId: string }>();
  const assistantId = params.assistantId;

  const { assistant } = useAssistant(assistantId);

  if (!assistant) {
    return null;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Information Header */}
      <div className="rounded-xl border bg-muted/30 p-4 space-y-1.5">
        <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
          <Settings className="size-4 text-primary" aria-hidden="true" />
          <span>General Settings & Instructions</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Manage assistant name, description, and customer-facing instructions.
          Instructions guide tone, reasoning boundaries, and refusal rules without exposing internal backend prompt scaffolding.
        </p>
      </div>

      {/* Settings Form */}
      <div className="rounded-xl border bg-card p-6 shadow-xs space-y-4">
        <div className="border-b border-border/80 pb-3">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Configuration
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Update your assistant details. Only changed fields will be submitted.
          </p>
        </div>

        <AssistantSettingsForm assistant={assistant} />
      </div>

      {/* Danger Zone */}
      <AssistantDangerZone assistant={assistant} />
    </div>
  );
}
