import type { ChatRequest, ChatResponse } from "@/types/api";
import type { ChatResult } from "@/types/domain";

import { apiClient, type RequestOptions } from "./client";

export function mapChatResult(dto: ChatResponse): ChatResult {
  return {
    answer: dto.answer,
    sources: (dto.sources || []).map((source) => ({
      document: source.document,
      page: source.page,
    })),
  };
}

export async function sendChatMessage(
  assistantId: string,
  payload: ChatRequest,
  options?: Omit<RequestOptions, "method" | "body">,
): Promise<ChatResult> {
  const dto = await apiClient.post<ChatResponse>(
    `/api/v1/assistants/${encodeURIComponent(assistantId)}/chat`,
    payload,
    options,
  );
  return mapChatResult(dto);
}
