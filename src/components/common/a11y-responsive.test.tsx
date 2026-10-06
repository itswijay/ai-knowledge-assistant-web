import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AssistantAppearanceForm } from "@/components/assistants/assistant-appearance-form";
import { AssistantSettingsForm } from "@/components/assistants/assistant-settings-form";
import { AssistantDangerZone } from "@/components/assistants/assistant-danger-zone";
import { ChatInput } from "@/components/playground/chat-input";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { ThemeMenu } from "@/components/layout/theme-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getReadableTextColor } from "@/lib/utils/contrast";
import type { Assistant } from "@/types/domain";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/assistants/asst-1/settings",
  useParams: () => ({ assistantId: "asst-1" }),
}));

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
    resolvedTheme: "light",
  }),
}));

// Mock useOrganization
vi.mock("@/features/organizations/use-organization", () => ({
  useOrganization: () => ({
    selectedOrganizationId: "org-1",
    selectedOrganization: { id: "org-1", name: "Acme Corp" },
    organizations: [{ id: "org-1", name: "Acme Corp" }],
    isLoading: false,
    isError: false,
    error: null,
    switchOrganization: vi.fn(),
    createOrganization: vi.fn(),
    isCreating: false,
  }),
}));

const mockAssistant: Assistant = {
  id: "asst-1",
  organizationId: "org-1",
  name: "Customer Support Assistant",
  description: "Handles customer inquiries and warranty policies.",
  welcomeMessage: "Hello! How can I assist you with your purchase?",
  assistantInstructions: "Be concise, friendly, and cite section numbers directly.",
  primaryColor: "#0f766e",
  logoUrl: "https://example.com/logo.png",
  createdAt: "2026-10-01T10:00:00Z",
  updatedAt: "2026-10-02T10:00:00Z",
};

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>{ui}</TooltipProvider>
    </QueryClientProvider>,
  );
}

describe("Step 11 Accessibility & Responsiveness Pass", () => {
  describe("Form ARIA Error Associations & Descriptions", () => {
    it("associates appearance form inputs with descriptions and error IDs", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AssistantAppearanceForm assistant={mockAssistant} />);

      const welcomeInput = screen.getByLabelText(/Welcome Message/i);
      expect(welcomeInput).toHaveAttribute("aria-describedby", "welcome-message-desc");

      const welcomeCount = screen.getByText(
        new RegExp(`${mockAssistant.welcomeMessage.length} \\/ 500`),
      );
      expect(welcomeCount).toHaveAttribute("aria-live", "polite");

      // Clear input to trigger validation error
      await user.clear(welcomeInput);
      await user.tab();

      await waitFor(() => {
        expect(welcomeInput).toHaveAttribute("aria-invalid", "true");
        expect(welcomeInput).toHaveAttribute(
          "aria-describedby",
          "welcome-message-error",
        );
      });

      const errorMsg = document.getElementById("welcome-message-error");
      expect(errorMsg).toBeInTheDocument();
      expect(errorMsg).toHaveTextContent(/Welcome message is required/i);
    });

    it("renders color presets with accessible radio/pressed attributes and labels", () => {
      renderWithQueryClient(<AssistantAppearanceForm assistant={mockAssistant} />);

      const presetGroup = screen.getByRole("group", { name: /Color presets/i });
      expect(presetGroup).toBeInTheDocument();

      const deepTealBtn = screen.getByRole("button", {
        name: "Deep Teal",
      });
      expect(deepTealBtn).toHaveAttribute("aria-pressed", "true");

      const royalBlueBtn = screen.getByRole("button", {
        name: "Royal Blue",
      });
      expect(royalBlueBtn).toHaveAttribute("aria-pressed", "false");
    });

    it("associates settings form inputs with accessible description and error IDs", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AssistantSettingsForm assistant={mockAssistant} />);

      const nameInput = screen.getByLabelText(/Assistant Name/i);
      const nameCount = screen.getByText(
        new RegExp(`${mockAssistant.name.length} \\/ 100`),
      );
      expect(nameCount).toHaveAttribute("aria-live", "polite");

      const descInput = screen.getByLabelText(/Description/i);
      expect(descInput).toHaveAttribute(
        "aria-describedby",
        "assistant-description-desc",
      );

      const instructionsInput = screen.getByLabelText(/Assistant Instructions/i);
      expect(instructionsInput).toHaveAttribute(
        "aria-describedby",
        "assistant-instructions-desc",
      );

      // Trigger error on name
      await user.clear(nameInput);
      await user.tab();

      await waitFor(() => {
        expect(nameInput).toHaveAttribute("aria-invalid", "true");
        expect(nameInput).toHaveAttribute(
          "aria-describedby",
          "assistant-name-error",
        );
      });
    });

    it("associates danger zone confirmation input with accessible instructions", async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<AssistantDangerZone assistant={mockAssistant} />);

      const triggerBtn = screen.getByRole("button", {
        name: `Delete ${mockAssistant.name}`,
      });
      await user.click(triggerBtn);

      await waitFor(() => {
        const input = screen.getByPlaceholderText(mockAssistant.name);
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute(
          "aria-describedby",
          "delete-confirmation-instructions",
        );
      });
    });
  });

  describe("Live Regions & Character Limit Warnings", () => {
    it("announces live character limit errors assertively when input exceeds 2,000 characters", () => {
      const onSend = vi.fn();

      render(<ChatInput onSend={onSend} />);

      const textarea = screen.getByRole("textbox", { name: /Ask a question/i });
      const counter = screen.getByText("0 / 2,000");
      expect(counter).toHaveAttribute("aria-live", "polite");

      // Set 2,001 characters instantaneously via fireEvent
      fireEvent.change(textarea, { target: { value: "a".repeat(2001) } });

      const errorBanner = screen.getByRole("alert");
      expect(errorBanner).toHaveAttribute("aria-live", "assertive");
      expect(errorBanner).toHaveTextContent("Exceeds 2,000 character limit");

      expect(textarea).toHaveAttribute("aria-invalid", "true");
      expect(textarea).toHaveAttribute("aria-describedby", "char-limit-error");
    });
  });

  describe("Modal Keyboard Trapping & Restoration", () => {
    it("renders confirmation dialog with accessible trigger and closes cleanly", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      render(
        <ConfirmationDialog
          trigger={<button type="button">Delete Item</button>}
          title="Confirm action"
          description="Are you sure you want to proceed?"
          onConfirm={onConfirm}
        />,
      );

      const trigger = screen.getByRole("button", { name: /Delete Item/i });
      await user.click(trigger);

      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      expect(screen.getByText("Confirm action")).toBeInTheDocument();

      const cancelBtn = screen.getByRole("button", { name: /Cancel/i });
      await user.click(cancelBtn);

      await waitFor(() => {
        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
      });
    });

    it("renders theme menu with accessible trigger label", () => {
      render(
        <TooltipProvider>
          <ThemeMenu />
        </TooltipProvider>,
      );
      const btn = screen.getByRole("button", { name: /Choose color theme/i });
      expect(btn).toBeInTheDocument();
    });
  });

  describe("WCAG Color Contrast Utility", () => {
    it("calculates high contrast foreground text for dark, light, and pastel brand colors", () => {
      // Very dark brand colors require pure white text
      expect(getReadableTextColor("#000000")).toBe("#ffffff");
      expect(getReadableTextColor("#0f766e")).toBe("#ffffff"); // Deep teal
      expect(getReadableTextColor("#1e3a8a")).toBe("#ffffff"); // Dark blue
      expect(getReadableTextColor("#111827")).toBe("#ffffff"); // Dark gray

      // Very light brand colors require dark slate text
      expect(getReadableTextColor("#ffffff")).toBe("#0f172a");
      expect(getReadableTextColor("#fef08a")).toBe("#0f172a"); // Pale yellow
      expect(getReadableTextColor("#e0f2fe")).toBe("#0f172a"); // Pale sky blue
      expect(getReadableTextColor("#f3f4f6")).toBe("#0f172a"); // Pale gray

      // Saturated bright colors
      expect(getReadableTextColor("#22c55e")).toBe("#0f172a"); // Bright green
      expect(getReadableTextColor("#eab308")).toBe("#0f172a"); // Amber/yellow
    });
  });
});
