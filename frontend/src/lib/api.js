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

  // If a specific backend URL is configured (e.g. Render), use it!
  if (envUrl) {
    return envUrl;
  }

  // Otherwise, default to relative "/api" prefix.
  // Locally, Vite proxies "/api" to http://localhost:8000 (FastAPI).
  // On Vercel, "/api/contact" is handled by the api/contact.js serverless function.
  return "/api";
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
