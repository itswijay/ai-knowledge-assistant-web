import type { ChatRequest, ChatResponse, WidgetConfigResponse } from "@/types/api";
import type { ChatResult } from "@/types/domain";

import { mapChatResult } from "./chat";
import { apiClient } from "./client";

export async function getWidgetConfig(
  assistantId: string,
): Promise<WidgetConfigResponse> {
  return apiClient.get<WidgetConfigResponse>(
    `/api/v1/widget/${encodeURIComponent(assistantId)}/config`,
    { authRequired: false },
  );
}

export async function sendWidgetChatMessage(
  assistantId: string,
  payload: ChatRequest,
): Promise<ChatResult> {
  const dto = await apiClient.post<ChatResponse>(
    `/api/v1/widget/${encodeURIComponent(assistantId)}/chat`,
    payload,
    { authRequired: false },
  );
  return mapChatResult(dto);
}
