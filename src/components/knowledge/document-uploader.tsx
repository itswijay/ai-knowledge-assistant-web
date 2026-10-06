"use client";

import * as React from "react";
import { CircleAlert, FileUp, LoaderCircle, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useUploadDocument } from "@/features/documents/use-documents";
import { ApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MiB

export function DocumentUploader({ assistantId }: { assistantId: string }) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const uploadMutation = useUploadDocument(assistantId);
  const isPending = uploadMutation.isPending;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setErrorMessage(null);

    // 1. Client-side extension precheck
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Only PDF documents are supported.");
      return;
    }

    // 2. Client-side size precheck (10 MiB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage("File exceeds the maximum upload limit of 10 MiB.");
      return;
    }

    try {
      const result = await uploadMutation.mutateAsync(file);
      toast.success(
        `Successfully uploaded "${result.originalFilename}" (${result.processedPageCount} ${
          result.processedPageCount === 1 ? "page" : "pages"
        }, ${result.chunkCount} chunks).`,
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isForbidden) {
          setErrorMessage(
            "You do not have permission to upload documents. Owner or Admin role required.",
          );
          return;
        }
        if (err.isPayloadTooLarge) {
          setErrorMessage("File exceeds the backend upload limit of 10 MiB.");
          return;
        }
        if (err.status === 422) {
          setErrorMessage(
            err.message ||
              "Unable to process PDF. Ensure the file is not password-protected and contains digital extractable text (OCR is not supported).",
          );
          return;
        }
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected error occurred during document upload.");
      }
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isPending) setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isPending) {
      void handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4">
      {errorMessage ? (
        <Alert variant="destructive">
          <CircleAlert className="size-4" />
          <AlertTitle>Upload Failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 sm:p-8 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-sidebar-ring/60 bg-muted/20",
          isPending && "pointer-events-none opacity-60",
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          disabled={isPending}
          onChange={(e) => void handleFiles(e.target.files)}
          className="sr-only"
          id="pdf-upload-input"
          aria-label="Upload PDF document"
        />

        {isPending ? (
          <div role="status" aria-live="polite" className="flex flex-col items-center gap-3 py-4">
            <LoaderCircle className="size-8 text-primary animate-spin" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Uploading & vectorizing document...
              </p>
              <p className="text-xs text-muted-foreground">
                Parsing pages, generating embeddings, and storing vectors in pgvector.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="flex size-12 items-center justify-center rounded-full bg-background border shadow-xs text-primary">
              <UploadCloud className="size-6" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Drag and drop your PDF here, or{" "}
                <label
                  htmlFor="pdf-upload-input"
                  className="cursor-pointer text-primary hover:underline font-medium focus-within:outline-none"
                >
                  browse files
                </label>
              </p>
              <p className="text-xs text-muted-foreground">
                PDF format only with digital extractable text • Up to 10 MiB per file
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
            >
              <FileUp className="size-3.5" data-icon="inline-start" />
              Select PDF
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
