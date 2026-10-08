import type { Metadata } from "next";

import { SignupForm } from "@/components/auth/signup-form";
import { getSafeNextPath } from "@/lib/auth/redirects";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create an account for kdok.",
};

type SignupPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const next = Array.isArray(params.next) ? params.next[0] : params.next;

  return <SignupForm nextPath={getSafeNextPath(next)} />;
}
