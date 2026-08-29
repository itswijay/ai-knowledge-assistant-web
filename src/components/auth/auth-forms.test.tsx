import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mocks.signInWithPassword,
      signUp: mocks.signUp,
    },
  }),
}));

describe("authentication forms", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates login fields before calling Supabase", async () => {
    const user = userEvent.setup();
    render(<LoginForm nextPath="/" />);

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Enter your email address.")).toBeVisible();
    expect(screen.getByText("Enter your password.")).toBeVisible();
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
  });

  it("signs in and returns to the requested local route", async () => {
    const user = userEvent.setup();
    mocks.signInWithPassword.mockResolvedValueOnce({ error: null });
    render(<LoginForm nextPath="/assistants" />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "secret-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "secret-password",
    });
    expect(mocks.replace).toHaveBeenCalledWith("/assistants");
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("does not expose provider details when login fails", async () => {
    const user = userEvent.setup();
    mocks.signInWithPassword.mockResolvedValueOnce({
      error: { message: "Internal provider detail" },
    });
    render(<LoginForm nextPath="/" />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to sign in. Check your email and password.",
    );
    expect(screen.queryByText("Internal provider detail")).not.toBeInTheDocument();
  });

  it("shows email confirmation feedback when signup has no session", async () => {
    const user = userEvent.setup();
    mocks.signUp.mockResolvedValueOnce({ data: { session: null }, error: null });
    render(<SignupForm nextPath="/" />);

    await user.type(screen.getByLabelText("Email"), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "secure-password");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("heading", { name: "Check your inbox" })).toBeVisible();
    expect(screen.getByText("new@example.com")).toBeVisible();
    expect(mocks.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "new@example.com",
        password: "secure-password",
        options: {
          emailRedirectTo: "http://localhost:3000/auth/callback?next=%2F",
        },
      }),
    );
  });
});
