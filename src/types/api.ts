export interface CurrentUserResponse {
  id: string;
  email: string | null;
}

export interface OrganizationResponse {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrganizationRequest {
  name: string;
}

export interface AssistantResponse {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  welcome_message: string;
  assistant_instructions: string;
  logo_url: string | null;
  primary_color: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAssistantRequest {
  name: string;
  description?: string | null;
  welcome_message?: string;
  assistant_instructions?: string;
  logo_url?: string | null;
  primary_color?: string;
}

export interface UpdateAssistantRequest {
  name?: string;
  description?: string | null;
  welcome_message?: string;
  assistant_instructions?: string;
  logo_url?: string | null;
  primary_color?: string;
}

export interface DocumentResponse {
  id: string;
  assistant_id: string;
  original_filename: string;
  created_at: string;
}

export interface DocumentUploadResponse {
  document_id: string;
  assistant_id: string;
  original_filename: string;
  processed_page_count: number;
  chunk_count: number;
}

export interface ChatRequest {
  message: string;
}

export interface ChatSourceResponse {
  document: string;
  page: number;
}

export interface ChatResponse {
  answer: string;
  sources: ChatSourceResponse[];
}

export interface HealthResponse {
  status: string;
}

export interface FastApiValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface FastApiErrorPayload {
  detail?: string | FastApiValidationErrorDetail[];
}
