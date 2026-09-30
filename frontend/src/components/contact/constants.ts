/** Service dropdown options */
export const SERVICE_OPTIONS = [
  "Machine Learning Consulting",
  "Data Analytics & BI",
  "AI / LLM Development",
  "Deep Learning Solutions",
  "Mentorship / Collaboration",
  "Other",
];

/** Public contact links — fallback to Meet's details */
export const CONTACT_LINKS = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "meetchetanpura9@gmail.com",
  linkedin: process.env.NEXT_PUBLIC_CONTACT_LINKEDIN || "https://linkedin.com/in/chetanpurameet",
  github: process.env.NEXT_PUBLIC_CONTACT_GITHUB || "https://github.com/meetchetanpura9-oss",
  location: process.env.NEXT_PUBLIC_CONTACT_LOCATION || "Gujarat, India",
  available: true,
};

export const INITIAL_FORM = {
  full_name: "",
  email: "",
  phone: "",
  company: "",
  service: "",
  message: "",
  website: "", // honeypot
};
