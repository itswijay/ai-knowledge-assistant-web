"use client";

import * as React from "react";
import Link from "next/link";
import { Bot, Plus, Search, X } from "lucide-react";

import { AssistantCard } from "@/components/assistants/assistant-card";
import { AssistantListSkeleton } from "@/components/assistants/assistant-list-skeleton";
import { ContentContainer } from "@/components/common/content-container";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAssistants } from "@/features/assistants/use-assistants";
import { useOrganization } from "@/features/organizations/use-organization";

export default function AssistantsPage() {
  const { selectedOrganization, selectedOrganizationId } = useOrganization();
  const { assistants, isLoading, isError, error, refetch } =
    useAssistants(selectedOrganizationId);
  const [searchQuery, setSearchQuery] = React.useState("");

  if (!selectedOrganizationId) {
    return (
      <ContentContainer>
        <PageHeader
          title="Assistants"
          description="Manage AI knowledge assistants for your organization."
        />
        <div className="pt-6">
          <EmptyState
            icon={<Bot aria-hidden="true" />}
            title="No organization selected"
            description="Please select or create an organization to view assistants."
          />
        </div>
      </ContentContainer>
    );
  }

  const filteredAssistants = assistants.filter((asst) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      asst.name.toLowerCase().includes(q) ||
      (asst.description && asst.description.toLowerCase().includes(q))
    );
  });

  return (
    <ContentContainer>
      <PageHeader
        title="Assistants"
        description={`Manage knowledge assistants for ${selectedOrganization?.name ?? "your organization"}.`}
        actions={
          <Button asChild>
            <Link href="/assistants/new">
              <Plus aria-hidden="true" data-icon="inline-start" />
              New assistant
            </Link>
          </Button>
        }
      />

      <div className="pt-6 space-y-6">
        {isLoading ? (
          <AssistantListSkeleton />
        ) : isError ? (
          <ErrorState
            title="Unable to load assistants"
            description={error?.message || "An unexpected error occurred while loading assistants."}
            action={
              <Button onClick={() => void refetch()} variant="outline">
                Try again
              </Button>
            }
          />
        ) : assistants.length === 0 ? (
          <EmptyState
            icon={<Bot aria-hidden="true" />}
            title="No assistants yet"
            description="Create your first assistant to begin uploading private documents and answering grounded questions."
            action={
              <Button asChild>
                <Link href="/assistants/new">
                  <Plus aria-hidden="true" data-icon="inline-start" />
                  Create assistant
                </Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="text"
                  placeholder="Search assistants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8"
                  aria-label="Search assistants"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="size-3.5" />
                  </button>
                ) : null}
              </div>

              <span className="text-xs text-muted-foreground">
                {filteredAssistants.length} of {assistants.length}{" "}
                {assistants.length === 1 ? "assistant" : "assistants"}
              </span>
            </div>

            {filteredAssistants.length === 0 ? (
              <EmptyState
                title="No matching assistants"
                description={`No assistants match "${searchQuery}".`}
                action={
                  <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                    Clear search
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAssistants.map((assistant) => (
                  <AssistantCard key={assistant.id} assistant={assistant} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </ContentContainer>
  );
}
