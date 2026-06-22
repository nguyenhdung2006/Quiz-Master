const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE_URL = (
  configuredApiBaseUrl || (import.meta.env.DEV ? "http://localhost:8080" : "")
).replace(/\/+$/, "");
const TOKEN_STORAGE_KEY = "quizmaster.accessToken";
export const UNAUTHORIZED_EVENT = "quizmaster:unauthorized";
const REQUEST_TIMEOUT_MS = 8000;
const NETWORK_ERROR_MESSAGE =
  "Không kết nối được máy chủ. Kiểm tra backend hoặc thử lại sau.";

const STATUS_MESSAGES = {
  400: "Dữ liệu không hợp lệ.",
  401: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  403: "Bạn không có quyền thực hiện thao tác này.",
  404: "Không tìm thấy dữ liệu được yêu cầu.",
  500: "Máy chủ đang gặp lỗi. Vui lòng thử lại sau.",
};

export class ApiError extends Error {
  constructor(message, { status = null, body = null, cause = null, isNetworkError = false } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.cause = cause;
    this.isNetworkError = isNetworkError;
  }
}

export function getErrorMessage(error, fallbackMessage = "Đã xảy ra lỗi. Vui lòng thử lại.") {
  return typeof error?.message === "string" && error.message.trim()
    ? error.message
    : fallbackMessage;
}

export function isUnauthorized(error) {
  return error?.status === 401;
}

export function isForbidden(error) {
  return error?.status === 403;
}

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
  const {
    attachToken = true,
    handleUnauthorized = true,
    ...fetchOptions
  } = options;
  const token = getAccessToken();
  const headers = new Headers(fetchOptions.headers);

  if (!headers.has("Content-Type") && fetchOptions.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token && attachToken) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response;
  const controller = fetchOptions.signal ? null : new AbortController();
  const timeoutId = controller
    ? window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    : null;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
      signal: fetchOptions.signal || controller?.signal,
    });
  } catch (requestError) {
    throw new ApiError(NETWORK_ERROR_MESSAGE, {
      cause: requestError,
      isNetworkError: true,
    });
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
    const fallbackMessage =
      STATUS_MESSAGES[response.status] ||
      (response.status >= 500
        ? STATUS_MESSAGES[500]
        : `Yêu cầu thất bại (mã ${response.status}).`);
    const error = new ApiError(data?.message || fallbackMessage, {
      status: response.status,
      body: data,
    });

    if (response.status === 401 && token && handleUnauthorized) {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT, { detail: error }));
    }

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
