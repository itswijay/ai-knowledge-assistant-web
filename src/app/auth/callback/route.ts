import { type NextRequest, NextResponse } from "next/server";

import { getSafeNextPath } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/server";

function buildRedirect(request: NextRequest, path: string) {
  const target = new URL(path, request.url);
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = target.pathname;
  redirectUrl.search = target.search;
  redirectUrl.hash = target.hash;
  return redirectUrl;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = getSafeNextPath(request.nextUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(buildRedirect(request, nextPath));
    }
  }

  const loginUrl = buildRedirect(request, "/login");
  loginUrl.searchParams.set("auth_error", "callback");
  return NextResponse.redirect(loginUrl);
}
