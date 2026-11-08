/**
 * Axios instance for the portfolio API.
 *
 * - Production: set VITE_API_URL (e.g. https://ai-portfolio-8wpd.onrender.com) in Vercel.
 * - Development: without VITE_API_URL, relative /api requests are proxied by vite.config.js.
 *
 * The API runs on Render's free plan, which sleeps after ~15 minutes idle and takes
 * up to ~50 s to wake. So we (1) ping /health as soon as the site loads, (2) allow a
 * long timeout and (3) retry once on network errors/timeouts.
 */
import axios from "axios";

function resolveBaseURL() {
  const envUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");
  return envUrl || "/api";
}

export const api = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 75000,
  headers: { "Content-Type": "application/json" },
});

let wakePromise = null;

/** Wake the API early so it is ready by the time a visitor submits a form. */
export function wakeApi() {
  if (!wakePromise) {
    wakePromise = api.get("/health", { timeout: 75000 }).catch(() => null);
  }
  return wakePromise;
}

const isRetryable = (err) => !err.response || err.code === "ECONNABORTED" || [502, 503, 504].includes(err.response?.status);

/** POST with one automatic retry for cold starts / flaky networks (not for validation errors). */
export async function postWithRetry(url, data, config) {
  try {
    return await api.post(url, data, config);
  } catch (err) {
    if (!isRetryable(err)) throw err;
    await wakeApi();
    return api.post(url, data, config);
  }
}

/** Human-friendly message for any API error. */
export function apiErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  if (err?.response) {
    const { status, data } = err.response;
    if (status === 429) return "Too many requests. Please wait a minute and try again.";
    const detail = data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((d) => (d.msg || d.message || "").replace(/^Value error, /, ""))
        .filter(Boolean)
        .join(", ");
    }
    if (status >= 500) return "The server had a problem. Please try again in a minute.";
    return fallback;
  }
  if (err?.code === "ECONNABORTED") return "The server is taking too long to respond. Please try again.";
  return "Can't reach the server right now. Check your connection and try again.";
}

/** Submit contact form to POST /contact */
export async function submitContact(data) {
  const { data: response } = await postWithRetry("/contact", data);
  return response;
}
