/**
 * Axios instance for portfolio API.
 * Set VITE_API_URL in .env for a deployed API URL.
 * In dev, relative /api requests are proxied by vite.config.js.
 */
import axios from "axios";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isLocalApiUrl(url) {
  try {
    return LOCAL_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

function resolveBaseURL() {
  const envUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");
  const pageHost = window.location.hostname;
  const isLocalHost = LOCAL_HOSTS.has(pageHost);

  if (envUrl) {
    if (!isLocalApiUrl(envUrl) || isLocalHost) {
      return envUrl;
    }
  }

  return isLocalHost ? "/api" : window.location.origin;
}

export const api = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

/** Submit contact form to POST /contact */
export async function submitContact(data) {
  const { data: response } = await api.post("/contact", data);
  return response;
}
