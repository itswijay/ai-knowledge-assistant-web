import type { CurrentUserResponse } from "@/types/api";
import type { CurrentUser } from "@/types/domain";

import { apiClient, type RequestOptions } from "./client";

export function mapCurrentUser(dto: CurrentUserResponse): CurrentUser {
  return {
    id: dto.id,
    email: dto.email,
  };
}

export async function getCurrentUser(
  options?: Omit<RequestOptions, "method" | "body">,
): Promise<CurrentUser> {
  const dto = await apiClient.get<CurrentUserResponse>("/api/v1/auth/me", options);
  return mapCurrentUser(dto);
}
