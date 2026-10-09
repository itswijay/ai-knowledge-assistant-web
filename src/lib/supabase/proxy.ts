import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getPublicEnv } from "@/lib/env";

const authScreenPaths = new Set(["/login", "/signup"]);

function copyAuthCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  return target;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const env = getPublicEnv();
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          Object.entries(headers).forEach(([name, value]) => {
            response.headers.set(name, value);
          });
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);
  const pathname = request.nextUrl.pathname;
  const isAuthScreen = authScreenPaths.has(pathname);
  const isAuthHandler = pathname.startsWith("/auth/");
  const isPublicWidget =
    pathname.startsWith("/widget") || pathname === "/widget.js";

  if (isPublicWidget) {
    return response;
  }

  if (!isAuthenticated && !isAuthScreen && !isAuthHandler) {
    const loginUrl = request.nextUrl.clone();
    const requestedPath = `${pathname}${request.nextUrl.search}`;
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", requestedPath);

    return copyAuthCookies(response, NextResponse.redirect(loginUrl));
  }

  if (isAuthenticated && isAuthScreen) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/";
    dashboardUrl.search = "";

    return copyAuthCookies(response, NextResponse.redirect(dashboardUrl));
  }

  return response;
}
