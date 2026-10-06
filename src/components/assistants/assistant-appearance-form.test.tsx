import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUpdateAssistant } from "@/features/assistants/use-assistant";
import { ApiError } from "@/lib/api/errors";
import type { Assistant } from "@/types/domain";
import { AssistantAppearanceForm } from "./assistant-appearance-form";

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
  welcomeMessage: "Hi! How can I help you?",
  assistantInstructions: "Instructions",
  logoUrl: null,
  primaryColor: "#2563EB",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("AssistantAppearanceForm", () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUpdateAssistant).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateAssistant>);
  });

  it("renders with assistant values and disabled save button when pristine", () => {
    render(<AssistantAppearanceForm assistant={mockAssistant} />);

    expect(
      screen.getByDisplayValue("Hi! How can I help you?"),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("#2563EB")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save changes" }),
    ).toBeDisabled();
    expect(screen.getByText("All changes are saved.")).toBeInTheDocument();
  });

  it("enables save button on edit and sends only modified delta in PATCH", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValueOnce({
      ...mockAssistant,
      welcomeMessage: "New custom greeting",
    });

    render(<AssistantAppearanceForm assistant={mockAssistant} />);

    const textarea = screen.getByLabelText(/Welcome Message/i);
    await user.clear(textarea);
    await user.type(textarea, "New custom greeting");

    const saveBtn = screen.getByRole("button", { name: "Save changes" });
    expect(saveBtn).not.toBeDisabled();
    expect(
      screen.getByText("You have unsaved appearance changes."),
    ).toBeInTheDocument();

    await user.click(saveBtn);

    await waitFor(() => {
      // Only welcome_message was changed, so delta only includes welcome_message
      expect(mockMutateAsync).toHaveBeenCalledWith({
        welcome_message: "New custom greeting",
      });
      expect(toast.success).toHaveBeenCalledWith(
        "Appearance settings updated successfully.",
      );
    });
  });

  it("allows selecting color presets and saving color change", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValueOnce({
      ...mockAssistant,
      primaryColor: "#0f766e",
    });

    render(<AssistantAppearanceForm assistant={mockAssistant} />);

    // Click Deep Teal preset button
    const tealButton = screen.getByRole("button", { name: "Deep Teal" });
    await user.click(tealButton);

    const saveBtn = screen.getByRole("button", { name: "Save changes" });
    expect(saveBtn).not.toBeDisabled();

    await user.click(saveBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        primary_color: "#0f766e",
      });
    });
  });

  it("reverts changes when reset button is clicked", async () => {
    const user = userEvent.setup();
    render(<AssistantAppearanceForm assistant={mockAssistant} />);

    const textarea = screen.getByLabelText(/Welcome Message/i);
    await user.type(textarea, " extra text");

    const resetBtn = screen.getByRole("button", { name: "Reset" });
    expect(resetBtn).toBeInTheDocument();

    await user.click(resetBtn);

    expect(
      screen.getByDisplayValue("Hi! How can I help you?"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save changes" }),
    ).toBeDisabled();
  });

  it("displays 403 error message when user lacks permission to update", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockRejectedValueOnce(new ApiError(403, "Forbidden"));

    render(<AssistantAppearanceForm assistant={mockAssistant} />);

    const textarea = screen.getByLabelText(/Welcome Message/i);
    await user.type(textarea, " change");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(
      await screen.findByText(
        /You do not have permission to modify this assistant. Owner or Admin role required./i,
      ),
    ).toBeInTheDocument();
  });
});
