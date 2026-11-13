/**
 * Authenticated calls for the admin dashboard.
 *
 * The JWT is sent as a Bearer header (never a cookie), so cross-site requests cannot
 * ride on the session. The backend re-checks the token and the admin role on every
 * call — nothing here is a security boundary.
 */
import { api, apiErrorMessage } from "./api";

function expireSession() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminName");
  window.history.pushState(null, "", "/login");
}

export async function adminRequest(method, url, { data, params, headers, ...rest } = {}) {
  try {
    const response = await api.request({
      method,
      url,
      data,
      params,
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}`, ...headers },
      ...rest,
    });
    return response.data;
  } catch (err) {
    if (err.response?.status === 401) expireSession();
    throw err;
  }
}

export const adminGet = (url, params) => adminRequest("get", url, { params });
export const adminPost = (url, data, config) => adminRequest("post", url, { data, ...config });
export const adminPut = (url, data) => adminRequest("put", url, { data });
export const adminPatch = (url, data) => adminRequest("patch", url, { data });
export const adminDelete = (url, params) => adminRequest("delete", url, { params });

export function adminError(err, fallback = "Something went wrong. Please try again.") {
  if (err?.response?.status === 401) return "Session expired. Please log in again.";
  if (err?.response?.status === 403) return "Your account does not have administrator access.";
  return apiErrorMessage(err, fallback);
}

/** Download a file from an authenticated endpoint. */
export async function adminDownload(url, params, filename) {
  const blob = await adminRequest("get", url, { params, responseType: "blob" });
  const href = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(href);
}

/** Upload one image as the raw request body. Returns { url, filename, ... }. */
export function adminUploadImage(file) {
  return adminRequest("post", "/admin/media", {
    data: file,
    params: { filename: file.name },
    headers: { "Content-Type": file.type },
  });
}
