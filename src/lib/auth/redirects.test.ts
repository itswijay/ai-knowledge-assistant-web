import { describe, expect, it } from "vitest";

import { getAuthScreenPath, getSafeNextPath } from "./redirects";

describe("getSafeNextPath", () => {
  it("keeps local paths with query strings and fragments", () => {
    expect(getSafeNextPath("/assistants?view=list#recent")).toBe(
      "/assistants?view=list#recent",
    );
  });

  it.each([
    undefined,
    null,
    "",
    "assistants",
    "https://example.com",
    "//example.com/path",
    "/\\example.com/path",
  ])("falls back to the dashboard for unsafe value %s", (value) => {
    expect(getSafeNextPath(value)).toBe("/");
  });
});

describe("getAuthScreenPath", () => {
  it("preserves a safe destination between authentication screens", () => {
    expect(getAuthScreenPath("/signup", "/assistants?view=list")).toBe(
      "/signup?next=%2Fassistants%3Fview%3Dlist",
    );
  });

  it("omits the default dashboard destination", () => {
    expect(getAuthScreenPath("/login", "/")).toBe("/login");
  });
});
