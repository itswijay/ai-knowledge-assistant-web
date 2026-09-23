import type { DocumentResponse, DocumentUploadResponse } from "@/types/api";
import type { Document, DocumentUploadResult } from "@/types/domain";

import { apiClient, type RequestOptions } from "./client";

export function mapDocument(dto: DocumentResponse): Document {
  return {
    id: dto.id,
    assistantId: dto.assistant_id,
    originalFilename: dto.original_filename,
    createdAt: dto.created_at,
  };
}

export function mapDocumentUploadResult(dto: DocumentUploadResponse): DocumentUploadResult {
  return {
    documentId: dto.document_id,
    assistantId: dto.assistant_id,
    originalFilename: dto.original_filename,
    processedPageCount: dto.processed_page_count,
    chunkCount: dto.chunk_count,
  };
}

export async function listDocuments(
  assistantId: string,
  options?: Omit<RequestOptions, "method" | "body">,
): Promise<Document[]> {
  const dtos = await apiClient.get<DocumentResponse[]>(
    `/api/v1/assistants/${encodeURIComponent(assistantId)}/documents`,
    options,
  );
  return dtos.map(mapDocument);
}

export async function uploadDocument(
  assistantId: string,
  file: File,
  options?: Omit<RequestOptions, "method" | "body">,
): Promise<DocumentUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const dto = await apiClient.upload<DocumentUploadResponse>(
    `/api/v1/assistants/${encodeURIComponent(assistantId)}/documents`,
    formData,
    options,
  );
  return mapDocumentUploadResult(dto);
}

export async function deleteDocument(
  documentId: string,
  options?: Omit<RequestOptions, "method" | "body">,
): Promise<void> {
  await apiClient.delete<void>(
    `/api/v1/documents/${encodeURIComponent(documentId)}`,
    options,
  );
}
