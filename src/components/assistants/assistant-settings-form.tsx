"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  settingsSchema,
  type SettingsValues,
} from "@/features/assistants/assistant-schemas";
import { useUpdateAssistant } from "@/features/assistants/use-assistant";
import { useUnsavedChanges } from "@/features/assistants/use-unsaved-changes";
import { ApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import type { UpdateAssistantRequest } from "@/types/api";
import type { Assistant } from "@/types/domain";

export interface AssistantSettingsFormProps {
  assistant: Assistant;
}

export function AssistantSettingsForm({
  assistant,
}: AssistantSettingsFormProps) {
  const updateMutation = useUpdateAssistant(assistant.id);
  const [generalError, setGeneralError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: assistant.name,
      description: assistant.description || "",
      assistantInstructions: assistant.assistantInstructions,
    },
    mode: "onChange",
  });

  // Re-hydrate form if assistant changes
  React.useEffect(() => {
    reset({
      name: assistant.name,
      description: assistant.description || "",
      assistantInstructions: assistant.assistantInstructions,
    });
  }, [assistant, reset]);

  useUnsavedChanges(isDirty);

  const nameValue = watch("name") || "";
  const descriptionValue = watch("description") || "";
  const instructionsValue = watch("assistantInstructions") || "";

  const onSubmit = async (values: SettingsValues) => {
    setGeneralError(null);

    // Compute delta - only send changed fields in PATCH
    const delta: UpdateAssistantRequest = {};

    if (values.name.trim() !== assistant.name) {
      delta.name = values.name.trim();
    }

    const trimmedDescription = values.description?.trim() || null;
    if (trimmedDescription !== assistant.description) {
      delta.description = trimmedDescription;
    }

    if (
      values.assistantInstructions.trim() !== assistant.assistantInstructions
    ) {
      delta.assistant_instructions = values.assistantInstructions.trim();
    }

    if (Object.keys(delta).length === 0) {
      toast.info("No configuration changes to save.");
      return;
    }

    try {
      await updateMutation.mutateAsync(delta);
      toast.success("Assistant settings saved successfully.");
      reset({
        name: values.name.trim(),
        description: trimmedDescription || "",
        assistantInstructions: values.assistantInstructions.trim(),
      });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.isForbidden) {
          setGeneralError(
            "You do not have permission to modify this assistant. Owner or Admin role required.",
          );
          return;
        }
        setGeneralError(err.message);
      } else if (err instanceof Error) {
        setGeneralError(err.message);
      } else {
        setGeneralError("An unexpected error occurred while saving settings.");
      }
    }
  };

  const handleReset = () => {
    reset({
      name: assistant.name,
      description: assistant.description || "",
      assistantInstructions: assistant.assistantInstructions,
    });
    setGeneralError(null);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {generalError ? (
        <Alert variant="destructive">
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      ) : null}

      {/* Assistant Name */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="assistant-name" className="text-sm font-medium">
            Assistant Name <span className="text-destructive">*</span>
          </Label>
          <span
            className={cn(
              "text-[11px] tabular-nums",
              nameValue.length > 100
                ? "text-destructive font-semibold"
                : "text-muted-foreground",
            )}
          >
            {nameValue.length} / 100
          </span>
        </div>
        <Input
          id="assistant-name"
          type="text"
          {...register("name")}
          aria-invalid={Boolean(errors.name)}
          placeholder="e.g. Warranty Support Assistant"
        />
        {errors.name ? (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        ) : null}
      </div>

      {/* Assistant Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="assistant-description" className="text-sm font-medium">
            Description (optional)
          </Label>
          <span
            className={cn(
              "text-[11px] tabular-nums",
              descriptionValue.length > 1000
                ? "text-destructive font-semibold"
                : "text-muted-foreground",
            )}
          >
            {descriptionValue.length} / 1,000
          </span>
        </div>
        <Input
          id="assistant-description"
          type="text"
          {...register("description")}
          aria-invalid={Boolean(errors.description)}
          placeholder="e.g. Answers product and warranty questions from uploaded PDF manuals"
        />
        {errors.description ? (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            A short summary of what this assistant helps with, shown in assistant lists and navigation.
          </p>
        )}
      </div>

      {/* Assistant Instructions (strictly customer-facing instructions, NEVER named system_prompt) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="assistant-instructions" className="text-sm font-medium">
            Assistant Instructions <span className="text-destructive">*</span>
          </Label>
          <span
            className={cn(
              "text-[11px] tabular-nums",
              instructionsValue.length > 4000
                ? "text-destructive font-semibold"
                : "text-muted-foreground",
            )}
          >
            {instructionsValue.length} / 4,000
          </span>
        </div>
        <textarea
          id="assistant-instructions"
          rows={5}
          {...register("assistantInstructions")}
          aria-invalid={Boolean(errors.assistantInstructions)}
          placeholder="Provide guiding rules for your assistant (e.g. Answer questions in a polite tone and cite warranty terms directly)..."
          className={cn(
            "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 font-mono text-xs leading-relaxed",
            errors.assistantInstructions && "border-destructive focus-visible:border-destructive",
          )}
        />
        {errors.assistantInstructions ? (
          <p className="text-xs text-destructive">
            {errors.assistantInstructions.message}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Customer-facing guidance controlling tone and refusal boundaries during grounded question answering.
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        {isDirty ? (
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            You have unsaved configuration changes.
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            All configuration is up to date.
          </span>
        )}

        <div className="flex items-center gap-2">
          {isDirty ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isSubmitting || updateMutation.isPending}
            >
              Reset
            </Button>
          ) : null}

          <Button
            type="submit"
            size="sm"
            disabled={!isDirty || isSubmitting || updateMutation.isPending}
            className="min-w-24"
          >
            {isSubmitting || updateMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
