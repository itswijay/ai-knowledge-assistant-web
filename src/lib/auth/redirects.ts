export const DEFAULT_AUTH_REDIRECT = "/";

export function getSafeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_AUTH_REDIRECT;
  }

  try {
    const baseUrl = new URL("https://app.local");
    const targetUrl = new URL(value, baseUrl);

    if (targetUrl.origin !== baseUrl.origin) {
      return DEFAULT_AUTH_REDIRECT;
    }

    return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
  } catch {
    return DEFAULT_AUTH_REDIRECT;
  }
}

export function getAuthScreenPath(
  screen: "/login" | "/signup",
  nextPath: string,
): string {
  const safeNextPath = getSafeNextPath(nextPath);

  if (safeNextPath === DEFAULT_AUTH_REDIRECT) {
    return screen;
  }

  const searchParams = new URLSearchParams({ next: safeNextPath });
  return `${screen}?${searchParams.toString()}`;
}
