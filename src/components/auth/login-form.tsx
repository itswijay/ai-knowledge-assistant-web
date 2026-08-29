"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { PasswordInput } from "@/components/auth/password-input";
import { LoadingButton } from "@/components/common/loading-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginValues } from "@/features/auth/schemas";
import { getAuthScreenPath } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/client";

type LoginFormProps = {
  nextPath: string;
  callbackError?: boolean;
};

export function LoginForm({ nextPath, callbackError = false }: LoginFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(
    callbackError
      ? "That authentication link is invalid or has expired. Please sign in again."
      : null,
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      setFormError("Unable to sign in. Check your email and password.");
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  return (
    <>
      <div>
        <h1 className="font-heading text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
          Sign in to manage your AI assistants.
        </p>
      </div>

      {formError ? (
        <Alert className="mt-5" variant="destructive">
          <CircleAlert aria-hidden="true" />
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
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
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
          loadingText="Signing in"
        >
          Sign in
        </LoadingButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Knowledge Assistant?{" "}
        <Link
          className="whitespace-nowrap font-medium text-foreground underline-offset-4 hover:underline"
          href={getAuthScreenPath("/signup", nextPath)}
        >
          Create an account
        </Link>
      </p>
    </>
  );
}
