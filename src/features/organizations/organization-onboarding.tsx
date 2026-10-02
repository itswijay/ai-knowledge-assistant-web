"use client";

import * as React from "react";
import { Building2, Plus } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { CreateOrganizationDialog } from "@/features/organizations/create-organization-dialog";

export function OrganizationOnboarding() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <EmptyState
        icon={<Building2 aria-hidden="true" />}
        title="Welcome! Create your first organization"
        description="Organizations isolate your AI assistants, private documents, and vector knowledge base. Create an organization to begin."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus aria-hidden="true" data-icon="inline-start" />
            Create organization
          </Button>
        }
      />
      <CreateOrganizationDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
