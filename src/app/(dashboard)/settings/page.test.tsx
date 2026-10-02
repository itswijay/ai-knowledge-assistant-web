import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useOrganization } from "@/features/organizations/use-organization";
import type { Organization } from "@/types/domain";
import OrganizationSettingsPage from "./page";

vi.mock("@/features/organizations/use-organization", () => ({
  useOrganization: vi.fn(),
}));

const mockOrg: Organization = {
  id: "44444444-4444-4444-4444-444444444444",
  name: "Acme Enterprises",
  createdAt: "2026-02-15T12:00:00Z",
  updatedAt: "2026-02-15T12:00:00Z",
};

describe("OrganizationSettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders organization metadata in read-only mode", () => {
    vi.mocked(useOrganization).mockReturnValue({
      organizations: [mockOrg],
      selectedOrganizationId: mockOrg.id,
      selectedOrganization: mockOrg,
      isLoading: false,
      isError: false,
      error: null,
      switchOrganization: vi.fn(),
      createOrganization: vi.fn(),
      isCreating: false,
    });

    render(<OrganizationSettingsPage />);

    expect(
      screen.getByRole("heading", { name: "Organization Settings" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Acme Enterprises")).toBeInTheDocument();
    expect(screen.getByText("44444444-4444-4444-4444-444444444444")).toBeInTheDocument();
    expect(screen.getByText("Team and role management")).toBeInTheDocument();
  });

  it("handles copy organization ID to clipboard", async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    vi.mocked(useOrganization).mockReturnValue({
      organizations: [mockOrg],
      selectedOrganizationId: mockOrg.id,
      selectedOrganization: mockOrg,
      isLoading: false,
      isError: false,
      error: null,
      switchOrganization: vi.fn(),
      createOrganization: vi.fn(),
      isCreating: false,
    });

    render(<OrganizationSettingsPage />);

    await user.click(screen.getByRole("button", { name: "Copy organization ID" }));

    expect(writeTextMock).toHaveBeenCalledWith("44444444-4444-4444-4444-444444444444");
  });

  it("displays alert when no organization is selected", () => {
    vi.mocked(useOrganization).mockReturnValue({
      organizations: [],
      selectedOrganizationId: null,
      selectedOrganization: null,
      isLoading: false,
      isError: false,
      error: null,
      switchOrganization: vi.fn(),
      createOrganization: vi.fn(),
      isCreating: false,
    });

    render(<OrganizationSettingsPage />);

    expect(screen.getByText("No organization selected")).toBeInTheDocument();
  });
});
