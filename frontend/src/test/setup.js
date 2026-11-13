import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Safety net: a component test must never reach a real server. The API modules are
// mocked in each test; anything that slips through fails loudly here.
const blocked = (what) => () => {
  throw new Error(`Network access is blocked in tests (${what}). Mock the API module instead.`);
};
globalThis.fetch = vi.fn(blocked("fetch"));
globalThis.XMLHttpRequest = vi.fn(blocked("XMLHttpRequest"));

window.scrollTo = vi.fn();
window.matchMedia =
  window.matchMedia ||
  ((query) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }));

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState(null, "", "/admin");
});
