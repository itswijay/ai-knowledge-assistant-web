import type {
  AssistantResponse,
  CreateAssistantRequest,
  UpdateAssistantRequest,
} from "@/types/api";
import type { Assistant } from "@/types/domain";

import { apiClient, type RequestOptions } from "./client";

export function mapAssistant(dto: AssistantResponse): Assistant {
  return {
    id: dto.id,
    organizationId: dto.organization_id,
    name: dto.name,
    description: dto.description,
    welcomeMessage: dto.welcome_message,
    assistantInstructions: dto.assistant_instructions,
    logoUrl: dto.logo_url,
    primaryColor: dto.primary_color,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export async function listAssistants(
  organizationId: string,
  options?: Omit<RequestOptions, "method" | "body">,
): Promise<Assistant[]> {
  const dtos = await apiClient.get<AssistantResponse[]>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/assistants`,
    options,
  );
  return dtos.map(mapAssistant);
}

export async function getAssistant(
  assistantId: string,
  options?: Omit<RequestOptions, "method" | "body">,
): Promise<Assistant> {
  const dto = await apiClient.get<AssistantResponse>(
    `/api/v1/assistants/${encodeURIComponent(assistantId)}`,
    options,
  );
  return mapAssistant(dto);
}

export async function createAssistant(
  organizationId: string,
  payload: CreateAssistantRequest,
  options?: Omit<RequestOptions, "method" | "body">,
): Promise<Assistant> {
  const dto = await apiClient.post<AssistantResponse>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/assistants`,
    payload,
    options,
  );
  return mapAssistant(dto);
}

export async function updateAssistant(
  assistantId: string,
  payload: UpdateAssistantRequest,
  options?: Omit<RequestOptions, "method" | "body">,
): Promise<Assistant> {
  const dto = await apiClient.patch<AssistantResponse>(
    `/api/v1/assistants/${encodeURIComponent(assistantId)}`,
    payload,
    options,
  );
  return mapAssistant(dto);
}

export async function deleteAssistant(
  assistantId: string,
  options?: Omit<RequestOptions, "method" | "body">,
): Promise<void> {
  await apiClient.delete<void>(
    `/api/v1/assistants/${encodeURIComponent(assistantId)}`,
    options,
  );
}
