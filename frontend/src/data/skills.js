/**
 * Skills shown in the Skills section.
 *
 * PROVISIONAL: these categories follow the list you suggested in your brief
 * (Power BI removed). Replace / trim entries once you send your final list —
 * no other file needs to change.
 *
 * Each skill: { name, icon }. `icon` can be any react-icons / lucide component.
 */
import {
  SiPython,
  SiNumpy,
  SiPandas,
  SiScikitlearn,
  SiLangchain,
  SiJavascript,
  SiTypescript,
  SiFastapi,
  SiNodedotjs,
  SiPostgresql,
  SiNextdotjs,
  SiReact,
  SiTailwindcss,
} from "react-icons/si";
import {
  BrainCircuit,
  Sparkles,
  Bot,
  Code2,
  Server,
  LayoutTemplate,
  BarChart3,
  TreePine,
  Layers,
  MessagesSquare,
  FileSearch,
  GitBranch,
  Boxes,
  Network,
  Wrench,
  Workflow,
  Database,
  Sheet,
  PieChart,
  LineChart,
} from "lucide-react";

export const SKILL_CATEGORIES = [
  {
    id: "ml",
    label: "AI & Machine Learning",
    icon: BrainCircuit,
    tone: "var(--brand-violet)",
    skills: [
      { name: "Python", icon: SiPython },
      { name: "NumPy", icon: SiNumpy },
      { name: "Pandas", icon: SiPandas },
      { name: "Scikit-learn", icon: SiScikitlearn },
      { name: "XGBoost", icon: TreePine },
      { name: "Deep Learning", icon: Layers },
    ],
  },
  {
    id: "genai",
    label: "Generative AI",
    icon: Sparkles,
    tone: "var(--brand-blue)",
    skills: [
      { name: "LLMs", icon: MessagesSquare },
      { name: "RAG", icon: FileSearch },
      { name: "LangChain", icon: SiLangchain },
      { name: "LangGraph", icon: GitBranch },
      { name: "Vector Databases", icon: Boxes },
    ],
  },
  {
    id: "agentic",
    label: "Agentic AI",
    icon: Bot,
    tone: "var(--brand-cyan)",
    skills: [
      { name: "AI Agents", icon: Bot },
      { name: "Multi-Agent Systems", icon: Network },
      { name: "Tool Calling", icon: Wrench },
      { name: "Workflow Automation", icon: Workflow },
    ],
  },
  {
    id: "programming",
    label: "Programming",
    icon: Code2,
    tone: "var(--brand-amber)",
    skills: [
      { name: "Python", icon: SiPython },
      { name: "SQL", icon: Database },
      { name: "JavaScript", icon: SiJavascript },
      { name: "TypeScript", icon: SiTypescript },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    icon: Server,
    tone: "var(--brand-emerald)",
    skills: [
      { name: "FastAPI", icon: SiFastapi },
      { name: "Node.js", icon: SiNodedotjs },
      { name: "PostgreSQL", icon: SiPostgresql },
    ],
  },
  {
    id: "frontend",
    label: "Frontend",
    icon: LayoutTemplate,
    tone: "var(--brand-rose)",
    skills: [
      { name: "Next.js", icon: SiNextdotjs },
      { name: "React", icon: SiReact },
      { name: "Tailwind CSS", icon: SiTailwindcss },
    ],
  },
  {
    id: "data",
    label: "Data & Visualization",
    icon: BarChart3,
    tone: "var(--brand-blue)",
    skills: [
      { name: "Excel", icon: Sheet },
      { name: "Tableau", icon: PieChart },
      { name: "Data Visualization", icon: LineChart },
    ],
  },
];
