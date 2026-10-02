import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Assistant } from "@/types/domain";
import { AssistantCard } from "./assistant-card";

const mockAssistant: Assistant = {
  id: "asst-100",
  organizationId: "org-1",
  name: "Documentation Bot",
  description: "Answers API questions from markdown docs",
  welcomeMessage: "Hi there!",
  assistantInstructions: "Be concise.",
  logoUrl: null,
  primaryColor: "#059669",
  createdAt: "2026-01-10T10:00:00Z",
  updatedAt: "2026-01-15T12:00:00Z",
};

describe("AssistantCard", () => {
  it("renders assistant name, description, and link to workspace", () => {
    render(<AssistantCard assistant={mockAssistant} />);

    expect(screen.getByText("Documentation Bot")).toBeInTheDocument();
    expect(
      screen.getByText("Answers API questions from markdown docs"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/assistants/asst-100",
    );
  });

  it("renders fallback text when description is empty", () => {
    const assistantWithoutDesc = { ...mockAssistant, description: null };
    render(<AssistantCard assistant={assistantWithoutDesc} />);

    expect(screen.getByText("No description provided.")).toBeInTheDocument();
  });

  it("renders initial letter inside avatar fallback", () => {
    render(<AssistantCard assistant={mockAssistant} />);
    expect(screen.getByText("D")).toBeInTheDocument();
  });
});
