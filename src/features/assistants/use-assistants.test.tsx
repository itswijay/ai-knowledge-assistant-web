import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as assistantsApi from "@/lib/api/assistants";
import type { Assistant } from "@/types/domain";
import { useAssistants } from "./use-assistants";

vi.mock("@/lib/api/assistants", () => ({
  listAssistants: vi.fn(),
}));

const mockAssistants: Assistant[] = [
  {
    id: "asst-1",
    organizationId: "org-1",
    name: "Support Bot",
    description: "Answers customer queries",
    welcomeMessage: "Hello!",
    assistantInstructions: "Be concise.",
    logoUrl: null,
    primaryColor: "#2563EB",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-02T00:00:00Z",
  },
];

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe("useAssistants", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("fetches assistants when organizationId is provided", async () => {
    vi.mocked(assistantsApi.listAssistants).mockResolvedValueOnce(mockAssistants);

    const { result } = renderHook(() => useAssistants("org-1"), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(assistantsApi.listAssistants).toHaveBeenCalledWith("org-1");
    expect(result.current.assistants).toEqual(mockAssistants);
    expect(result.current.isError).toBe(false);
  });

  it("does not fetch when organizationId is null", async () => {
    const { result } = renderHook(() => useAssistants(null), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.assistants).toEqual([]);
    expect(assistantsApi.listAssistants).not.toHaveBeenCalled();
  });

  it("handles error when listAssistants fails", async () => {
    vi.mocked(assistantsApi.listAssistants).mockRejectedValueOnce(
      new Error("Failed to load assistants"),
    );

    const { result } = renderHook(() => useAssistants("org-1"), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Failed to load assistants");
  });
});
