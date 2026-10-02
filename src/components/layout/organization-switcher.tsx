"use client";

import * as React from "react";
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateOrganizationDialog } from "@/features/organizations/create-organization-dialog";
import { useOrganization } from "@/features/organizations/use-organization";

export function OrganizationSwitcher() {
  const {
    organizations,
    selectedOrganization,
    selectedOrganizationId,
    switchOrganization,
    isLoading,
  } = useOrganization();

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Select organization"
            disabled={isLoading}
            className="flex h-11 w-full items-center gap-2.5 rounded-md px-2 text-left transition-colors hover:bg-sidebar-accent/50 focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none disabled:opacity-50"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-sidebar-border bg-background/70">
              <Building2 aria-hidden="true" className="size-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium">Organization</span>
              <span className="block truncate text-xs text-sidebar-foreground/55">
                {isLoading
                  ? "Loading..."
                  : selectedOrganization
                    ? selectedOrganization.name
                    : "None selected"}
              </span>
            </span>
            <ChevronsUpDown
              aria-hidden="true"
              className="size-3.5 text-sidebar-foreground/55"
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          side="top"
          className="w-56"
        >
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Organizations
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            {organizations.map((org) => {
              const isSelected = org.id === selectedOrganizationId;
              return (
                <DropdownMenuItem
                  key={org.id}
                  onSelect={() => switchOrganization(org.id)}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="truncate">{org.name}</span>
                  {isSelected ? (
                    <Check aria-hidden="true" className="size-4 shrink-0 text-primary" />
                  ) : null}
                </DropdownMenuItem>
              );
            })}
            {organizations.length === 0 && !isLoading ? (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                No organizations yet
              </div>
            ) : null}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => setCreateDialogOpen(true)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Plus aria-hidden="true" className="size-4 shrink-0" />
            <span>Create organization</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateOrganizationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
}
