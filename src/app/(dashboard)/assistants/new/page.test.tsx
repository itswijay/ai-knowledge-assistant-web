import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCreateAssistant } from "@/features/assistants/use-assistant";
import { useOrganization } from "@/features/organizations/use-organization";
import { ApiError } from "@/lib/api/errors";
import type { Organization } from "@/types/domain";
import NewAssistantPage from "./page";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  mutateAsync: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/features/organizations/use-organization", () => ({
  useOrganization: vi.fn(),
}));

vi.mock("@/features/assistants/use-assistant", () => ({
  useCreateAssistant: vi.fn(),
}));

const mockOrg: Organization = {
  id: "org-1",
  name: "Acme Corp",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("NewAssistantPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useOrganization).mockReturnValue({
      organizations: [mockOrg],
      selectedOrganizationId: "org-1",
      selectedOrganization: mockOrg,
      isLoading: false,
      isError: false,
      error: null,
      switchOrganization: vi.fn(),
      createOrganization: vi.fn(),
      isCreating: false,
    });
    vi.mocked(useCreateAssistant).mockReturnValue({
      mutateAsync: mocks.mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateAssistant>);
  });

  it("validates required assistant name", async () => {
    const user = userEvent.setup();
    render(<NewAssistantPage />);

    await user.click(screen.getByRole("button", { name: "Create assistant" }));

    expect(
      await screen.findByText("Assistant name is required."),
    ).toBeInTheDocument();
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
  });

  it("submits valid assistant and navigates to the new workspace", async () => {
    const user = userEvent.setup();
    mocks.mutateAsync.mockResolvedValueOnce({
      id: "asst-new-1",
      organizationId: "org-1",
      name: "Acme Bot",
      description: "Support assistant",
      welcomeMessage: "Hi!",
      assistantInstructions: "Instructions",
      logoUrl: null,
      primaryColor: "#2563EB",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    });

    render(<NewAssistantPage />);

    await user.type(screen.getByLabelText(/Assistant name/i), "Acme Bot");
    await user.type(screen.getByLabelText(/Description/i), "Support assistant");
    await user.click(screen.getByRole("button", { name: "Create assistant" }));

    await waitFor(() => {
      expect(mocks.mutateAsync).toHaveBeenCalledWith({
        name: "Acme Bot",
        description: "Support assistant",
      });
      expect(mocks.push).toHaveBeenCalledWith("/assistants/asst-new-1");
    });
  });

  it("displays role permission error message when 403 Forbidden is returned", async () => {
    const user = userEvent.setup();
    mocks.mutateAsync.mockRejectedValueOnce(
      new ApiError(403, "Forbidden"),
    );

    render(<NewAssistantPage />);

    await user.type(screen.getByLabelText(/Assistant name/i), "Acme Bot");
    await user.click(screen.getByRole("button", { name: "Create assistant" }));

    expect(
      await screen.findByText(
        /Only Organization Owners and Admins can create assistants/i,
      ),
    ).toBeInTheDocument();
  });

  it("toggles optional advanced initial customization section", async () => {
    const user = userEvent.setup();
    render(<NewAssistantPage />);

    expect(
      screen.queryByLabelText("Welcome message"),
    ).not.toBeInTheDocument();

    await user.click(screen.getByText("Initial Customization (Optional)"));

    expect(
      screen.getByLabelText("Welcome message"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Assistant instructions"),
    ).toBeInTheDocument();
  });
});
