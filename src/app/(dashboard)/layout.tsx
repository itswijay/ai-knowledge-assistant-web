import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { OrganizationProvider } from "@/features/organizations/organization-context";
import { getIdentityFromClaims } from "@/lib/auth/identity";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const identity = error ? null : getIdentityFromClaims(data?.claims);

  if (!identity) {
    redirect("/login");
  }

  return (
    <OrganizationProvider>
      <AppShell userEmail={identity.email}>{children}</AppShell>
    </OrganizationProvider>
  );
}
