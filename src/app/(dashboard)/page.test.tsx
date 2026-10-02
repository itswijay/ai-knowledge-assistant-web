import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAssistants } from "@/features/assistants/use-assistants";
import { useOrganization } from "@/features/organizations/use-organization";
import type { Assistant, Organization } from "@/types/domain";
import Home from "./page";

vi.mock("@/features/organizations/use-organization", () => ({
  useOrganization: vi.fn(),
}));

vi.mock("@/features/assistants/use-assistants", () => ({
  useAssistants: vi.fn(),
}));

const mockOrg: Organization = {
  id: "org-1",
  name: "Acme Global",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const mockAssistants: Assistant[] = [
  {
    id: "asst-1",
    organizationId: "org-1",
    name: "Alpha Bot",
    description: "First assistant",
    welcomeMessage: "Hi!",
    assistantInstructions: "Instructions",
    logoUrl: null,
    primaryColor: "#2563EB",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-02T00:00:00Z",
  },
  {
    id: "asst-2",
    organizationId: "org-1",
    name: "Beta Bot",
    description: "Second assistant",
    welcomeMessage: "Hi!",
    assistantInstructions: "Instructions",
    logoUrl: null,
    primaryColor: "#059669",
    createdAt: "2026-01-02T00:00:00Z",
    updatedAt: "2026-01-10T00:00:00Z",
  },
  {
    id: "asst-3",
    organizationId: "org-1",
    name: "Gamma Bot",
    description: "Third assistant",
    welcomeMessage: "Hi!",
    assistantInstructions: "Instructions",
    logoUrl: null,
    primaryColor: "#D97706",
    createdAt: "2026-01-03T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
  },
  {
    id: "asst-4",
    organizationId: "org-1",
    name: "Delta Bot",
    description: "Oldest updated assistant",
    welcomeMessage: "Hi!",
    assistantInstructions: "Instructions",
    logoUrl: null,
    primaryColor: "#DC2626",
    createdAt: "2026-01-04T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

describe("Dashboard Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading skeleton while loading", () => {
    vi.mocked(useOrganization).mockReturnValue({
      organizations: [],
      selectedOrganizationId: null,
      selectedOrganization: null,
      isLoading: true,
      isError: false,
      error: null,
      switchOrganization: vi.fn(),
      createOrganization: vi.fn(),
      isCreating: false,
    });
    vi.mocked(useAssistants).mockReturnValue({
      assistants: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<Home />);
    expect(screen.getByLabelText("Loading page")).toBeInTheDocument();
  });

  it("renders onboarding when user has zero organizations", () => {
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
    vi.mocked(useAssistants).mockReturnValue({
      assistants: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<Home />);
    expect(
      screen.getByText("Welcome! Create your first organization"),
    ).toBeInTheDocument();
  });

  it("renders legitimate metrics and up to 3 recently updated assistants", () => {
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
    vi.mocked(useAssistants).mockReturnValue({
      assistants: mockAssistants,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<Home />);

    // Legitimate count
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Total Assistants")).toBeInTheDocument();
    expect(screen.getAllByText("Acme Global").length).toBeGreaterThan(0);

    // Top 3 recently updated: Gamma (Jan 15), Beta (Jan 10), Alpha (Jan 2)
    expect(screen.getByText("Gamma Bot")).toBeInTheDocument();
    expect(screen.getByText("Beta Bot")).toBeInTheDocument();
    expect(screen.getByText("Alpha Bot")).toBeInTheDocument();

    // Delta Bot (Jan 1) should not be in the top 3
    expect(screen.queryByText("Delta Bot")).not.toBeInTheDocument();
  });

  it("renders empty callout when organization has zero assistants", () => {
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
    vi.mocked(useAssistants).mockReturnValue({
      assistants: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<Home />);

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("No assistants created yet")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Create assistant/i }),
    ).toBeInTheDocument();
  });
});
