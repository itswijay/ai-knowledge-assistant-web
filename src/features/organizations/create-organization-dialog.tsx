"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CircleAlert } from "lucide-react";

import { LoadingButton } from "@/components/common/loading-button";
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
import {
  createOrganizationSchema,
  type CreateOrganizationValues,
} from "@/features/organizations/schemas";
import { useOrganization } from "@/features/organizations/use-organization";
import { ApiError } from "@/lib/api/errors";

export function CreateOrganizationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { createOrganization } = useOrganization();
  const [generalError, setGeneralError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrganizationValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
    },
  });

  React.useEffect(() => {
    if (!open) {
      reset();
      setGeneralError(null);
    }
  }, [open, reset]);

  const onSubmit = async (values: CreateOrganizationValues) => {
    setGeneralError(null);
    try {
      await createOrganization(values.name);
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors.name) {
          setError("name", { message: err.fieldErrors.name });
          return;
        }
        setGeneralError(err.message);
      } else if (err instanceof Error) {
        setGeneralError(err.message);
      } else {
        setGeneralError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create organization</DialogTitle>
          <DialogDescription>
            Organizations isolate assistants, documents, and knowledge retrieval.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {generalError ? (
            <Alert variant="destructive">
              <CircleAlert className="size-4" />
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="org-name">Organization name</Label>
            <Input
              id="org-name"
              placeholder="e.g. Acme Support"
              autoComplete="off"
              aria-invalid={errors.name ? "true" : "false"}
              aria-describedby={errors.name ? "org-name-error" : undefined}
              disabled={isSubmitting}
              {...register("name")}
            />
            {errors.name ? (
              <p id="org-name-error" className="text-xs text-destructive">
                {errors.name.message}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              isLoading={isSubmitting}
              loadingText="Creating..."
            >
              Create organization
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
