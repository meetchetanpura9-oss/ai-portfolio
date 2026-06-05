/** Service dropdown options — must match backend SERVICE_OPTIONS */
export const SERVICE_OPTIONS = [
  "Machine Learning Consulting",
  "Data Analytics & BI",
  "AI / LLM Development",
  "Deep Learning Solutions",
  "Mentorship / Collaboration",
  "Other",
];

/** Public contact links — customize or use VITE_ env vars */
export const CONTACT_LINKS = {
  email: import.meta.env.VITE_CONTACT_EMAIL || "meetchetanpura9@gmail.com",
  linkedin:
    import.meta.env.VITE_CONTACT_LINKEDIN || "https://linkedin.com/in/chetanpurameet",
  github: import.meta.env.VITE_CONTACT_GITHUB || "https://github.com/meetchetanpura9-oss",
  location: import.meta.env.VITE_CONTACT_LOCATION || "Gujarat, India",
  available: true,
};

export const INITIAL_FORM = {
  full_name: "",
  email: "",
  phone: "",
  company: "",
  service: "",
  message: "",
  website: "",
};
