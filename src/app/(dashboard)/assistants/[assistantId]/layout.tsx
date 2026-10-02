"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Bot } from "lucide-react";

import { AssistantWorkspaceNav } from "@/components/assistants/assistant-workspace-nav";
import { ContentContainer } from "@/components/common/content-container";
import { ErrorState } from "@/components/common/error-state";
import { PageSkeleton } from "@/components/common/page-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAssistant } from "@/features/assistants/use-assistant";
import { ApiError } from "@/lib/api/errors";

export default function AssistantWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ assistantId: string }>();
  const assistantId = params.assistantId;

  const { assistant, isLoading, isError, error, refetch } =
    useAssistant(assistantId);

  if (isLoading) {
    return (
      <ContentContainer>
        <PageSkeleton />
      </ContentContainer>
    );
  }

  if (isError || !assistant) {
    const isNotFound =
      (error instanceof ApiError && error.isNotFound) ||
      error?.message?.includes("404");

    return (
      <ContentContainer>
        <div className="pt-6">
          <ErrorState
            title={isNotFound ? "Assistant unavailable" : "Unable to load assistant"}
            description={
              isNotFound
                ? "This assistant does not exist or you do not have permission to view it in this organization."
                : error?.message || "An unexpected error occurred while loading this assistant."
            }
            action={
              isNotFound ? (
                <Button asChild>
                  <Link href="/assistants">Back to assistants</Link>
                </Button>
              ) : (
                <Button onClick={() => void refetch()} variant="outline">
                  Try again
                </Button>
              )
            }
          />
        </div>
      </ContentContainer>
    );
  }

  const initial = assistant.name.charAt(0).toUpperCase() || "A";

  return (
    <ContentContainer>
      <div className="space-y-6">
        <div>
          <Link
            href="/assistants"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Back to assistants
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Avatar
              size="lg"
              className="border shadow-xs"
              style={{ borderColor: assistant.primaryColor }}
            >
              {assistant.logoUrl ? (
                <AvatarImage src={assistant.logoUrl} alt={assistant.name} />
              ) : null}
              <AvatarFallback
                style={{
                  backgroundColor: `${assistant.primaryColor}15`,
                  color: assistant.primaryColor,
                }}
                className="font-semibold text-sm"
              >
                {initial}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-xl font-semibold text-foreground">
                  {assistant.name}
                </h1>
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: assistant.primaryColor }}
                  title={`Branding color: ${assistant.primaryColor}`}
                />
              </div>
              {assistant.description ? (
                <p className="text-xs text-muted-foreground max-w-xl line-clamp-2">
                  {assistant.description}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <AssistantWorkspaceNav assistantId={assistant.id} />

        <div className="pt-2">{children}</div>
      </div>
    </ContentContainer>
  );
}
