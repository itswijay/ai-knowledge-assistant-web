import { describe, expect, it } from "vitest";

import { queryKeys } from "./keys";

describe("queryKeys", () => {
  it("generates correct keys for current user", () => {
    expect(queryKeys.currentUser()).toEqual(["current-user"]);
  });

  it("generates correct keys for organizations", () => {
    expect(queryKeys.organizations.all()).toEqual(["organizations"]);
    expect(queryKeys.organizations.list()).toEqual(["organizations", "list"]);
    expect(queryKeys.organizations.detail("org-1")).toEqual(["organization", "org-1"]);
    expect(queryKeys.organizations.assistants("org-1")).toEqual([
      "organization",
      "org-1",
      "assistants",
    ]);
    expect(queryKeys.organizations.assistant("org-1", "asst-1")).toEqual([
      "organization",
      "org-1",
      "assistant",
      "asst-1",
    ]);
    expect(queryKeys.organizations.documents("org-1", "asst-1")).toEqual([
      "organization",
      "org-1",
      "assistant",
      "asst-1",
      "documents",
    ]);
  });
});
