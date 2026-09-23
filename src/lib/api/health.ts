import type { HealthResponse } from "@/types/api";

import { apiClient, type RequestOptions } from "./client";

export async function getHealth(
  options?: Omit<RequestOptions, "method" | "body">,
): Promise<HealthResponse> {
  return apiClient.get<HealthResponse>("/health", {
    ...options,
    authRequired: false,
  });
}
