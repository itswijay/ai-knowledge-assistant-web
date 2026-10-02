"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteDocument,
  listDocuments,
  uploadDocument,
} from "@/lib/api/documents";
import { queryKeys } from "@/lib/query/keys";
import { useOrganization } from "@/features/organizations/use-organization";
import type { Document, DocumentUploadResult } from "@/types/domain";

export function useDocuments(assistantId: string | null) {
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

export function useUploadDocument(assistantId: string | null) {
  const queryClient = useQueryClient();
  const { selectedOrganizationId } = useOrganization();

  return useMutation<DocumentUploadResult, Error, File>({
    mutationFn: (file: File) => {
      if (!assistantId) {
        throw new Error("Assistant ID is required.");
      }
      return uploadDocument(assistantId, file);
    },
    onSuccess: () => {
      if (selectedOrganizationId && assistantId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.organizations.documents(
            selectedOrganizationId,
            assistantId,
          ),
        });
      }
    },
  });
}

export function useDeleteDocument(assistantId: string | null) {
  const queryClient = useQueryClient();
  const { selectedOrganizationId } = useOrganization();

  return useMutation<void, Error, string>({
    mutationFn: (documentId: string) => {
      return deleteDocument(documentId);
    },
    onSuccess: () => {
      if (selectedOrganizationId && assistantId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.organizations.documents(
            selectedOrganizationId,
            assistantId,
          ),
        });
      }
    },
  });
}
