/**
 * Certifications & Learning.
 *
 * The three entries below are the Infosys Springboard certificates listed on
 * your current CV. Their credential IDs, verification links and files still
 * need to be added.
 *
 * To add a certificate, copy the TEMPLATE at the bottom, fill it in and append it.
 * Put image/PDF files in public/certificates/ and reference them as
 * "/certificates/<file>". Empty fields are simply hidden on the card.
 */

export const CERT_CATEGORIES = [
  "Artificial Intelligence",
  "Machine Learning",
  "Generative AI",
  "Cloud Computing",
  "Software Development",
  "Data Analytics",
  "Other",
];

export const CERTIFICATIONS = [
  {
    id: "infosys-intro-ai",
    title: "Introduction to Artificial Intelligence",
    issuer: "Infosys Springboard",
    issueDate: "2026-03",
    credentialId: null,
    verifyUrl: null,
    file: null, // e.g. "/certificates/infosys-intro-ai.pdf"
    skills: ["AI Fundamentals"],
    category: "Artificial Intelligence",
  },
  {
    id: "infosys-intro-deep-learning",
    title: "Introduction to Deep Learning",
    issuer: "Infosys Springboard",
    issueDate: "2026-03",
    credentialId: null,
    verifyUrl: null,
    file: null,
    skills: ["Deep Learning", "Neural Networks"],
    category: "Machine Learning",
  },
  {
    id: "infosys-intro-data-science",
    title: "Introduction to Data Science",
    issuer: "Infosys Springboard",
    issueDate: "2026-03",
    credentialId: null,
    verifyUrl: null,
    file: null,
    skills: ["Data Science"],
    category: "Data Analytics",
  },
  {
    id: "github-skills-agent-orchestration",
    title: "Agent Orchestration: Build Your AI Dream Team",
    issuer: "GitHub Skills · hands-on exercise",
    issueDate: null,
    credentialId: null,
    verifyUrl: "https://github.com/meetchetanpura9-oss/skills-agent-orchestration-build-your-ai-dream-team",
    file: null,
    skills: ["Agent Orchestration", "Multi-Agent Systems"],
    category: "Generative AI",
  },
];

/*
TEMPLATE — copy into CERTIFICATIONS:
{
  id: "unique-slug",
  title: "",
  issuer: "",
  issueDate: "YYYY-MM",
  credentialId: null,
  verifyUrl: null,
  file: null,            // "/certificates/name.pdf" or "/certificates/name.png"
  skills: [],
  category: "Generative AI", // one of CERT_CATEGORIES
},
*/
