import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAssistants } from "@/features/assistants/use-assistants";
import { useOrganization } from "@/features/organizations/use-organization";
import type { Assistant, Organization } from "@/types/domain";
import AssistantsPage from "./page";

vi.mock("@/features/organizations/use-organization", () => ({
  useOrganization: vi.fn(),
}));

vi.mock("@/features/assistants/use-assistants", () => ({
  useAssistants: vi.fn(),
}));

const mockOrg: Organization = {
  id: "org-1",
  name: "Acme Corp",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const mockAssistants: Assistant[] = [
  {
    id: "asst-1",
    organizationId: "org-1",
    name: "Customer Support",
    description: "Helps users with troubleshooting",
    welcomeMessage: "Hi!",
    assistantInstructions: "Be helpful.",
    logoUrl: null,
    primaryColor: "#2563EB",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-05T00:00:00Z",
  },
  {
    id: "asst-2",
    organizationId: "org-1",
    name: "Sales Assistant",
    description: "Answers product pricing questions",
    welcomeMessage: "Welcome!",
    assistantInstructions: "Be polite.",
    logoUrl: null,
    primaryColor: "#059669",
    createdAt: "2026-01-02T00:00:00Z",
    updatedAt: "2026-01-06T00:00:00Z",
  },
];

describe("AssistantsPage", () => {
  const mockRefetch = vi.fn();

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
  });

  it("renders empty state when no organization is selected", () => {
    vi.mocked(useOrganization).mockReturnValueOnce({
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
    vi.mocked(useAssistants).mockReturnValueOnce({
      assistants: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<AssistantsPage />);
    expect(screen.getByText("No organization selected")).toBeInTheDocument();
  });

  it("renders loading skeleton while assistants are fetching", () => {
    vi.mocked(useAssistants).mockReturnValueOnce({
      assistants: [],
      isLoading: true,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<AssistantsPage />);
    expect(screen.getByLabelText("Loading assistants")).toBeInTheDocument();
  });

  it("renders error state with retry button on failure", async () => {
    const user = userEvent.setup();
    vi.mocked(useAssistants).mockReturnValueOnce({
      assistants: [],
      isLoading: false,
      isError: true,
      error: new Error("Network timeout"),
      refetch: mockRefetch,
    });

    render(<AssistantsPage />);
    expect(screen.getByText("Unable to load assistants")).toBeInTheDocument();
    expect(screen.getByText("Network timeout")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("renders zero-state when organization has no assistants", () => {
    vi.mocked(useAssistants).mockReturnValueOnce({
      assistants: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<AssistantsPage />);
    expect(screen.getByText("No assistants yet")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Create assistant/i }),
    ).toBeInTheDocument();
  });

  it("renders assistant cards and filters by search query", async () => {
    const user = userEvent.setup();
    vi.mocked(useAssistants).mockReturnValue({
      assistants: mockAssistants,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<AssistantsPage />);

    expect(screen.getByText("Customer Support")).toBeInTheDocument();
    expect(screen.getByText("Sales Assistant")).toBeInTheDocument();
    expect(screen.getByText("2 of 2 assistants")).toBeInTheDocument();

    const searchInput = screen.getByLabelText("Search assistants");
    await user.type(searchInput, "Sales");

    expect(screen.queryByText("Customer Support")).not.toBeInTheDocument();
    expect(screen.getByText("Sales Assistant")).toBeInTheDocument();
    expect(screen.getByText("1 of 2 assistants")).toBeInTheDocument();
  });

  it("renders no matching assistants when query matches nothing and clears search", async () => {
    const user = userEvent.setup();
    vi.mocked(useAssistants).mockReturnValue({
      assistants: mockAssistants,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<AssistantsPage />);

    const searchInput = screen.getByLabelText("Search assistants");
    await user.type(searchInput, "Nonexistent");

    expect(screen.getByText("No matching assistants")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Clear search" })[0]);

    expect(screen.getByText("Customer Support")).toBeInTheDocument();
    expect(screen.getByText("Sales Assistant")).toBeInTheDocument();
  });
});
