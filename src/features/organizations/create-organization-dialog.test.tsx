import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/errors";
import { CreateOrganizationDialog } from "./create-organization-dialog";
import { useOrganization } from "./use-organization";

vi.mock("./use-organization", () => ({
  useOrganization: vi.fn(),
}));

describe("CreateOrganizationDialog", () => {
  const mockCreateOrganization = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useOrganization).mockReturnValue({
      organizations: [],
      selectedOrganizationId: null,
      selectedOrganization: null,
      isLoading: false,
      isError: false,
      error: null,
      switchOrganization: vi.fn(),
      createOrganization: mockCreateOrganization,
      isCreating: false,
    });
  });

  it("renders when open and closes on cancel", async () => {
    const user = userEvent.setup();
    render(
      <CreateOrganizationDialog open={true} onOpenChange={mockOnOpenChange} />,
    );

    expect(
      screen.getByRole("heading", { name: "Create organization" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Organization name")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("validates that organization name cannot be empty", async () => {
    const user = userEvent.setup();
    render(
      <CreateOrganizationDialog open={true} onOpenChange={mockOnOpenChange} />,
    );

    await user.click(screen.getByRole("button", { name: "Create organization" }));

    expect(
      await screen.findByText("Organization name is required."),
    ).toBeInTheDocument();
    expect(mockCreateOrganization).not.toHaveBeenCalled();
  });

  it("calls createOrganization and closes on successful submit", async () => {
    const user = userEvent.setup();
    mockCreateOrganization.mockResolvedValueOnce({
      id: "org-1",
      name: "Acme Cloud",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    });

    render(
      <CreateOrganizationDialog open={true} onOpenChange={mockOnOpenChange} />,
    );

    await user.type(screen.getByLabelText("Organization name"), "Acme Cloud");
    await user.click(screen.getByRole("button", { name: "Create organization" }));

    await waitFor(() => {
      expect(mockCreateOrganization).toHaveBeenCalledWith("Acme Cloud");
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("displays server error message on failure", async () => {
    const user = userEvent.setup();
    mockCreateOrganization.mockRejectedValueOnce(
      new ApiError("Failed to create organization due to server error", {
        status: 500,
      }),
    );

    render(
      <CreateOrganizationDialog open={true} onOpenChange={mockOnOpenChange} />,
    );

    await user.type(screen.getByLabelText("Organization name"), "Acme Cloud");
    await user.click(screen.getByRole("button", { name: "Create organization" }));

    expect(
      await screen.findByText("Failed to create organization due to server error"),
    ).toBeInTheDocument();
    expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
  });
});
