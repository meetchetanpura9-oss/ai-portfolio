import { MessageSquareText, BrainCircuit, Wrench, Bot, ShieldCheck, Send, Network, Database, Workflow, Gauge } from "lucide-react";

/**
 * Illustrative agent loop used by the Agentic AI section.
 * `pos` is the node centre in the 600×380 desktop diagram.
 */
export const WORKFLOW_STEPS = [
  {
    id: "request",
    label: "User Request",
    role: "Goal intake",
    icon: MessageSquareText,
    tone: "var(--muted)",
    pos: [100, 80],
    description:
      "A person describes an outcome in plain language. The agent treats it as a goal to achieve, not a single prompt to answer.",
    trace: ['input   › "Find 3 recent papers on RAG and summarise the key ideas"', "type    › research + summarisation goal"],
  },
  {
    id: "planner",
    label: "AI Planner",
    role: "Reasoning & decomposition",
    icon: BrainCircuit,
    tone: "var(--brand-violet)",
    pos: [300, 80],
    description:
      "An LLM breaks the goal into ordered sub-tasks, works out what information is missing and sets success criteria for the final answer.",
    trace: ["plan    › 1 search · 2 filter by date · 3 read · 4 summarise", "done-if › 3 papers · < 12 months old · sources cited"],
  },
  {
    id: "tools",
    label: "Tool Selection",
    role: "Capability routing",
    icon: Wrench,
    tone: "var(--brand-blue)",
    pos: [500, 80],
    description:
      "For each sub-task the agent picks a tool from its registry by reading tool descriptions and schemas — search APIs, document readers, code, databases.",
    trace: ["tools   › web_search · pdf_reader · summarizer", 'call    › web_search({ q: "retrieval augmented generation" })'],
  },
  {
    id: "execute",
    label: "Agent Execution",
    role: "Act · observe · repeat",
    icon: Bot,
    tone: "var(--brand-cyan)",
    pos: [500, 300],
    description:
      "The agent runs tool calls, observes the results and updates its working memory, looping until each sub-task is complete.",
    trace: ["observe › 14 results → 5 relevant", "memory  › 3 papers selected · abstracts parsed"],
  },
  {
    id: "evaluate",
    label: "Result Evaluation",
    role: "Self-check & guardrails",
    icon: ShieldCheck,
    tone: "var(--brand-amber)",
    pos: [300, 300],
    description:
      "Before responding, the output is checked against the success criteria. If something is missing or unsupported, control loops back to the planner.",
    trace: ["check   › papers 3/3 ✓ · dates ✓ · citations ✓", "on-fail › return to planner with feedback"],
  },
  {
    id: "respond",
    label: "Final Response",
    role: "Grounded delivery",
    icon: Send,
    tone: "var(--brand-emerald)",
    pos: [100, 300],
    description:
      "The agent returns a structured, sourced answer — or hands off to another agent and triggers the next step in a larger workflow.",
    trace: ["output  › summary + key ideas + 3 citations", "status  › goal complete"],
  },
];

export const CAPABILITIES = [
  {
    icon: Network,
    title: "Multi-agent orchestration",
    text: "Specialised agents — planner, researcher, critic — coordinated through a shared state graph.",
  },
  {
    icon: Workflow,
    title: "Tool calling",
    text: "Typed tool schemas let models call APIs, search, run code and query data safely.",
  },
  {
    icon: Database,
    title: "Memory & context",
    text: "Short-term scratchpads and retrieval over vector stores keep agents grounded.",
  },
  {
    icon: Gauge,
    title: "Evaluation & guardrails",
    text: "Success criteria, validation and human checkpoints keep autonomous loops reliable.",
  },
];
