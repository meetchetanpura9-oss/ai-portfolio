import { PROFILE } from "../../data/profile";

/** Choosing this option reveals a text field so the visitor can describe their own service. */
export const CUSTOM_SERVICE = "Other (describe your own)";

/** Service dropdown options. The backend also accepts any custom service text. */
export const SERVICE_OPTIONS = [
  "AI Agent / Workflow Automation",
  "AI / LLM Application",
  "Machine Learning Model",
  "Data Analytics & BI",
  "Web / Business Software",
  "Mentorship / Collaboration",
  CUSTOM_SERVICE,
];

/** Public contact links — sourced from data/profile.js */
export const CONTACT_LINKS = {
  email: PROFILE.email,
  linkedin: PROFILE.linkedin,
  github: PROFILE.github,
  location: PROFILE.location,
  available: PROFILE.available,
};

export const INITIAL_FORM = {
  full_name: "",
  email: "",
  phone: "",
  company: "",
  service: "",
  custom_service: "",
  message: "",
  website: "",
};
