import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDeleteAssistant } from "@/features/assistants/use-assistant";
import { ApiError } from "@/lib/api/errors";
import type { Assistant } from "@/types/domain";
import { AssistantDangerZone } from "./assistant-danger-zone";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/features/assistants/use-assistant", () => ({
  useDeleteAssistant: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockAssistant: Assistant = {
  id: "asst-1",
  organizationId: "org-1",
  name: "Documentation Bot",
  description: "Helps with docs",
  welcomeMessage: "Hi!",
  assistantInstructions: "Instructions",
  logoUrl: null,
  primaryColor: "#2563EB",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("AssistantDangerZone", () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeleteAssistant).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteAssistant>);
  });

  it("renders danger zone and opens confirmation dialog", async () => {
    const user = userEvent.setup();
    render(<AssistantDangerZone assistant={mockAssistant} />);

    expect(screen.getByText("Danger Zone")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete Documentation Bot" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Delete Documentation Bot" }),
    );

    expect(
      screen.getByText("Delete assistant permanently?"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Permanently delete assistant" }),
    ).toBeDisabled();
  });

  it("requires typing exact assistant name to enable deletion button and redirects on delete", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValueOnce(undefined);

    render(<AssistantDangerZone assistant={mockAssistant} />);

    await user.click(
      screen.getByRole("button", { name: "Delete Documentation Bot" }),
    );

    const input = screen.getByPlaceholderText("Documentation Bot");
    const confirmBtn = screen.getByRole("button", {
      name: "Permanently delete assistant",
    });

    // Incomplete or wrong name keeps button disabled
    await user.type(input, "Wrong name");
    expect(confirmBtn).toBeDisabled();

    await user.clear(input);
    await user.type(input, "Documentation Bot");
    expect(confirmBtn).not.toBeDisabled();

    await user.click(confirmBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(
        'Assistant "Documentation Bot" deleted successfully.',
      );
      expect(mocks.push).toHaveBeenCalledWith("/assistants");
    });
  });

  it("displays role permission error message when 403 Forbidden is returned", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockRejectedValueOnce(new ApiError(403, "Forbidden"));

    render(<AssistantDangerZone assistant={mockAssistant} />);

    await user.click(
      screen.getByRole("button", { name: "Delete Documentation Bot" }),
    );

    const input = screen.getByPlaceholderText("Documentation Bot");
    await user.type(input, "Documentation Bot");

    const confirmBtn = screen.getByRole("button", {
      name: "Permanently delete assistant",
    });
    await user.click(confirmBtn);

    expect(
      await screen.findByText(
        /Only Organization Owners and Admins can delete assistants/i,
      ),
    ).toBeInTheDocument();
  });
});
