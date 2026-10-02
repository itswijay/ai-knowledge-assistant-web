"use client";

import * as React from "react";
import { BookOpen, ChevronDown, ChevronUp, FileText } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ChatSource } from "@/types/domain";

export interface SourceCitationsProps {
  sources: ChatSource[];
  className?: string;
  defaultExpanded?: boolean;
}

export function SourceCitations({
  sources,
  className,
  defaultExpanded = false,
}: SourceCitationsProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  if (!sources || sources.length === 0) {
    return null;
  }

  const disclosureId = React.useId();

  return (
    <div
      className={cn(
        "mt-3 rounded-lg border border-border/80 bg-background/60 text-xs overflow-hidden",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        aria-controls={disclosureId}
        className="flex w-full items-center justify-between px-3 py-2 text-left font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <BookOpen className="size-3.5 text-primary" aria-hidden="true" />
          <span>
            {sources.length === 1 ? "1 Source cited" : `${sources.length} Sources cited`}
          </span>
        </span>
        {isExpanded ? (
          <ChevronUp className="size-3.5 text-muted-foreground" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
        )}
      </button>

      {isExpanded ? (
        <div
          id={disclosureId}
          className="border-t border-border/60 bg-muted/20 px-3 py-2 space-y-1.5"
        >
          {sources.map((source, index) => (
            <div
              key={`${source.document}-${source.page}-${index}`}
              className="flex items-center justify-between gap-2 rounded-md border border-border/50 bg-background/80 px-2.5 py-1.5 shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span
                  className="truncate text-[11px] font-medium text-foreground select-all"
                  title={source.document}
                >
                  {source.document}
                </span>
              </div>
              <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
                Page {source.page}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
