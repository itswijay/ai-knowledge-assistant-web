"use client";

import { Settings } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";

export default function AssistantSettingsStubPage() {
  return (
    <EmptyState
      icon={<Settings aria-hidden="true" />}
      title="Assistant Settings"
      description="Assistant rename, instructions customization, and danger zone deletion will be implemented in Step 10."
    />
  );
}
