"use client";

import Link from "next/link";
import { ArrowRight, Bot, Building2, Plus, Settings2 } from "lucide-react";

import { AssistantCard } from "@/components/assistants/assistant-card";
import { ContentContainer } from "@/components/common/content-container";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { PageSkeleton } from "@/components/common/page-skeleton";
import { Button } from "@/components/ui/button";
import { useAssistants } from "@/features/assistants/use-assistants";
import { OrganizationOnboarding } from "@/features/organizations/organization-onboarding";
import { useOrganization } from "@/features/organizations/use-organization";

export default function Home() {
  const {
    organizations,
    selectedOrganization,
    selectedOrganizationId,
    isLoading: isOrgLoading,
  } = useOrganization();

  const {
    assistants,
    isLoading: isAssistantsLoading,
  } = useAssistants(selectedOrganizationId);

  const isLoading = isOrgLoading || isAssistantsLoading;

  if (isLoading) {
    return (
      <ContentContainer>
        <PageSkeleton />
      </ContentContainer>
    );
  }

  if (organizations.length === 0) {
    return (
      <ContentContainer>
        <PageHeader
          title="Home"
          description="Get started with your AI Knowledge Assistant."
        />
        <div className="pt-6">
          <OrganizationOnboarding />
        </div>
      </ContentContainer>
    );
  }

  const recentAssistants = [...assistants]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 3);

  return (
    <ContentContainer>
      <PageHeader
        title={selectedOrganization?.name ?? "Home"}
        description="Organization workspace and knowledge assistant management."
        actions={
          <Button asChild>
            <Link href="/assistants/new">
              <Plus aria-hidden="true" data-icon="inline-start" />
              New assistant
            </Link>
          </Button>
        }
      />

      <div className="pt-6 space-y-8">
        {/* Real metrics row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">
                Total Assistants
              </span>
              <Bot className="size-4 text-primary" />
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-heading text-2xl font-bold text-foreground">
                {assistants.length}
              </span>
              <Button variant="ghost" size="xs" asChild>
                <Link href="/assistants">
                  Manage
                  <ArrowRight className="size-3" data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">
                Active Tenant
              </span>
              <Building2 className="size-4 text-primary" />
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-heading text-base font-semibold text-foreground truncate max-w-[180px]">
                {selectedOrganization?.name}
              </span>
              <Button variant="ghost" size="xs" asChild>
                <Link href="/settings">
                  Settings
                  <ArrowRight className="size-3" data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider">
                Knowledge Ingestion
              </span>
              <Settings2 className="size-4 text-primary" />
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">
                Grounding & PDF RAG enabled
              </span>
              <Button variant="ghost" size="xs" asChild>
                <Link href="/assistants">
                  View
                  <ArrowRight className="size-3" data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Recently Updated Assistants section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base font-semibold text-foreground">
                Recently Updated Assistants
              </h2>
              <p className="text-xs text-muted-foreground">
                Assistants customized or updated recently in {selectedOrganization?.name}.
              </p>
            </div>

            {assistants.length > 0 ? (
              <Button variant="outline" size="sm" asChild>
                <Link href="/assistants">
                  View all ({assistants.length})
                  <ArrowRight className="size-3.5" data-icon="inline-end" />
                </Link>
              </Button>
            ) : null}
          </div>

          {assistants.length === 0 ? (
            <EmptyState
              icon={<Bot aria-hidden="true" />}
              title="No assistants created yet"
              description="Create your first assistant to begin uploading private PDF documents and running grounded vector Q&A."
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentAssistants.map((assistant) => (
                <AssistantCard key={assistant.id} assistant={assistant} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ContentContainer>
  );
}
