import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { getSafeNextPath } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/server";

const supportedOtpTypes = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

function getOtpType(value: string | null): EmailOtpType | null {
  return value && supportedOtpTypes.has(value as EmailOtpType)
    ? (value as EmailOtpType)
    : null;
}

function buildRedirect(request: NextRequest, path: string) {
  const target = new URL(path, request.url);
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = target.pathname;
  redirectUrl.search = target.search;
  redirectUrl.hash = target.hash;
  return redirectUrl;
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = getOtpType(request.nextUrl.searchParams.get("type"));
  const nextPath = getSafeNextPath(request.nextUrl.searchParams.get("next"));

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      return NextResponse.redirect(buildRedirect(request, nextPath));
    }
  }

  const loginUrl = buildRedirect(request, "/login");
  loginUrl.searchParams.set("auth_error", "confirmation");
  return NextResponse.redirect(loginUrl);
}
