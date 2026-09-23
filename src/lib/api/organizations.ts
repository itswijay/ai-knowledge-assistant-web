import type { CreateOrganizationRequest, OrganizationResponse } from "@/types/api";
import type { Organization } from "@/types/domain";

import { apiClient, type RequestOptions } from "./client";

export function mapOrganization(dto: OrganizationResponse): Organization {
  return {
    id: dto.id,
    name: dto.name,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export async function listOrganizations(
  options?: Omit<RequestOptions, "method" | "body">,
): Promise<Organization[]> {
  const dtos = await apiClient.get<OrganizationResponse[]>("/api/v1/organizations", options);
  return dtos.map(mapOrganization);
}

export async function getOrganization(
  organizationId: string,
  options?: Omit<RequestOptions, "method" | "body">,
): Promise<Organization> {
  const dto = await apiClient.get<OrganizationResponse>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}`,
    options,
  );
  return mapOrganization(dto);
}

export async function createOrganization(
  payload: CreateOrganizationRequest,
  options?: Omit<RequestOptions, "method" | "body">,
): Promise<Organization> {
  const dto = await apiClient.post<OrganizationResponse>(
    "/api/v1/organizations",
    payload,
    options,
  );
  return mapOrganization(dto);
}
