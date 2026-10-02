"use client";

import * as React from "react";
import { Building2, Check, Copy, Info } from "lucide-react";
import { toast } from "sonner";

import { ContentContainer } from "@/components/common/content-container";
import { PageHeader } from "@/components/common/page-header";
import { PageSkeleton } from "@/components/common/page-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useOrganization } from "@/features/organizations/use-organization";

export default function OrganizationSettingsPage() {
  const { selectedOrganization, isLoading } = useOrganization();
  const [copied, setCopied] = React.useState(false);

  if (isLoading) {
    return (
      <ContentContainer>
        <PageSkeleton />
      </ContentContainer>
    );
  }

  if (!selectedOrganization) {
    return (
      <ContentContainer>
        <PageHeader
          title="Organization Settings"
          description="Manage your organization profile."
        />
        <div className="pt-6">
          <Alert>
            <Info className="size-4" />
            <AlertTitle>No organization selected</AlertTitle>
            <AlertDescription>
              Select or create an organization using the sidebar to view settings.
            </AlertDescription>
          </Alert>
        </div>
      </ContentContainer>
    );
  }

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(selectedOrganization.id);
      setCopied(true);
      toast.success("Organization ID copied to clipboard.");
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
    <ContentContainer>
      <PageHeader
        title="Organization Settings"
        description="View tenant details and system configuration."
      />

      <div className="pt-6 space-y-6">
        <div className="rounded-xl border bg-card p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg border bg-background text-primary">
              <Building2 className="size-5" />
            </span>
            <div>
              <h2 className="font-heading text-lg font-semibold text-card-foreground">
                Organization Profile
              </h2>
              <p className="text-xs text-muted-foreground">
                Read-only summary of the current active organization.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Organization Name</span>
              <p className="font-medium text-foreground">{selectedOrganization.name}</p>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Organization ID</span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleCopyId}
                  aria-label="Copy organization ID"
                >
                  {copied ? (
                    <Check className="size-3 text-primary" />
                  ) : (
                    <Copy className="size-3 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="font-mono text-xs text-foreground truncate select-all">
                {selectedOrganization.id}
              </p>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Created Date</span>
              <p className="text-sm text-foreground">{formatDate(selectedOrganization.createdAt)}</p>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Last Updated</span>
              <p className="text-sm text-foreground">{formatDate(selectedOrganization.updatedAt)}</p>
            </div>
          </div>
        </div>

        <Alert>
          <Info className="size-4" />
          <AlertTitle>Team and role management</AlertTitle>
          <AlertDescription>
            Team member invitations, role management, and organization updates are not yet
            supported by the backend API. Organization members inherit permissions configured
            during onboarding.
          </AlertDescription>
        </Alert>
      </div>
    </ContentContainer>
  );
}
