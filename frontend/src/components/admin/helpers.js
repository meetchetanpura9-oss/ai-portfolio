/** Formatting helpers shared by the admin panels. */

export function formatDate(value, withTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

/** null/undefined mean "the provider did not report this", which is not the same as zero. */
export function formatMetric(value, suffix = "") {
  return value === null || value === undefined ? "—" : `${value.toLocaleString()}${suffix}`;
}

export const STATUS_TONES = {
  // subscribers
  active: "emerald",
  pending: "amber",
  unsubscribed: "gray",
  suppressed: "rose",
  // campaigns
  draft: "gray",
  scheduled: "cyan",
  sending: "amber",
  sent: "emerald",
  failed: "rose",
  cancelled: "gray",
  // case studies
  published: "emerald",
};

/** Value for <input type="datetime-local"> in the browser's own time zone. */
export function toLocalInputValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function splitLines(text) {
  return (text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
