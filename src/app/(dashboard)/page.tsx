"use client";

import Link from "next/link";
import { ArrowRight, Bot, Building2, Settings2 } from "lucide-react";

import { ContentContainer } from "@/components/common/content-container";
import { PageHeader } from "@/components/common/page-header";
import { PageSkeleton } from "@/components/common/page-skeleton";
import { Button } from "@/components/ui/button";
import { OrganizationOnboarding } from "@/features/organizations/organization-onboarding";
import { useOrganization } from "@/features/organizations/use-organization";

export default function Home() {
  const {
    organizations,
    selectedOrganization,
    isLoading,
  } = useOrganization();

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

  return (
    <ContentContainer>
      <PageHeader
        title={selectedOrganization?.name ?? "Home"}
        description="Organization workspace and knowledge assistant management."
      />

      <div className="pt-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex size-10 items-center justify-center rounded-lg border bg-background text-primary">
                <Bot className="size-5" />
              </div>
              <h2 className="font-heading text-lg font-semibold">AI Assistants</h2>
              <p className="text-sm text-muted-foreground">
                Manage, customize branding, and train assistants on your private PDF documents.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Full assistant management available in Step 6
              </span>
              <Button variant="ghost" size="sm" asChild disabled>
                <span>
                  View assistants
                  <ArrowRight className="size-4" data-icon="inline-end" />
                </span>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex size-10 items-center justify-center rounded-lg border bg-background text-primary">
                <Settings2 className="size-5" />
              </div>
              <h2 className="font-heading text-lg font-semibold">Organization Settings</h2>
              <p className="text-sm text-muted-foreground">
                Review organization identifier, timestamps, and current tenant configuration.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Tenant: {selectedOrganization?.name}
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings">
                  View settings
                  <ArrowRight className="size-4" data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-dashed bg-muted/40 p-5 flex items-start gap-3 text-sm text-muted-foreground">
          <Building2 className="size-5 shrink-0 mt-0.5 text-primary" />
          <div className="space-y-1">
            <p className="font-medium text-foreground">Multi-tenant isolation active</p>
            <p className="text-xs text-muted-foreground">
              All vector queries, documents, and assistants are strictly isolated to{" "}
              <strong className="text-foreground">{selectedOrganization?.name}</strong>.
              Use the sidebar organization switcher to switch between organizations anytime.
            </p>
          </div>
        </div>
      </div>
    </ContentContainer>
  );
}
