"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BookOpen, ExternalLink, MessageSquare, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PlaygroundChat } from "@/components/playground/playground-chat";
import {
  useAssistant,
  useAssistantDocuments,
} from "@/features/assistants/use-assistant";
import { useOrganization } from "@/features/organizations/use-organization";

export default function PlaygroundPage() {
  const params = useParams<{ assistantId: string }>();
  const assistantId = params.assistantId;

  const { selectedOrganizationId } = useOrganization();
  const { assistant } = useAssistant(assistantId);
  const { documents } = useAssistantDocuments(assistantId);

  if (!assistant) {
    return null;
  }

  const documentCount = documents.length;

  return (
    <div className="space-y-6">
      {/* Playground Grounding Context Banner */}
      <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
            <MessageSquare className="size-4 text-primary" aria-hidden="true" />
            <span>Interactive Testing Playground</span>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
            <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
            <span>Refusal over hallucination active</span>
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Test assistant responses in real-time. Grounded answers provide verifiable document and
          page citations from your indexed PDFs. Queries that cannot be verified against the knowledge
          base return standard fallback answers. Chat history is strictly local and never persisted.
        </p>

        {documentCount === 0 ? (
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <span>
                No documents uploaded yet. Grounded answers require knowledge documents. Questions asked now will receive fallback responses.
              </span>
            </div>
            <Button
              variant="outline"
              size="xs"
              asChild
              className="shrink-0 h-7 border-amber-500/30 hover:bg-amber-500/20 text-xs gap-1"
            >
              <Link href={`/assistants/${assistant.id}/knowledge`}>
                Upload PDFs
                <ExternalLink className="size-3" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        ) : null}
      </div>

      {/* Main Interactive Playground (Remounts on Org / Assistant change) */}
      <PlaygroundChat
        key={`${selectedOrganizationId}-${assistant.id}`}
        assistant={assistant}
        documentCount={documentCount}
      />
    </div>
  );
}
