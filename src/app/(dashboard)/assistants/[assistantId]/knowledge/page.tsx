"use client";

import { BookOpen } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";

export default function KnowledgeStubPage() {
  return (
    <EmptyState
      icon={<BookOpen aria-hidden="true" />}
      title="Knowledge Management"
      description="PDF document uploads, chunking, and vector index management will be implemented in Step 8."
    />
  );
}
