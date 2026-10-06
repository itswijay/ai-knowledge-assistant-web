import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUpdateAssistant } from "@/features/assistants/use-assistant";
import { ApiError } from "@/lib/api/errors";
import type { Assistant } from "@/types/domain";
import { AssistantSettingsForm } from "./assistant-settings-form";

vi.mock("@/features/assistants/use-assistant", () => ({
  useUpdateAssistant: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

const mockAssistant: Assistant = {
  id: "asst-1",
  organizationId: "org-1",
  name: "Documentation Bot",
  description: "Helps with docs",
  welcomeMessage: "Hi!",
  assistantInstructions: "Be precise and cite policy.",
  logoUrl: null,
  primaryColor: "#2563EB",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("AssistantSettingsForm", () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUpdateAssistant).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateAssistant>);
  });

  it("renders assistant settings and enforces customer-facing terminology without system_prompt", () => {
    render(<AssistantSettingsForm assistant={mockAssistant} />);

    expect(screen.getByDisplayValue("Documentation Bot")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Helps with docs")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Be precise and cite policy."),
    ).toBeInTheDocument();

    // Verify customer-facing label is used
    expect(
      screen.getByLabelText(/Assistant Instructions/i),
    ).toBeInTheDocument();

    // Verify system_prompt is NEVER present anywhere in DOM
    expect(screen.queryByLabelText(/system_prompt/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/system_prompt/i)).not.toBeInTheDocument();
  });

  it("submits delta PATCH with only modified fields", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValueOnce({
      ...mockAssistant,
      name: "Renamed Assistant",
    });

    render(<AssistantSettingsForm assistant={mockAssistant} />);

    const nameInput = screen.getByLabelText(/Assistant Name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Renamed Assistant");

    const saveBtn = screen.getByRole("button", { name: "Save changes" });
    await user.click(saveBtn);

    await waitFor(() => {
      // Only name changed, delta only has name
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: "Renamed Assistant",
      });
      expect(toast.success).toHaveBeenCalledWith(
        "Assistant settings saved successfully.",
      );
    });
  });

  it("submits assistant_instructions update through PATCH", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValueOnce({
      ...mockAssistant,
      assistantInstructions: "New updated rules.",
    });

    render(<AssistantSettingsForm assistant={mockAssistant} />);

    const instructionsTextarea = screen.getByLabelText(
      /Assistant Instructions/i,
    );
    await user.clear(instructionsTextarea);
    await user.type(instructionsTextarea, "New updated rules.");

    const saveBtn = screen.getByRole("button", { name: "Save changes" });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        assistant_instructions: "New updated rules.",
      });
    });
  });

  it("handles 403 Forbidden error with actionable message", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockRejectedValueOnce(new ApiError(403, "Forbidden"));

    render(<AssistantSettingsForm assistant={mockAssistant} />);

    const nameInput = screen.getByLabelText(/Assistant Name/i);
    await user.type(nameInput, " extra");

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(
      await screen.findByText(
        /You do not have permission to modify this assistant. Owner or Admin role required./i,
      ),
    ).toBeInTheDocument();
  });
});
