"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, MailCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { PasswordInput } from "@/components/auth/password-input";
import { LoadingButton } from "@/components/common/loading-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupSchema, type SignupValues } from "@/features/auth/schemas";
import { getAuthScreenPath } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/client";

export function SignupForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: SignupValues) {
    setFormError(null);
    const supabase = createClient();
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", nextPath);
    const { data, error } = await supabase.auth.signUp({
      ...values,
      options: { emailRedirectTo: callbackUrl.toString() },
    });

    if (error) {
      setFormError("Unable to create your account. Please try again.");
      return;
    }

    if (data.session) {
      router.replace(nextPath);
      router.refresh();
      return;
    }

    setConfirmationEmail(values.email);
  }

  if (confirmationEmail) {
    return (
      <div role="status" aria-live="polite">
        <div className="flex size-10 items-center justify-center rounded-lg bg-success/12 text-success">
          <MailCheck aria-hidden="true" className="size-5" />
        </div>
        <h1 className="mt-5 font-heading text-2xl font-semibold">
          Check your inbox
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          We sent a confirmation link to{" "}
          <span className="font-medium text-foreground">{confirmationEmail}</span>.
          Open it to finish creating your account.
        </p>
        <Link
          className="mt-6 inline-flex text-sm font-medium text-foreground underline-offset-4 hover:underline"
          href={getAuthScreenPath("/login", nextPath)}
        >
          Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <div>
        <h1 className="font-heading text-2xl font-semibold">Create your account</h1>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
          Start building grounded AI assistants for your organization.
        </p>
      </div>

      {formError ? (
        <Alert className="mt-5" variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Account not created</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="h-10"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email ? (
            <p id="email-error" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "password-help password-error" : "password-help"
            }
            {...register("password")}
          />
          <p id="password-help" className="text-xs leading-5 text-muted-foreground">
            Use at least 8 characters.
          </p>
          {errors.password ? (
            <p id="password-error" className="text-sm text-destructive">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <LoadingButton
          className="h-10 w-full"
          type="submit"
          isLoading={isSubmitting}
          loadingText="Creating account"
        >
          Create account
        </LoadingButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          className="font-medium text-foreground underline-offset-4 hover:underline"
          href={getAuthScreenPath("/login", nextPath)}
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
