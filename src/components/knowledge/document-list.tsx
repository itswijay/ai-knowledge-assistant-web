"use client";

import * as React from "react";
import { FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteDocument,
  useDocuments,
} from "@/features/documents/use-documents";
import { ApiError } from "@/lib/api/errors";
import type { Document } from "@/types/domain";

export function DocumentList({ assistantId }: { assistantId: string }) {
  const { documents, isLoading, isError, error, refetch } =
    useDocuments(assistantId);
  const deleteMutation = useDeleteDocument(assistantId);

  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleDelete = async (doc: Document) => {
    setDeletingId(doc.id);
    try {
      await deleteMutation.mutateAsync(doc.id);
      toast.success(`Document "${doc.originalFilename}" deleted.`);
    } catch (err) {
      if (err instanceof ApiError && err.isForbidden) {
        toast.error(
          "You do not have permission to delete documents. Owner or Admin role required.",
        );
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to delete document.");
      }
    } finally {
      setDeletingId(null);
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

  if (isLoading) {
    return (
      <div className="space-y-3" aria-label="Loading documents">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-md" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <Skeleton className="size-8 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load documents"
        description={error?.message || "An error occurred while loading documents."}
        action={
          <Button onClick={() => void refetch()} variant="outline" size="sm">
            Try again
          </Button>
        }
      />
    );
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={<FileText aria-hidden="true" />}
        title="No documents uploaded yet"
        description="Upload a PDF manual, warranty policy, or guide above to start grounding this assistant."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          {documents.length} {documents.length === 1 ? "document" : "documents"} indexed in knowledge base
        </span>
      </div>

      <div className="divide-y divide-border rounded-xl border bg-card shadow-xs overflow-hidden">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-primary">
                <FileText className="size-4.5" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="font-medium text-sm text-foreground truncate">
                  {doc.originalFilename}
                </p>
                <p className="text-xs text-muted-foreground">
                  Uploaded {formatDate(doc.createdAt)}
                </p>
              </div>
            </div>

            <ConfirmationDialog
              trigger={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Delete ${doc.originalFilename}`}
                  disabled={deletingId === doc.id}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              }
              title="Delete document?"
              description={`Are you sure you want to delete "${doc.originalFilename}"? All associated text chunks and vector embeddings will be permanently removed from this assistant's knowledge base.`}
              confirmLabel="Delete document"
              destructive
              isPending={deletingId === doc.id}
              onConfirm={() => void handleDelete(doc)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
