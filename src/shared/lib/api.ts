import { ENV } from "@/shared/constants/config";

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown
  ) {
    super(`API Error ${status}`);
    this.name = "ApiError";
  }
}

type FetchConfig = RequestInit & { next?: NextFetchRequestConfig };

async function getAuthHeader(): Promise<HeadersInit> {
  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    const token = (await cookies()).get("access_token")?.value;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  try {
    const raw = localStorage.getItem("auth-storage");
    if (raw) {
      const { state } = JSON.parse(raw);
      if (state?.accessToken) return { Authorization: `Bearer ${state.accessToken}` };
    }
  } catch {}
  return {};
}

async function request<T>(url: string, config?: FetchConfig): Promise<T> {
  const authHeader = await getAuthHeader();

  const res = await fetch(`${ENV.API_URL}${url}`, {
    headers: { "Content-Type": "application/json", ...authHeader, ...config?.headers },
    ...config,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (res.status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(res.status, body);
  }

  return res.json();
}

export const api = {
  get: <T>(url: string, config?: FetchConfig) => request<T>(url, { method: "GET", ...config }),

  post: <T>(url: string, body: unknown, config?: FetchConfig) =>
    request<T>(url, { method: "POST", body: JSON.stringify(body), ...config }),

  patch: <T>(url: string, body: unknown, config?: FetchConfig) =>
    request<T>(url, { method: "PATCH", body: JSON.stringify(body), ...config }),

  put: <T>(url: string, body: unknown, config?: FetchConfig) =>
    request<T>(url, { method: "PUT", body: JSON.stringify(body), ...config }),

  delete: <T>(url: string, config?: FetchConfig) =>
    request<T>(url, { method: "DELETE", ...config }),
};
