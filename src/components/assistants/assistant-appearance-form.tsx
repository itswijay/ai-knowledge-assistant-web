"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Palette, RefreshCw, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  appearanceSchema,
  type AppearanceValues,
} from "@/features/assistants/assistant-schemas";
import { useUpdateAssistant } from "@/features/assistants/use-assistant";
import { useUnsavedChanges } from "@/features/assistants/use-unsaved-changes";
import { ApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import type { UpdateAssistantRequest } from "@/types/api";
import type { Assistant } from "@/types/domain";

export const PRESET_COLORS = [
  { name: "Deep Teal", hex: "#0f766e" },
  { name: "Royal Blue", hex: "#2563EB" },
  { name: "Indigo", hex: "#4f46e5" },
  { name: "Emerald", hex: "#059669" },
  { name: "Amber", hex: "#d97706" },
  { name: "Crimson", hex: "#dc2626" },
  { name: "Slate", hex: "#475569" },
];

export interface AssistantAppearanceFormProps {
  assistant: Assistant;
  onValuesChange?: (values: AppearanceValues) => void;
}

export function AssistantAppearanceForm({
  assistant,
  onValuesChange,
}: AssistantAppearanceFormProps) {
  const updateMutation = useUpdateAssistant(assistant.id);
  const [generalError, setGeneralError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<AppearanceValues>({
    resolver: zodResolver(appearanceSchema),
    defaultValues: {
      welcomeMessage: assistant.welcomeMessage,
      logoUrl: assistant.logoUrl || "",
      primaryColor: assistant.primaryColor,
    },
    mode: "onChange",
  });

  // Reset form when assistant updates
  React.useEffect(() => {
    reset({
      welcomeMessage: assistant.welcomeMessage,
      logoUrl: assistant.logoUrl || "",
      primaryColor: assistant.primaryColor,
    });
  }, [assistant, reset]);

  // Notify parent of live changes for immediate preview
  const watchedValues = watch();
  React.useEffect(() => {
    onValuesChange?.(watchedValues);
  }, [watchedValues.welcomeMessage, watchedValues.logoUrl, watchedValues.primaryColor, onValuesChange]);

  useUnsavedChanges(isDirty);

  const welcomeMessageValue = watchedValues.welcomeMessage || "";
  const selectedColor = watchedValues.primaryColor || assistant.primaryColor;

  const onSubmit = async (values: AppearanceValues) => {
    setGeneralError(null);

    // Compute delta - only send changed fields in PATCH
    const delta: UpdateAssistantRequest = {};

    if (values.welcomeMessage.trim() !== assistant.welcomeMessage) {
      delta.welcome_message = values.welcomeMessage.trim();
    }

    const trimmedLogo = values.logoUrl?.trim() || null;
    if (trimmedLogo !== assistant.logoUrl) {
      delta.logo_url = trimmedLogo;
    }

    if (
      values.primaryColor.toLowerCase() !== assistant.primaryColor.toLowerCase()
    ) {
      delta.primary_color = values.primaryColor;
    }

    // If nothing changed, do nothing
    if (Object.keys(delta).length === 0) {
      toast.info("No appearance changes to save.");
      return;
    }

    try {
      await updateMutation.mutateAsync(delta);
      toast.success("Appearance settings updated successfully.");
      reset({
        welcomeMessage: values.welcomeMessage.trim(),
        logoUrl: trimmedLogo || "",
        primaryColor: values.primaryColor,
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
        setGeneralError("An unexpected error occurred while saving appearance.");
      }
    }
  };

  const handleReset = () => {
    reset({
      welcomeMessage: assistant.welcomeMessage,
      logoUrl: assistant.logoUrl || "",
      primaryColor: assistant.primaryColor,
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

      {/* Welcome Message */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="welcome-message" className="text-sm font-medium">
            Welcome Message <span className="text-destructive">*</span>
          </Label>
          <span
            id="welcome-message-count"
            className={cn(
              "text-[11px] tabular-nums",
              welcomeMessageValue.length > 500
                ? "text-destructive font-semibold"
                : "text-muted-foreground",
            )}
            aria-live="polite"
          >
            {welcomeMessageValue.length} / 500
          </span>
        </div>
        <textarea
          id="welcome-message"
          rows={3}
          {...register("welcomeMessage")}
          aria-invalid={Boolean(errors.welcomeMessage)}
          aria-describedby={
            errors.welcomeMessage
              ? "welcome-message-error"
              : "welcome-message-desc"
          }
          placeholder="e.g. Hi! How can I help you today?"
          className={cn(
            "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
            errors.welcomeMessage && "border-destructive focus-visible:border-destructive",
          )}
        />
        {errors.welcomeMessage ? (
          <p id="welcome-message-error" className="text-xs text-destructive">
            {errors.welcomeMessage.message}
          </p>
        ) : (
          <p id="welcome-message-desc" className="text-xs text-muted-foreground">
            The initial message end users see when opening the assistant chat.
          </p>
        )}
      </div>

      {/* Logo URL */}
      <div className="space-y-2">
        <Label htmlFor="logo-url" className="text-sm font-medium">
          Logo Image URL (optional)
        </Label>
        <div className="relative">
          <Input
            id="logo-url"
            type="url"
            {...register("logoUrl")}
            aria-invalid={Boolean(errors.logoUrl)}
            aria-describedby={
              errors.logoUrl ? "logo-url-error" : "logo-url-desc"
            }
            placeholder="https://example.com/logo.png"
            className="pr-8"
          />
          {watchedValues.logoUrl ? (
            <button
              type="button"
              onClick={() => setValue("logoUrl", "", { shouldDirty: true })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear logo URL"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
        {errors.logoUrl ? (
          <p id="logo-url-error" className="text-xs text-destructive">
            {errors.logoUrl.message}
          </p>
        ) : (
          <p id="logo-url-desc" className="text-xs text-muted-foreground">
            Direct public link to a PNG, JPEG, or SVG logo. If left blank, the assistant uses initial fallback branding.
          </p>
        )}
      </div>

      {/* Primary Brand Color */}
      <div className="space-y-3">
        <Label htmlFor="primary-color" className="text-sm font-medium">
          Primary Brand Color <span className="text-destructive">*</span>
        </Label>

        {/* Color Presets */}
        <div
          role="group"
          aria-label="Color presets"
          className="flex flex-wrap items-center gap-2"
        >
          {PRESET_COLORS.map((preset) => {
            const isSelected =
              selectedColor.toLowerCase() === preset.hex.toLowerCase();
            return (
              <button
                key={preset.hex}
                type="button"
                onClick={() =>
                  setValue("primaryColor", preset.hex, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                title={preset.name}
                aria-label={preset.name}
                aria-pressed={isSelected}
                className={cn(
                  "relative flex size-7 items-center justify-center rounded-full border shadow-2xs transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isSelected
                    ? "ring-2 ring-primary ring-offset-2 scale-110"
                    : "border-border/80",
                )}
                style={{ backgroundColor: preset.hex }}
              >
                {isSelected ? (
                  <Check
                    className="size-3.5 text-white drop-shadow-sm"
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Hex code & Color Picker Input */}
        <div className="flex items-center gap-2 max-w-xs">
          <div className="relative size-8 shrink-0 overflow-hidden rounded-md border border-input shadow-2xs">
            <input
              type="color"
              id="color-picker"
              value={
                /^#[0-9A-Fa-f]{6}$/.test(selectedColor)
                  ? selectedColor
                  : "#2563EB"
              }
              onChange={(e) =>
                setValue("primaryColor", e.target.value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              className="absolute -inset-2 size-12 cursor-pointer border-0 p-0"
              aria-label="Pick custom color"
            />
          </div>

          <Input
            id="primary-color"
            type="text"
            {...register("primaryColor")}
            aria-invalid={Boolean(errors.primaryColor)}
            aria-describedby={
              errors.primaryColor ? "primary-color-error" : undefined
            }
            placeholder="#2563EB"
            className="font-mono text-xs uppercase"
          />
        </div>
        {errors.primaryColor ? (
          <p id="primary-color-error" className="text-xs text-destructive">
            {errors.primaryColor.message}
          </p>
        ) : null}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        {isDirty ? (
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            You have unsaved appearance changes.
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            All changes are saved.
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
