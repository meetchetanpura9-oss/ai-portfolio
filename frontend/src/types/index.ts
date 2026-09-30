import type { IconType } from "react-icons";
import type { StaticImageData } from "next/image";

export interface Skill {
  name: string;
  tier: "Proficient" | "Working Knowledge" | "Currently Learning";
  percentage?: number;
}

export interface SkillCategory {
  id: string;
  label: string;
  tabIcon: IconType;
  orbitIcons: IconType[];
  skills: Skill[];
}

export interface CaseStudyDetail {
  oneLineOutcome: string;
  summary: string;
  challenge: string;
  solution: string;
  role: string;
  architectureDescription: string;
  architectureNodes: { step: string; label: string; detail: string }[];
  keyResults: { label: string; value: string; detail: string }[];
  gallery: { title: string; caption: string; type: "image" | "code" | "diagram" }[];
  lessonsLearned: string[];
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  year: string;
  oneLiner: string;
  problem: string;
  solution: string;
  description: string;
  serviceCategory: string;
  technologies: string[];
  impact: string;
  coverImage?: string;
  githubUrl?: string;
  demoUrl?: string | null;
  featured: boolean;
  caseStudy?: CaseStudyDetail;
}

export interface LegacyCaseStudyDetail {
  challenge: string;
  approach: string;
  architecture: string;
  modelDetails: string;
  businessResult: string;
}

export interface LegacyProject {
  id: string;
  title: string;
  category: string;
  problem: string;
  solution: string;
  description: string;
  tech: string[];
  impact: string;
  github: string | null;
  demo: string | null;
  featured: boolean;
  span: "large" | "wide" | "default";
  glow: string;
  accent: string;
  caseStudy?: LegacyCaseStudyDetail;
}

export interface ServiceItem {
  number: string;
  title: string;
  description: string;
  deliverables: string[];
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
  details: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  description: string;
  skills: string[];
  credentialUrl: string | null;
  badgeImage: string | StaticImageData;
  glowColor?: string;
  accentGradient?: string;
}

export interface EducationItem {
  period: string;
  degree: string;
  title: string;
  institution: string;
  status: "current" | "completed";
}
