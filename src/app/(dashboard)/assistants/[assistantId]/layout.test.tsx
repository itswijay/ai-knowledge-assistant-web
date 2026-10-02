import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAssistant } from "@/features/assistants/use-assistant";
import { ApiError } from "@/lib/api/errors";
import type { Assistant } from "@/types/domain";
import AssistantWorkspaceLayout from "./layout";

vi.mock("next/navigation", () => ({
  useParams: () => ({ assistantId: "asst-1" }),
  usePathname: () => "/assistants/asst-1",
}));

vi.mock("@/features/assistants/use-assistant", () => ({
  useAssistant: vi.fn(),
}));

const mockAssistant: Assistant = {
  id: "asst-1",
  organizationId: "org-1",
  name: "Support Assistant",
  description: "Handles product support",
  welcomeMessage: "How can I help you?",
  assistantInstructions: "Be concise.",
  logoUrl: null,
  primaryColor: "#2563EB",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-05T00:00:00Z",
};

describe("AssistantWorkspaceLayout", () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders workspace header and tab navigation when assistant is loaded", () => {
    vi.mocked(useAssistant).mockReturnValue({
      assistant: mockAssistant,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(
      <AssistantWorkspaceLayout>
        <div>Tab content</div>
      </AssistantWorkspaceLayout>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Support Assistant" })).toBeInTheDocument();
    expect(screen.getByText("Handles product support")).toBeInTheDocument();
    expect(screen.getByText("Back to assistants")).toBeInTheDocument();

    // Verify tabs
    expect(screen.getByRole("link", { name: /Overview/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Knowledge/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Playground/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Appearance/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Settings/i })).toBeInTheDocument();

    expect(screen.getByText("Tab content")).toBeInTheDocument();
  });

  it("renders 404 unavailable state with recovery link for cross-tenant or missing assistant", () => {
    vi.mocked(useAssistant).mockReturnValue({
      assistant: null,
      isLoading: false,
      isError: true,
      error: new ApiError(404, "Not Found"),
      refetch: mockRefetch,
    });

    render(
      <AssistantWorkspaceLayout>
        <div>Hidden content</div>
      </AssistantWorkspaceLayout>,
    );

    expect(screen.getByText("Assistant unavailable")).toBeInTheDocument();
    expect(
      screen.getByText(
        "This assistant does not exist or you do not have permission to view it in this organization.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to assistants" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Hidden content")).not.toBeInTheDocument();
  });

  it("renders loading skeleton while fetching", () => {
    vi.mocked(useAssistant).mockReturnValue({
      assistant: null,
      isLoading: true,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(
      <AssistantWorkspaceLayout>
        <div>Content</div>
      </AssistantWorkspaceLayout>,
    );

    expect(screen.getByLabelText("Loading page")).toBeInTheDocument();
  });
});
