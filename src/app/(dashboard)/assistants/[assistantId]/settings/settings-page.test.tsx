import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  useAssistant,
  useDeleteAssistant,
  useUpdateAssistant,
} from "@/features/assistants/use-assistant";
import type { Assistant } from "@/types/domain";
import AssistantSettingsPage from "./page";

vi.mock("next/navigation", () => ({
  useParams: () => ({ assistantId: "asst-1" }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/features/assistants/use-assistant", () => ({
  useAssistant: vi.fn(),
  useUpdateAssistant: vi.fn(),
  useDeleteAssistant: vi.fn(),
}));

const mockAssistant: Assistant = {
  id: "asst-1",
  organizationId: "org-1",
  name: "Documentation Bot",
  description: "Helps with docs",
  welcomeMessage: "Welcome!",
  assistantInstructions: "Be precise and polite.",
  logoUrl: null,
  primaryColor: "#2563EB",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("AssistantSettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAssistant).mockReturnValue({
      assistant: mockAssistant,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    vi.mocked(useUpdateAssistant).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateAssistant>);
    vi.mocked(useDeleteAssistant).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteAssistant>);
  });

  it("renders configuration form and danger zone section", () => {
    render(<AssistantSettingsPage />);

    expect(
      screen.getByText("General Settings & Instructions"),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Documentation Bot")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Be precise and polite."),
    ).toBeInTheDocument();
    expect(screen.getByText("Danger Zone")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete Documentation Bot" }),
    ).toBeInTheDocument();
  });
});
