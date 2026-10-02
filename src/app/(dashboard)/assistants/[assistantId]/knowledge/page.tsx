"use client";

import { useParams } from "next/navigation";
import { BookOpen, ShieldCheck } from "lucide-react";

import { DocumentList } from "@/components/knowledge/document-list";
import { DocumentUploader } from "@/components/knowledge/document-uploader";

export default function KnowledgePage() {
  const params = useParams<{ assistantId: string }>();
  const assistantId = params.assistantId;

  return (
    <div className="space-y-8">
      {/* Knowledge Information Banner */}
      <div className="rounded-xl border bg-muted/30 p-5 space-y-2">
        <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
          <BookOpen className="size-4 text-primary" />
          <span>Knowledge Ingestion & Grounding</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Uploaded PDF documents are parsed page-by-page, split into overlapping chunks, embedded
          using Gemini 768-dimensional vectors, and stored in PostgreSQL with pgvector. The assistant
          will strictly answer questions from these documents and provide exact page citations.
        </p>
        <div className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground font-medium">
          <ShieldCheck className="size-3.5 text-primary" />
          <span>Refusal over hallucination active: ungrounded queries return fallback answers</span>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="space-y-3">
        <h2 className="font-heading text-sm font-semibold text-foreground">
          Upload Documents
        </h2>
        <DocumentUploader assistantId={assistantId} />
      </div>

      {/* Document List */}
      <div className="space-y-3 pt-2">
        <h2 className="font-heading text-sm font-semibold text-foreground">
          Knowledge Base Documents
        </h2>
        <DocumentList assistantId={assistantId} />
      </div>
    </div>
  );
}
