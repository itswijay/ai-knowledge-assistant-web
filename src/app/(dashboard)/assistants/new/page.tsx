"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ChevronDown, ChevronRight, CircleAlert, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ContentContainer } from "@/components/common/content-container";
import { LoadingButton } from "@/components/common/loading-button";
import { PageHeader } from "@/components/common/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createAssistantSchema,
  type CreateAssistantValues,
} from "@/features/assistants/assistant-schemas";
import { useCreateAssistant } from "@/features/assistants/use-assistant";
import { useOrganization } from "@/features/organizations/use-organization";
import { ApiError } from "@/lib/api/errors";

export default function NewAssistantPage() {
  const router = useRouter();
  const { selectedOrganization } = useOrganization();
  const createMutation = useCreateAssistant();
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [generalError, setGeneralError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateAssistantValues>({
    resolver: zodResolver(createAssistantSchema),
    defaultValues: {
      name: "",
      description: "",
      welcomeMessage: "",
      assistantInstructions: "",
      primaryColor: "#2563EB",
    },
  });

  const primaryColorValue = watch("primaryColor") || "#2563EB";

  const onSubmit = async (values: CreateAssistantValues) => {
    setGeneralError(null);
    try {
      const payload = {
        name: values.name.trim(),
        description: values.description?.trim() || null,
        ...(values.welcomeMessage?.trim()
          ? { welcome_message: values.welcomeMessage.trim() }
          : {}),
        ...(values.assistantInstructions?.trim()
          ? { assistant_instructions: values.assistantInstructions.trim() }
          : {}),
        ...(values.primaryColor?.trim()
          ? { primary_color: values.primaryColor.trim() }
          : {}),
      };

      const newAssistant = await createMutation.mutateAsync(payload);
      toast.success(`Assistant "${newAssistant.name}" created successfully.`);
      router.push(`/assistants/${newAssistant.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isForbidden) {
          setGeneralError(
            "You do not have permission to create assistants in this organization. Only Organization Owners and Admins can create assistants.",
          );
          return;
        }
        if (err.fieldErrors) {
          for (const [field, message] of Object.entries(err.fieldErrors)) {
            setError(field as keyof CreateAssistantValues, { message });
          }
          return;
        }
        setGeneralError(err.message);
      } else if (err instanceof Error) {
        setGeneralError(err.message);
      } else {
        setGeneralError("An unexpected error occurred while creating the assistant.");
      }
    }
  };

  return (
    <ContentContainer>
      <div className="space-y-4">
        <Link
          href="/assistants"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to assistants
        </Link>

        <PageHeader
          title="Create Assistant"
          description={`Add a new knowledge assistant to ${selectedOrganization?.name ?? "your organization"}.`}
        />
      </div>

      <div className="pt-6 max-w-2xl">
        <div className="rounded-xl border bg-card p-6 shadow-xs space-y-6">
          {generalError ? (
            <Alert variant="destructive">
              <CircleAlert className="size-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="assistant-name">
                Assistant name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="assistant-name"
                placeholder="e.g. Warranty Support Assistant"
                autoComplete="off"
                aria-invalid={errors.name ? "true" : "false"}
                aria-describedby={errors.name ? "name-error" : undefined}
                disabled={isSubmitting}
                {...register("name")}
              />
              {errors.name ? (
                <p id="name-error" className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assistant-description">Description (optional)</Label>
              <Input
                id="assistant-description"
                placeholder="e.g. Answers product and warranty questions from PDF manuals"
                autoComplete="off"
                aria-invalid={errors.description ? "true" : "false"}
                aria-describedby={errors.description ? "desc-error" : undefined}
                disabled={isSubmitting}
                {...register("description")}
              />
              {errors.description ? (
                <p id="desc-error" className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              ) : null}
            </div>

            {/* Collapsible advanced section */}
            <div className="border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                aria-expanded={showAdvanced}
              >
                {showAdvanced ? (
                  <ChevronDown className="size-3.5" />
                ) : (
                  <ChevronRight className="size-3.5" />
                )}
                <span>Initial Customization (Optional)</span>
                <Sparkles className="size-3 text-primary" />
              </button>

              {showAdvanced ? (
                <div className="mt-4 space-y-4 rounded-lg border bg-muted/20 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="welcome-msg" className="text-xs">
                      Welcome message
                    </Label>
                    <Input
                      id="welcome-msg"
                      placeholder="Hi! How can I help you today?"
                      disabled={isSubmitting}
                      {...register("welcomeMessage")}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Displayed when a user opens the testing playground.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assistant-instructions" className="text-xs">
                      Assistant instructions
                    </Label>
                    <Input
                      id="assistant-instructions"
                      placeholder="Answer questions using the provided knowledge base."
                      disabled={isSubmitting}
                      {...register("assistantInstructions")}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Customer-facing behavior guidelines for answer synthesis.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primary-color" className="text-xs">
                      Primary branding color
                    </Label>
                    <div className="flex items-center gap-3">
                      <div
                        className="size-8 rounded-md border shadow-xs"
                        style={{ backgroundColor: primaryColorValue }}
                      />
                      <Input
                        id="primary-color"
                        placeholder="#2563EB"
                        className="max-w-[140px] font-mono text-xs"
                        disabled={isSubmitting}
                        {...register("primaryColor")}
                      />
                    </div>
                    {errors.primaryColor ? (
                      <p className="text-xs text-destructive">
                        {errors.primaryColor.message}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button variant="outline" asChild disabled={isSubmitting}>
                <Link href="/assistants">Cancel</Link>
              </Button>
              <LoadingButton
                type="submit"
                isLoading={isSubmitting}
                loadingText="Creating assistant..."
              >
                Create assistant
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>
    </ContentContainer>
  );
}
