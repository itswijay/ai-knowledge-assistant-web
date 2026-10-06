import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  useAssistant,
  useUpdateAssistant,
} from "@/features/assistants/use-assistant";
import type { Assistant } from "@/types/domain";
import AssistantAppearancePage from "./page";

vi.mock("next/navigation", () => ({
  useParams: () => ({ assistantId: "asst-1" }),
}));

vi.mock("@/features/assistants/use-assistant", () => ({
  useAssistant: vi.fn(),
  useUpdateAssistant: vi.fn(),
}));

const mockAssistant: Assistant = {
  id: "asst-1",
  organizationId: "org-1",
  name: "Documentation Bot",
  description: "Helps with docs",
  welcomeMessage: "Welcome! Ask me anything.",
  assistantInstructions: "Instructions",
  logoUrl: null,
  primaryColor: "#2563EB",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("AssistantAppearancePage", () => {
  const mockMutateAsync = vi.fn();

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
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateAssistant>);
  });

  it("renders appearance form and live preview simultaneously", () => {
    render(<AssistantAppearancePage />);

    expect(screen.getByText("Branding & Appearance")).toBeInTheDocument();
    expect(screen.getByText("Live Appearance Preview")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Welcome! Ask me anything."),
    ).toBeInTheDocument();
    expect(screen.getByText("#2563EB")).toBeInTheDocument();
  });

  it("updates live preview in real-time as user types in form", async () => {
    const user = userEvent.setup();
    render(<AssistantAppearancePage />);

    const textarea = screen.getByLabelText(/Welcome Message/i);
    await user.clear(textarea);
    await user.type(textarea, "Instant live greeting");

    // The live preview should immediately display the updated text
    expect(screen.getByText("Instant live greeting")).toBeInTheDocument();
  });
});
