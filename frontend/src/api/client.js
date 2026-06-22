const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE_URL = (
  configuredApiBaseUrl || (import.meta.env.DEV ? "http://localhost:8080" : "")
).replace(/\/+$/, "");
const TOKEN_STORAGE_KEY = "quizmaster.accessToken";
const REQUEST_TIMEOUT_MS = 8000;
const NETWORK_ERROR_MESSAGE =
  "Không kết nối được máy chủ. Kiểm tra backend hoặc thử lại sau.";

const STATUS_MESSAGES = {
  401: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  403: "Bạn không có quyền thực hiện thao tác này.",
  404: "Không tìm thấy dữ liệu được yêu cầu.",
  500: "Máy chủ đang gặp lỗi. Vui lòng thử lại sau.",
};

export function getAccessToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAccessToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    return;
  }

  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function apiRequest(path, options = {}) {
  const token = getAccessToken();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response;
  const controller = options.signal ? null : new AbortController();
  const timeoutId = controller
    ? window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    : null;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: options.signal || controller?.signal,
    });
  } catch (requestError) {
    const error = new Error(NETWORK_ERROR_MESSAGE);
    error.cause = requestError;
    error.isNetworkError = true;
    throw error;
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }

  const contentType = response.headers.get("content-type") || "";
  const hasJson = contentType.includes("application/json");
  const responseText = await response.text();
  let data = null;

  if (hasJson && responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const fallbackMessage = STATUS_MESSAGES[response.status] || `Request failed with status ${response.status}`;
    const error = new Error(data?.message || fallbackMessage);
    error.status = response.status;
    error.body = data;
    throw error;
  }

  return data;
}

export const apiClient = {
  get: (path, options) => apiRequest(path, { ...options, method: "GET" }),
  post: (path, body, options) =>
    apiRequest(path, {
      ...options,
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  put: (path, body, options) =>
    apiRequest(path, {
      ...options,
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  patch: (path, body, options) =>
    apiRequest(path, {
      ...options,
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  delete: (path, options) => apiRequest(path, { ...options, method: "DELETE" }),
};
