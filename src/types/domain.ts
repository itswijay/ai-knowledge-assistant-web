export interface CurrentUser {
  id: string;
  email: string | null;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assistant {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  welcomeMessage: string;
  assistantInstructions: string;
  logoUrl: string | null;
  primaryColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  assistantId: string;
  originalFilename: string;
  createdAt: string;
}

export interface DocumentUploadResult {
  documentId: string;
  assistantId: string;
  originalFilename: string;
  processedPageCount: number;
  chunkCount: number;
}

export interface ChatSource {
  document: string;
  page: number;
}

export interface ChatResult {
  answer: string;
  sources: ChatSource[];
}
