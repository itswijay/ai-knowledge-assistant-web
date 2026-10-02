"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createAssistant, getAssistant } from "@/lib/api/assistants";
import { listDocuments } from "@/lib/api/documents";
import { queryKeys } from "@/lib/query/keys";
import { useOrganization } from "@/features/organizations/use-organization";
import type { CreateAssistantRequest } from "@/types/api";
import type { Assistant, Document } from "@/types/domain";

export function useAssistant(assistantId: string | null) {
  const { selectedOrganizationId } = useOrganization();

  const query = useQuery<Assistant>({
    queryKey:
      selectedOrganizationId && assistantId
        ? queryKeys.organizations.assistant(selectedOrganizationId, assistantId)
        : ["organization", "null", "assistant", assistantId ?? "null"],
    queryFn: () => {
      if (!assistantId) {
        return Promise.reject(new Error("Assistant ID is required"));
      }
      return getAssistant(assistantId);
    },
    enabled: Boolean(selectedOrganizationId && assistantId),
    retry: (failureCount, error) => {
      // Do not retry 404 or 403 errors
      if ("status" in error && (error.status === 404 || error.status === 403)) {
        return false;
      }
      return failureCount < 1;
    },
  });

  return {
    assistant: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

export function useAssistantDocuments(assistantId: string | null) {
  const { selectedOrganizationId } = useOrganization();

  const query = useQuery<Document[]>({
    queryKey:
      selectedOrganizationId && assistantId
        ? queryKeys.organizations.documents(selectedOrganizationId, assistantId)
        : ["organization", "null", "assistant", assistantId ?? "null", "documents"],
    queryFn: () => {
      if (!assistantId) {
        return Promise.resolve([]);
      }
      return listDocuments(assistantId);
    },
    enabled: Boolean(selectedOrganizationId && assistantId),
  });

  return {
    documents: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

export function useCreateAssistant() {
  const queryClient = useQueryClient();
  const { selectedOrganizationId } = useOrganization();

  return useMutation({
    mutationFn: (payload: CreateAssistantRequest) => {
      if (!selectedOrganizationId) {
        throw new Error("No organization selected.");
      }
      return createAssistant(selectedOrganizationId, payload);
    },
    onSuccess: (newAssistant) => {
      if (selectedOrganizationId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.organizations.assistants(selectedOrganizationId),
        });
      }
    },
  });
}
