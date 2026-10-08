import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { getSafeNextPath } from "@/lib/auth/redirects";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to kdok.",
};

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <LoginForm
      nextPath={getSafeNextPath(firstValue(params.next))}
      callbackError={Boolean(firstValue(params.auth_error))}
    />
  );
}
