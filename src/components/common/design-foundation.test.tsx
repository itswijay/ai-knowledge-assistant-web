import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/button";

import { ConfirmationDialog } from "./confirmation-dialog";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { LoadingButton } from "./loading-button";
import { PageHeader } from "./page-header";

describe("shared design foundation", () => {
  it("renders page headings with optional actions", () => {
    render(
      <PageHeader
        title="Assistants"
        description="Manage assistants for this organization."
        actions={<Button>New assistant</Button>}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Assistants" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New assistant" })).toBeVisible();
  });

  it("renders explicit empty and error states", () => {
    const { rerender } = render(
      <EmptyState
        title="No assistants yet"
        description="Create an assistant to get started."
      />,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "No assistants yet" }),
    ).toBeInTheDocument();

    rerender(<ErrorState description="The assistants could not be loaded." />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "The assistants could not be loaded.",
    );
  });

  it("disables loading actions and exposes their busy state", () => {
    render(
      <LoadingButton isLoading loadingText="Saving">
        Save
      </LoadingButton>,
    );

    const button = screen.getByRole("button", { name: "Saving" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("requires confirmation before a destructive action", async () => {
    const onConfirm = vi.fn();

    render(
      <ConfirmationDialog
        trigger={<Button>Delete assistant</Button>}
        title="Delete assistant?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={onConfirm}
      />,
    );

    screen.getByRole("button", { name: "Delete assistant" }).click();
    const confirmButton = await screen.findByRole("button", { name: "Delete" });
    confirmButton.click();

    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
