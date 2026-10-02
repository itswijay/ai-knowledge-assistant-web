import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useOrganization } from "@/features/organizations/use-organization";
import type { Organization } from "@/types/domain";
import { OrganizationSwitcher } from "./organization-switcher";

vi.mock("@/features/organizations/use-organization", () => ({
  useOrganization: vi.fn(),
}));

const mockOrgs: Organization[] = [
  {
    id: "org-1",
    name: "Acme First",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "org-2",
    name: "Acme Second",
    createdAt: "2026-01-02T00:00:00Z",
    updatedAt: "2026-01-02T00:00:00Z",
  },
];

describe("OrganizationSwitcher", () => {
  const mockSwitchOrganization = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useOrganization).mockReturnValue({
      organizations: mockOrgs,
      selectedOrganizationId: "org-1",
      selectedOrganization: mockOrgs[0],
      isLoading: false,
      isError: false,
      error: null,
      switchOrganization: mockSwitchOrganization,
      createOrganization: vi.fn(),
      isCreating: false,
    });
  });

  it("renders selected organization name in trigger", () => {
    render(<OrganizationSwitcher />);
    expect(screen.getByText("Acme First")).toBeInTheDocument();
  });

  it("opens dropdown and switches organization on selection", async () => {
    const user = userEvent.setup();
    render(<OrganizationSwitcher />);

    await user.click(screen.getByRole("button", { name: "Select organization" }));

    expect(await screen.findByText("Organizations")).toBeInTheDocument();
    expect(screen.getByText("Acme Second")).toBeInTheDocument();

    await user.click(screen.getByText("Acme Second"));
    expect(mockSwitchOrganization).toHaveBeenCalledWith("org-2");
  });

  it("opens create organization dialog from dropdown menu", async () => {
    const user = userEvent.setup();
    render(<OrganizationSwitcher />);

    await user.click(screen.getByRole("button", { name: "Select organization" }));

    const createItem = await screen.findByText("Create organization");
    await user.click(createItem);

    expect(
      await screen.findByRole("heading", { name: "Create organization" }),
    ).toBeInTheDocument();
  });
});
