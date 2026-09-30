import axios from "axios";

function resolveBaseURL() {
  if (typeof window === "undefined") return "/api";

  const envUrl = process.env.NEXT_PUBLIC_API_URL || "";
  if (envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, "");
  }

  return "/api";
}

export const api = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

export interface ContactData {
  full_name: string;
  email: string;
  phone: string;
  company?: string;
  service: string;
  message: string;
  website?: string; // Honeypot field
}

export async function submitContact(data: ContactData) {
  const { data: response } = await api.post("/contact", data);
  return response;
}
