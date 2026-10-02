"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Check,
  Copy,
  MessageSquare,
  Palette,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  useAssistant,
  useAssistantDocuments,
} from "@/features/assistants/use-assistant";

export default function AssistantOverviewPage() {
  const params = useParams<{ assistantId: string }>();
  const assistantId = params.assistantId;

  const { assistant } = useAssistant(assistantId);
  const { documents, isLoading: isDocsLoading } = useAssistantDocuments(assistantId);
  const [copied, setCopied] = React.useState(false);

  if (!assistant) return null;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(assistant.id);
      setCopied(true);
      toast.success("Assistant ID copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy ID to clipboard.");
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Action & Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Knowledge Card */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">
                Knowledge Base
              </span>
              <BookOpen className="size-4 text-primary" />
            </div>
            <div className="pt-2">
              <span className="font-heading text-2xl font-bold text-foreground">
                {isDocsLoading ? "—" : documents.length}
              </span>
              <p className="text-xs text-muted-foreground">
                {documents.length === 1 ? "document uploaded" : "documents uploaded"}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <Button variant="ghost" size="xs" className="w-full justify-between" asChild>
              <Link href={`/assistants/${assistant.id}/knowledge`}>
                Manage documents
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Playground Card */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">
                Playground
              </span>
              <MessageSquare className="size-4 text-primary" />
            </div>
            <div className="pt-2">
              <span className="font-heading text-sm font-semibold text-foreground">
                Grounded Q&A
              </span>
              <p className="text-xs text-muted-foreground">
                Test query responses with document citations
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <Button variant="ghost" size="xs" className="w-full justify-between" asChild>
              <Link href={`/assistants/${assistant.id}/playground`}>
                Open playground
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Appearance Card */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">
                Appearance
              </span>
              <Palette className="size-4 text-primary" />
            </div>
            <div className="pt-2 flex items-center gap-2">
              <div
                className="size-5 rounded-md border"
                style={{ backgroundColor: assistant.primaryColor }}
              />
              <span className="font-mono text-xs text-foreground">
                {assistant.primaryColor}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <Button variant="ghost" size="xs" className="w-full justify-between" asChild>
              <Link href={`/assistants/${assistant.id}/appearance`}>
                Edit appearance
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Settings Card */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">
                Settings
              </span>
              <Settings className="size-4 text-primary" />
            </div>
            <div className="pt-2">
              <span className="font-heading text-sm font-semibold text-foreground">
                Configuration
              </span>
              <p className="text-xs text-muted-foreground">
                Instructions & danger zone
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <Button variant="ghost" size="xs" className="w-full justify-between" asChild>
              <Link href={`/assistants/${assistant.id}/settings`}>
                View settings
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Assistant Details & Instructions Preview */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-xs space-y-4">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Assistant Behavior & Prompting
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-medium text-muted-foreground">Welcome Message</span>
              <p className="mt-1 rounded-md border bg-muted/30 p-2.5 text-foreground leading-relaxed">
                {assistant.welcomeMessage}
              </p>
            </div>

            <div>
              <span className="font-medium text-muted-foreground">Assistant Instructions</span>
              <p className="mt-1 rounded-md border bg-muted/30 p-2.5 text-foreground font-mono text-[11px] leading-relaxed line-clamp-4">
                {assistant.assistantInstructions}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-xs space-y-4">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Assistant Metadata
          </h2>

          <div className="space-y-3 text-xs">
            <div className="rounded-lg border bg-muted/30 p-3 flex items-center justify-between">
              <div>
                <span className="text-muted-foreground">Assistant ID</span>
                <p className="font-mono text-foreground select-all mt-0.5">{assistant.id}</p>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleCopyId}
                aria-label="Copy assistant ID"
              >
                {copied ? (
                  <Check className="size-3 text-primary" />
                ) : (
                  <Copy className="size-3 text-muted-foreground" />
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-muted/30 p-3">
                <span className="text-muted-foreground">Created</span>
                <p className="text-foreground font-medium mt-0.5">{formatDate(assistant.createdAt)}</p>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3">
                <span className="text-muted-foreground">Last Updated</span>
                <p className="text-foreground font-medium mt-0.5">{formatDate(assistant.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
