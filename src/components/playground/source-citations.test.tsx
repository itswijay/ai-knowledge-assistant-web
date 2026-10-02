import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { ChatSource } from "@/types/domain";
import { SourceCitations } from "./source-citations";

const mockSources: ChatSource[] = [
  { document: "employee_handbook.pdf", page: 12 },
  { document: "benefits_guide.pdf", page: 3 },
];

describe("SourceCitations", () => {
  it("renders nothing when sources array is empty", () => {
    const { container } = render(<SourceCitations sources={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders disclosure button with singular count for 1 source", () => {
    render(<SourceCitations sources={[mockSources[0]]} />);
    expect(screen.getByText("1 Source cited")).toBeInTheDocument();
  });

  it("renders disclosure button with plural count for multiple sources", () => {
    render(<SourceCitations sources={mockSources} />);
    expect(screen.getByText("2 Sources cited")).toBeInTheDocument();
  });

  it("expands on click and displays source documents and pages", async () => {
    const user = userEvent.setup();
    render(<SourceCitations sources={mockSources} />);

    // Initially collapsed
    expect(screen.queryByText("employee_handbook.pdf")).not.toBeInTheDocument();

    const button = screen.getByRole("button", { name: /2 sources cited/i });
    expect(button).toHaveAttribute("aria-expanded", "false");

    await user.click(button);

    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("employee_handbook.pdf")).toBeInTheDocument();
    expect(screen.getByText("Page 12")).toBeInTheDocument();
    expect(screen.getByText("benefits_guide.pdf")).toBeInTheDocument();
    expect(screen.getByText("Page 3")).toBeInTheDocument();

    // Clicking again collapses
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("employee_handbook.pdf")).not.toBeInTheDocument();
  });

  it("renders expanded by default when defaultExpanded is true", () => {
    render(<SourceCitations sources={mockSources} defaultExpanded />);
    expect(screen.getByText("employee_handbook.pdf")).toBeInTheDocument();
    expect(screen.getByText("Page 12")).toBeInTheDocument();
  });
});
