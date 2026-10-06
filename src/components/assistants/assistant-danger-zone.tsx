"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeleteAssistant } from "@/features/assistants/use-assistant";
import { ApiError } from "@/lib/api/errors";
import type { Assistant } from "@/types/domain";

export interface AssistantDangerZoneProps {
  assistant: Assistant;
}

export function AssistantDangerZone({ assistant }: AssistantDangerZoneProps) {
  const router = useRouter();
  const deleteMutation = useDeleteAssistant(assistant.id);

  const [isOpen, setIsOpen] = React.useState(false);
  const [confirmationInput, setConfirmationInput] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const isConfirmed = confirmationInput.trim() === assistant.name.trim();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setConfirmationInput("");
      setErrorMessage(null);
    }
  };

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setErrorMessage(null);

    try {
      await deleteMutation.mutateAsync();
      toast.success(`Assistant "${assistant.name}" deleted successfully.`);
      handleOpenChange(false);
      router.push("/assistants");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.isForbidden) {
          setErrorMessage(
            "You do not have permission to delete assistants in this organization. Only Organization Owners and Admins can delete assistants.",
          );
          return;
        }
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected error occurred while deleting the assistant.");
      }
    }
  };

  return (
    <>
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-destructive font-heading font-semibold text-base">
          <AlertTriangle className="size-5 shrink-0" aria-hidden="true" />
          <span>Danger Zone</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <h3 className="text-sm font-semibold text-foreground">
              Delete this assistant
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Permanently delete <strong className="text-foreground">{assistant.name}</strong>,
              including all its uploaded PDF documents, vector embeddings, and indexed chunks.
              This action cannot be undone.
            </p>
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => handleOpenChange(true)}
            className="shrink-0 gap-1.5"
            aria-label={`Delete ${assistant.name}`}
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            Delete assistant
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5 shrink-0" aria-hidden="true" />
              <span>Delete assistant permanently?</span>
            </DialogTitle>
            <DialogDescription className="text-xs pt-1.5 leading-relaxed text-muted-foreground">
              This action cannot be undone. All documents, chunk embeddings, and settings
              associated with <strong className="text-foreground">{assistant.name}</strong> will be
              permanently purged from your organization.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {errorMessage ? (
              <Alert variant="destructive">
                <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-2">
              <Label
                id="delete-confirmation-instructions"
                htmlFor="delete-confirmation-input"
                className="text-xs font-medium"
              >
                To confirm deletion, please type{" "}
                <span className="font-semibold text-foreground select-all">
                  {assistant.name}
                </span>{" "}
                below:
              </Label>
              <Input
                id="delete-confirmation-input"
                type="text"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder={assistant.name}
                autoComplete="off"
                aria-describedby="delete-confirmation-instructions"
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={!isConfirmed || deleteMutation.isPending}
              className="gap-1.5"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  <span>Permanently delete assistant</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
