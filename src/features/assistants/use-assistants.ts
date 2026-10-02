"use client";

import { useQuery } from "@tanstack/react-query";

import { listAssistants } from "@/lib/api/assistants";
import { queryKeys } from "@/lib/query/keys";
import type { Assistant } from "@/types/domain";

export function useAssistants(organizationId: string | null) {
  const query = useQuery<Assistant[]>({
    queryKey: organizationId
      ? queryKeys.organizations.assistants(organizationId)
      : ["organization", "null", "assistants"],
    queryFn: () => {
      if (!organizationId) {
        return Promise.resolve([]);
      }
      return listAssistants(organizationId);
    },
    enabled: Boolean(organizationId),
  });

  return {
    assistants: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
