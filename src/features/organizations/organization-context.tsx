"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createOrganization, listOrganizations } from "@/lib/api/organizations";
import { SELECTED_ORGANIZATION_STORAGE_KEY } from "@/lib/auth/storage";
import { queryKeys } from "@/lib/query/keys";
import type { Organization } from "@/types/domain";

export type OrganizationContextValue = {
  organizations: Organization[];
  selectedOrganizationId: string | null;
  selectedOrganization: Organization | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  switchOrganization: (organizationId: string) => void;
  createOrganization: (name: string) => Promise<Organization>;
  isCreating: boolean;
};

export const OrganizationContext = React.createContext<
  OrganizationContextValue | undefined
>(undefined);

export function OrganizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const [selectedId, setSelectedId] = React.useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem(SELECTED_ORGANIZATION_STORAGE_KEY);
    }
    return null;
  });

  const {
    data: organizations = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.organizations.list(),
    queryFn: () => listOrganizations(),
  });

  // Reconcile selected organization with fetched organizations
  React.useEffect(() => {
    if (isLoading) return;

    if (organizations.length === 0) {
      if (selectedId !== null) {
        setSelectedId(null);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(SELECTED_ORGANIZATION_STORAGE_KEY);
        }
      }
      return;
    }

    const isValidSelection = organizations.some((org) => org.id === selectedId);
    if (!isValidSelection) {
      const defaultOrgId = organizations[0].id;
      setSelectedId(defaultOrgId);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SELECTED_ORGANIZATION_STORAGE_KEY, defaultOrgId);
      }
    }
  }, [organizations, selectedId, isLoading]);

  const switchOrganization = React.useCallback(
    (newOrgId: string) => {
      const targetOrg = organizations.find((org) => org.id === newOrgId);
      if (!targetOrg) return;

      const oldOrgId = selectedId;
      if (oldOrgId && oldOrgId !== newOrgId) {
        // 1. Cancel in-flight queries under the old organization prefix
        void queryClient.cancelQueries({ queryKey: ["organization", oldOrgId] });
        // 2. Remove old organization-scoped queries from cache
        queryClient.removeQueries({ queryKey: ["organization", oldOrgId] });
      }

      setSelectedId(newOrgId);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SELECTED_ORGANIZATION_STORAGE_KEY, newOrgId);
      }

      // If user is inside an assistant workspace or not on home, route to home
      if (pathname !== "/" && (pathname.startsWith("/assistants") || pathname.startsWith("/settings"))) {
        router.push("/");
      }
    },
    [organizations, selectedId, queryClient, pathname, router],
  );

  const createMutation = useMutation({
    mutationFn: (name: string) => createOrganization({ name }),
    onSuccess: (newOrg) => {
      queryClient.setQueryData(queryKeys.organizations.list(), (old: Organization[] = []) => {
        if (old.some((o) => o.id === newOrg.id)) return old;
        return [...old, newOrg];
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.list(),
      });
      setSelectedId(newOrg.id);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SELECTED_ORGANIZATION_STORAGE_KEY, newOrg.id);
      }
      toast.success(`Organization "${newOrg.name}" created.`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create organization.");
    },
  });

  const selectedOrganization =
    organizations.find((org) => org.id === selectedId) ?? null;

  const value = React.useMemo<OrganizationContextValue>(
    () => ({
      organizations,
      selectedOrganizationId: selectedId,
      selectedOrganization,
      isLoading,
      isError,
      error: error as Error | null,
      switchOrganization,
      createOrganization: (name: string) => createMutation.mutateAsync(name),
      isCreating: createMutation.isPending,
    }),
    [
      organizations,
      selectedId,
      selectedOrganization,
      isLoading,
      isError,
      error,
      switchOrganization,
      createMutation,
    ],
  );

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}
