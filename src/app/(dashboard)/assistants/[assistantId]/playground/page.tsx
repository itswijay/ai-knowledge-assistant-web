"use client";

import { MessageSquare } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";

export default function PlaygroundStubPage() {
  return (
    <EmptyState
      icon={<MessageSquare aria-hidden="true" />}
      title="Testing Playground"
      description="Interactive grounded chat with document citations and confidence thresholds will be implemented in Step 9."
    />
  );
}
