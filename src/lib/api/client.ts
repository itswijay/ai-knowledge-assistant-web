import { getPublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

import { ApiError, parseApiError } from "./errors";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | null | undefined>;
  authRequired?: boolean;
  body?: unknown;
  retryCount?: number;
  token?: string | null;
}

async function getAccessToken(): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      return null;
    }
    return data.session.access_token;
  } catch {
    return null;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) {
      return null;
    }
    return data.session.access_token;
  } catch {
    return null;
  }
}

export function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>,
  baseUrl?: string,
): string {
  const base = (baseUrl ?? getPublicEnv().NEXT_PUBLIC_API_BASE_URL).replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    params,
    authRequired = true,
    body,
    retryCount = 0,
    token: explicitToken,
    headers: customHeaders,
    signal,
    ...fetchInit
  } = options;

  const url = buildUrl(path, params);
  const headers = new Headers(customHeaders);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  let authToken = explicitToken;
  if (authRequired) {
    if (authToken === undefined) {
      authToken = await getAccessToken();
    }

    if (!authToken) {
      throw new ApiError(401, "Authentication credentials were not provided");
    }

    headers.set("Authorization", `Bearer ${authToken}`);
  }

  let requestBody: BodyInit | undefined;
  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      requestBody = body;
      // Do not set Content-Type for FormData; browser sets boundary automatically
    } else {
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      requestBody = JSON.stringify(body);
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchInit,
      headers,
      body: requestBody,
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError(
      0,
      error instanceof Error ? error.message : "Network connection failed",
      { cause: error },
    );
  }

  // Handle 401 token refresh retry (one-time)
  if (response.status === 401 && authRequired && retryCount === 0) {
    const newToken = await refreshAccessToken();
    if (newToken && newToken !== authToken) {
      return request<T>(path, {
        ...options,
        token: newToken,
        retryCount: 1,
      });
    }
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    if (!response.ok) {
      throw parseApiError(response.status, null);
    }
    return undefined as unknown as T;
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = isJson ? await response.json() : await response.text();
    } catch {
      errorData = null;
    }
    throw parseApiError(response.status, errorData);
  }

  if (isJson) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}

export const apiClient = {
  get<T>(path: string, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return request<T>(path, { ...options, method: "GET" });
  },

  post<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ): Promise<T> {
    return request<T>(path, { ...options, method: "POST", body });
  },

  patch<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ): Promise<T> {
    return request<T>(path, { ...options, method: "PATCH", body });
  },

  delete<T = void>(path: string, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return request<T>(path, { ...options, method: "DELETE" });
  },

  upload<T>(
    path: string,
    formData: FormData,
    options?: Omit<RequestOptions, "method" | "body">,
  ): Promise<T> {
    return request<T>(path, { ...options, method: "POST", body: formData });
  },
};
