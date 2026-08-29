import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SELECTED_ORGANIZATION_STORAGE_KEY } from "@/lib/auth/storage";

import { UserMenu } from "./user-menu";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { signOut: mocks.signOut } }),
}));

describe("UserMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it("clears user-scoped browser state after signing out", async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient();
    queryClient.setQueryData(["organizations", "list"], [{ id: "org-1" }]);
    window.localStorage.setItem(SELECTED_ORGANIZATION_STORAGE_KEY, "org-1");
    mocks.signOut.mockResolvedValueOnce({ error: null });

    render(
      <QueryClientProvider client={queryClient}>
        <UserMenu email="user@example.com" />
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Open account menu" }));
    await user.click(await screen.findByRole("menuitem", { name: "Sign out" }));

    expect(mocks.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(queryClient.getQueryData(["organizations", "list"])).toBeUndefined();
    expect(
      window.localStorage.getItem(SELECTED_ORGANIZATION_STORAGE_KEY),
    ).toBeNull();
    expect(mocks.replace).toHaveBeenCalledWith("/login");
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });
});
