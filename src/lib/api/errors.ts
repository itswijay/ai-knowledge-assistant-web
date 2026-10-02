import type { FastApiErrorPayload, FastApiValidationErrorDetail } from "@/types/api";

function extractFieldName(loc: (string | number)[]): string {
  if (loc.length === 0) {
    return "root";
  }

  // Common FastAPI location prefixes: "body", "query", "path", "header", "cookie", "formData"
  const prefixes = new Set(["body", "query", "path", "header", "cookie", "formdata", "form"]);
  const filtered = loc.filter(
    (part, idx) => !(idx === 0 && typeof part === "string" && prefixes.has(part.toLowerCase())),
  );

  if (filtered.length === 0) {
    return String(loc[loc.length - 1]);
  }

  return filtered.map(String).join(".");
}

export class ApiError extends Error {
  readonly status: number;
  readonly details?: Record<string, string[]>;
  readonly rawDetail?: string | FastApiValidationErrorDetail[];

  constructor(
    statusOrMessage: number | string,
    messageOrOptions?:
      | string
      | {
          status?: number;
          details?: Record<string, string[]>;
          rawDetail?: string | FastApiValidationErrorDetail[];
          cause?: unknown;
        },
    maybeOptions?: {
      details?: Record<string, string[]>;
      rawDetail?: string | FastApiValidationErrorDetail[];
      cause?: unknown;
    },
  ) {
    let resolvedStatus = 500;
    let resolvedMessage = "An error occurred.";
    let resolvedOptions = maybeOptions;

    if (typeof statusOrMessage === "number") {
      resolvedStatus = statusOrMessage;
      resolvedMessage = typeof messageOrOptions === "string" ? messageOrOptions : "";
      resolvedOptions = maybeOptions;
    } else {
      resolvedMessage = statusOrMessage;
      if (typeof messageOrOptions === "object" && messageOrOptions !== null) {
        resolvedStatus = messageOrOptions.status ?? 500;
        resolvedOptions = messageOrOptions;
      }
    }

    super(resolvedMessage, { cause: resolvedOptions?.cause });
    this.name = "ApiError";
    this.status = resolvedStatus;
    this.details = resolvedOptions?.details;
    this.rawDetail = resolvedOptions?.rawDetail;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }

  get isPayloadTooLarge(): boolean {
    return this.status === 413;
  }

  get isValidationError(): boolean {
    return this.status === 422;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get fieldErrors(): Record<string, string> {
    const result: Record<string, string> = {};
    if (!this.details) {
      return result;
    }
    for (const [key, value] of Object.entries(this.details)) {
      if (value && value.length > 0) {
        result[key] = value[0];
      }
    }
    return result;
  }

  fieldError(fieldName: string): string | undefined {
    if (!this.details) {
      return undefined;
    }
    const errors = this.details[fieldName];
    return errors && errors.length > 0 ? errors[0] : undefined;
  }
}

function getDefaultStatusMessage(status: number): string {
  switch (status) {
    case 400:
      return "Bad request.";
    case 401:
      return "Authentication credentials were not provided or have expired.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "Resource conflicts with existing data.";
    case 413:
      return "The uploaded file exceeds the allowed size limit.";
    case 422:
      return "Validation failed for the submitted data.";
    case 502:
      return "Upstream service error.";
    case 503:
      return "Service is temporarily unavailable.";
    default:
      if (status >= 500) {
        return "An unexpected server error occurred.";
      }
      return "An unexpected error occurred.";
  }
}

export function parseApiError(
  status: number,
  data: unknown,
  fallbackMessage?: string,
): ApiError {
  const fallback = fallbackMessage || getDefaultStatusMessage(status);

  if (!data || typeof data !== "object") {
    const textMsg = typeof data === "string" && data.trim() ? data.trim() : fallback;
    return new ApiError(status, textMsg);
  }

  const payload = data as FastApiErrorPayload;

  if (typeof payload.detail === "string" && payload.detail.trim().length > 0) {
    return new ApiError(status, payload.detail.trim(), {
      rawDetail: payload.detail,
    });
  }

  if (Array.isArray(payload.detail)) {
    const details: Record<string, string[]> = {};
    const messages: string[] = [];

    for (const item of payload.detail) {
      if (typeof item === "object" && item !== null) {
        const field = extractFieldName(item.loc || []);
        const msg = item.msg || "Invalid value";

        if (!details[field]) {
          details[field] = [];
        }
        details[field].push(msg);
        messages.push(field !== "root" ? `${field}: ${msg}` : msg);
      }
    }

    const summaryMessage =
      messages.length > 0
        ? messages.slice(0, 3).join("; ") + (messages.length > 3 ? "..." : "")
        : fallback;

    return new ApiError(status, summaryMessage, {
      details,
      rawDetail: payload.detail,
    });
  }

  return new ApiError(status, fallback);
}
