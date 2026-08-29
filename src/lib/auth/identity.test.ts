import { describe, expect, it } from "vitest";

import { getIdentityFromClaims } from "./identity";

describe("getIdentityFromClaims", () => {
  it("returns the authenticated subject and email", () => {
    expect(
      getIdentityFromClaims({ sub: "user-123", email: "user@example.com" }),
    ).toEqual({ id: "user-123", email: "user@example.com" });
  });

  it("allows a verified identity without an email claim", () => {
    expect(getIdentityFromClaims({ sub: "user-123" })).toEqual({
      id: "user-123",
      email: null,
    });
  });

  it.each([undefined, null, {}, { sub: "" }, { sub: 42 }])(
    "rejects claims without a valid subject",
    (claims) => {
      expect(getIdentityFromClaims(claims)).toBeNull();
    },
  );
});
