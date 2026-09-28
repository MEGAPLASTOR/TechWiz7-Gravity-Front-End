export const BACKEND_URL = import.meta.env.VITE_BACKEND_TARGET || "http://172.16.2.89:8081";
export const SWAGGER_DOCS_URL = import.meta.env.VITE_SWAGGER_URL || `${BACKEND_URL}/swagger-ui/index.html`;

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "";
export function formatImageUrl(
  url,
  fallback = "https://images.unsplash.com/photo-1540420773420-3366772f4999",
) {
  if (!url) return fallback;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${IMAGE_BASE_URL}${cleanPath}`;
}
export async function apiRequest(
  endpoint,
  { method = "GET", body = null, headers = {}, token = null } = {},
) {
  let cleanEndpoint = endpoint;
  if (cleanEndpoint.startsWith("/api/")) {
    cleanEndpoint = cleanEndpoint.substring(4);
  }
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${BASE_URL}${cleanEndpoint.startsWith("/") ? "" : "/"}${cleanEndpoint}`;
  const requestHeaders = {
    ...headers,
  };
  const activeToken =
    token ||
    localStorage.getItem("ml_token") ||
    localStorage.getItem("accessToken");
  if (activeToken) {
    requestHeaders["Authorization"] = `Bearer ${activeToken}`;
  }
  if (body && !(body instanceof FormData) && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json; charset=utf-8";
  }
  const config = {
    method,
    headers: requestHeaders,
  };
  if (body) {
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }
  try {
    const res = await fetch(url, config);
    let responseData = null;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      responseData = await res.json();
    } else {
      const text = await res.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = {
          message: text,
        };
      }
    }
    if (!res.ok) {
      const errMsg =
        responseData?.message ||
        responseData?.error ||
        `Lỗi máy chủ (${res.status})`;
      const error = new Error(errMsg);
      error.status = res.status;
      error.data = responseData;
      throw error;
    }
    return responseData;
  } catch (err) {
    console.warn(`[API ${method}] ${url} failed:`, err.message);
    if (err.message === "Failed to fetch") {
      const friendlyErr = new Error(
        "Không thể kết nối đến máy chủ Backend (Port 8081). Vui lòng đảm bảo Spring Boot backend đang chạy.",
      );
      friendlyErr.status = 0;
      throw friendlyErr;
    }
    throw err;
  }
}
export default {
  get: (endpoint, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "GET",
    }),
  post: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "POST",
      body,
    }),
  put: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "PUT",
      body,
    }),
  patch: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "PATCH",
      body,
    }),
  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "DELETE",
    }),
  formatImageUrl,
};
