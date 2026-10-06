import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AssistantLivePreview } from "./assistant-live-preview";

describe("AssistantLivePreview", () => {
  it("renders assistant name, branding color, and welcome message", () => {
    render(
      <AssistantLivePreview
        name="Support Specialist"
        welcomeMessage="Welcome to Support! Ask any question."
        logoUrl={null}
        primaryColor="#0f766e"
      />,
    );

    expect(screen.getByText("Support Specialist")).toBeInTheDocument();
    expect(
      screen.getByText("Welcome to Support! Ask any question."),
    ).toBeInTheDocument();
    expect(screen.getByText("#0f766e")).toBeInTheDocument();
    expect(screen.getByText("Live Appearance Preview")).toBeInTheDocument();
    expect(screen.getByText("Readable text contrast verified")).toBeInTheDocument();
  });

  it("renders fallback initial letter when logoUrl is not provided", () => {
    render(
      <AssistantLivePreview
        name="Knowledge Agent"
        welcomeMessage="Hi there!"
        logoUrl={null}
        primaryColor="#2563EB"
      />,
    );

    // Initial 'K' should appear in avatar fallbacks
    const fallbacks = screen.getAllByText("K");
    expect(fallbacks.length).toBeGreaterThan(0);
  });

  it("handles empty name gracefully with default initial", () => {
    render(
      <AssistantLivePreview
        name=""
        welcomeMessage="Hello!"
        logoUrl={null}
        primaryColor="#2563EB"
      />,
    );

    expect(screen.getByText("Assistant")).toBeInTheDocument();
    expect(screen.getAllByText("A").length).toBeGreaterThan(0);
  });
});
