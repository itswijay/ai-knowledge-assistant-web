export type AuthIdentity = {
  id: string;
  email: string | null;
};

type AuthClaims = {
  sub?: unknown;
  email?: unknown;
};

export function getIdentityFromClaims(
  claims: AuthClaims | null | undefined,
): AuthIdentity | null {
  if (typeof claims?.sub !== "string" || claims.sub.length === 0) {
    return null;
  }

  return {
    id: claims.sub,
    email:
      typeof claims.email === "string" && claims.email.length > 0
        ? claims.email
        : null,
  };
}
