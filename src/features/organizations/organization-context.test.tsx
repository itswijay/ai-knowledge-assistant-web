import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as orgApi from "@/lib/api/organizations";
import { SELECTED_ORGANIZATION_STORAGE_KEY } from "@/lib/auth/storage";
import type { Organization } from "@/types/domain";

import {
  OrganizationProvider,
} from "./organization-context";
import { useOrganization } from "./use-organization";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  pathname: "/",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  usePathname: () => mocks.pathname,
}));

vi.mock("@/lib/api/organizations", () => ({
  listOrganizations: vi.fn(),
  createOrganization: vi.fn(),
}));

const mockOrgs: Organization[] = [
  {
    id: "org-1",
    name: "Acme 1",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "org-2",
    name: "Acme 2",
    createdAt: "2026-01-02T00:00:00Z",
    updatedAt: "2026-01-02T00:00:00Z",
  },
];

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <OrganizationProvider>{children}</OrganizationProvider>
      </QueryClientProvider>
    );
  };
}

describe("OrganizationContext & Provider", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    mocks.pathname = "/";
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  it("selects valid organization from localStorage if present", async () => {
    window.localStorage.setItem(SELECTED_ORGANIZATION_STORAGE_KEY, "org-2");
    vi.mocked(orgApi.listOrganizations).mockResolvedValueOnce(mockOrgs);

    const { result } = renderHook(() => useOrganization(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.selectedOrganizationId).toBe("org-2");
    expect(result.current.selectedOrganization?.name).toBe("Acme 2");
  });

  it("falls back to the first organization if stored ID is not found", async () => {
    window.localStorage.setItem(SELECTED_ORGANIZATION_STORAGE_KEY, "non-existent-org");
    vi.mocked(orgApi.listOrganizations).mockResolvedValueOnce(mockOrgs);

    const { result } = renderHook(() => useOrganization(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.selectedOrganizationId).toBe("org-1");
    expect(window.localStorage.getItem(SELECTED_ORGANIZATION_STORAGE_KEY)).toBe("org-1");
  });

  it("sets selected organization to null if organization list is empty", async () => {
    window.localStorage.setItem(SELECTED_ORGANIZATION_STORAGE_KEY, "org-1");
    vi.mocked(orgApi.listOrganizations).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useOrganization(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.selectedOrganizationId).toBeNull();
    expect(result.current.selectedOrganization).toBeNull();
    expect(window.localStorage.getItem(SELECTED_ORGANIZATION_STORAGE_KEY)).toBeNull();
  });

  it("applies strict cache removal and redirects on switchOrganization", async () => {
    window.localStorage.setItem(SELECTED_ORGANIZATION_STORAGE_KEY, "org-1");
    vi.mocked(orgApi.listOrganizations).mockResolvedValue(mockOrgs);
    mocks.pathname = "/assistants/asst-1/knowledge";

    // Seed query data for org-1 to test cache eviction
    queryClient.setQueryData(["organization", "org-1", "assistants"], [{ id: "asst-1" }]);

    const { result } = renderHook(() => useOrganization(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.selectedOrganizationId).toBe("org-1");
    });

    act(() => {
      result.current.switchOrganization("org-2");
    });

    expect(result.current.selectedOrganizationId).toBe("org-2");
    expect(window.localStorage.getItem(SELECTED_ORGANIZATION_STORAGE_KEY)).toBe("org-2");

    // Proves old organization queries are completely purged from cache
    expect(
      queryClient.getQueryData(["organization", "org-1", "assistants"]),
    ).toBeUndefined();

    // Verifies navigation redirect to dashboard home
    expect(mocks.push).toHaveBeenCalledWith("/");
  });

  it("creates an organization and automatically selects it", async () => {
    vi.mocked(orgApi.listOrganizations).mockResolvedValueOnce(mockOrgs);
    const newOrg: Organization = {
      id: "org-new",
      name: "New Org",
      createdAt: "2026-01-03T00:00:00Z",
      updatedAt: "2026-01-03T00:00:00Z",
    };
    vi.mocked(orgApi.createOrganization).mockResolvedValueOnce(newOrg);

    const { result } = renderHook(() => useOrganization(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.createOrganization("New Org");
    });

    expect(orgApi.createOrganization).toHaveBeenCalledWith({ name: "New Org" });
    expect(result.current.selectedOrganizationId).toBe("org-new");
    expect(window.localStorage.getItem(SELECTED_ORGANIZATION_STORAGE_KEY)).toBe("org-new");
  });

  it("throws error when useOrganization is used outside OrganizationProvider", () => {
    expect(() => {
      renderHook(() => useOrganization());
    }).toThrow("useOrganization must be used within an OrganizationProvider");
  });
});
