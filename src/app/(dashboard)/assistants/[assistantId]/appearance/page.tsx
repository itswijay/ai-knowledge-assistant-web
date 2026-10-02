"use client";

import { Palette } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";

export default function AppearanceStubPage() {
  return (
    <EmptyState
      icon={<Palette aria-hidden="true" />}
      title="Assistant Appearance"
      description="Live appearance customization (welcome message, brand color, logo URL) will be implemented in Step 10."
    />
  );
}
