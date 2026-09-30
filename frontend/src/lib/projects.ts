import { Project } from "../types";

export const FEATURED_PROJECTS: Project[] = [
  {
    id: "operations-copilot",
    slug: "operations-copilot",
    title: "Operations Copilot",
    category: "AI Systems / RAG",
    year: "2026",
    oneLiner: "AI knowledge assistant for faster internal support & operational workflows",
    problem: "Operational staff spent 3+ hours daily manually cross-referencing multi-department documents, slowing down client resolution.",
    solution: "A FastAPI microservice and RAG architecture connecting document chunking, vector embeddings, and an internal web UI with strict access controls.",
    description: "Connects internal document repositories, semantic hybrid search (BM25 + vector), and LLM synthesis to provide instant cited operational answers.",
    serviceCategory: "01 — AI Workflow Automation",
    technologies: ["Python", "FastAPI", "LangChain", "PGVector", "Next.js", "Docker"],
    impact: "82% reduction in operational search latency & 4.2x faster ticket throughput",
    demoUrl: null,
    featured: true,
    caseStudy: {
      oneLineOutcome: "Reduced internal operational search time from 45 minutes to under 30 seconds per inquiry.",
      summary: "A secure internal AI assistant built for operations teams to query complex standard operating procedures, vendor contracts, and client histories with verified source citations.",
      challenge: "The client's operations team suffered from fragmented knowledge across Google Drive, PDF manuals, and legacy databases. Support agents took an average of 45 minutes to draft answers for complex client escalations, causing SLA breaches and high burnout.",
      solution: "We engineered an end-to-end RAG system with asynchronous PDF parsing, hybrid dense-sparse vector retrieval, metadata filtering, and a custom Next.js operational interface featuring citation tracking and audit logs.",
      role: "Lead AI Systems Engineer — Responsible for pipeline architecture, FastAPI backend, vector database schema, retrieval optimization, and Next.js frontend UI.",
      architectureDescription: "Next.js Client → FastAPI Gateway → PGVector Hybrid Search → Re-ranking Pipeline → OpenAI / Llama Synthesis Server.",
      architectureNodes: [
        { step: "01 Ingestion", label: "Async Ingestion & OCR", detail: "Parses PDFs, DOCX, and CSVs using Unstructured.io, extracting tables and clean text snippets." },
        { step: "02 Indexing", label: "PGVector & Hybrid Index", detail: "Generates 1536-dim embeddings stored alongside BM25 keyword tokens for dual-pass hybrid retrieval." },
        { step: "03 Rerank", label: "Cross-Encoder Reranker", detail: "Filters top-20 retrieved chunks down to top-5 most relevant context passages." },
        { step: "04 Synthesis", label: "LLM Response Engine", detail: "Synthesizes precise answers with exact page numbers, inline citations, and fallback safety guards." }
      ],
      keyResults: [
        { label: "Search Latency", value: "< 30s", detail: "From 45 mins average down to 28 seconds end-to-end" },
        { label: "Ticket Capacity", value: "4.2x", detail: "Daily ticket resolution per agent increased significantly" },
        { label: "Answer Accuracy", value: "96.4%", detail: "Measured via human evaluation on 250 benchmark queries" }
      ],
      gallery: [
        { title: "Query & Citation View", caption: "Interactive drawer displaying exact source passage citations alongside the AI answer.", type: "image" },
        { title: "Hybrid Search Architecture", caption: "Diagram of the dense vector + BM25 keyword hybrid retrieval pipeline.", type: "diagram" }
      ],
      lessonsLearned: [
        "Hybrid retrieval (dense vector + sparse BM25) outperformed pure vector embeddings by 24% on technical serial numbers and specific model codes.",
        "Strict metadata scoping at the database level prevented cross-department data leaks without slowing query performance."
      ]
    }
  },
  {
    id: "support-intelligence",
    slug: "support-intelligence",
    title: "Support Intelligence Engine",
    category: "Internal AI Tools",
    year: "2025",
    oneLiner: "Automated support ticket triage & autonomous response generation",
    problem: "SaaS support teams were overwhelmed by high-volume repetitive queries, leading to delayed response times for high-value enterprise clients.",
    solution: "An intelligent classification and drafting engine that categorizes incoming tickets, assesses sentiment, and drafts context-aware responses in Zendesk.",
    description: "Multi-agent classification & response engine integrated with support channels to automate tier-1 responses and flag high-risk accounts.",
    serviceCategory: "02 — Internal AI Tools",
    technologies: ["Python", "FastAPI", "Pydantic", "Zendesk API", "Redis", "PostgreSQL"],
    impact: "Automates 60% of Tier-1 support tickets with 94% approval rating",
    demoUrl: null,
    featured: true,
    caseStudy: {
      oneLineOutcome: "Automated 60% of routine tier-1 support tickets while maintaining a 94% customer satisfaction score.",
      summary: "An autonomous ticket triage and resolution platform that analyzes customer intent, retrieves relevant product documentation, and executes pre-approved workflows.",
      challenge: "High support volume during product launches created severe bottlenecks. Tier-1 reps spent 70% of their time answering repetitive technical queries rather than focusing on complex account escalations.",
      solution: "We deployed a multi-agent system using FastAPI and Redis queues that automatically ingests Zendesk tickets, runs zero-shot classification, and drafts contextually accurate responses ready for 1-click agent approval.",
      role: "AI Automation Architect — Designed the multi-agent decision engine, API webhooks, Pydantic validation layer, and Redis queuing system.",
      architectureDescription: "Zendesk Webhook → FastAPI Queue → Intent Classifier → Knowledge Retrieval → Response Drafter → Approval Dashboard.",
      architectureNodes: [
        { step: "01 Ingest", label: "Webhook Receiver", detail: "Captures new ticket events, sanitizes PII data, and pushes payload to Redis queue." },
        { step: "02 Classify", label: "Pydantic Classifier", detail: "Determines intent (Bug, Billing, Feature Request, How-To) and priority level." },
        { step: "03 Retrieve", label: "Context Assembler", detail: "Fetches user account history, contract tier, and product documentation." },
        { step: "04 Execute", label: "Action Engine", detail: "Executes automated refund/reset API calls or attaches drafted response to Zendesk ticket." }
      ],
      keyResults: [
        { label: "Tier-1 Automation", value: "60%", detail: "Routine tickets resolved without human intervention" },
        { label: "Response Time", value: "< 2 mins", detail: "Average first response time for end users" },
        { label: "CSAT Score", value: "94%", detail: "Positive feedback score from client end users" }
      ],
      gallery: [
        { title: "Zendesk Agent Assistant Sidebar", caption: "Embedded widget allowing support agents to approve or tweak AI drafted responses with one click.", type: "image" }
      ],
      lessonsLearned: [
        "Adding a confidence threshold check (>88%) before auto-sending responses prevented hallucinated support answers.",
        "Structuring prompts with few-shot company voice examples kept tone consistently empathetic and professional."
      ]
    }
  },
  {
    id: "workflow-automation",
    slug: "workflow-automation",
    title: "Enterprise Workflow Automation Engine",
    category: "Automation / ETL",
    year: "2025",
    oneLiner: "End-to-end document parsing and cross-system data synchronization",
    problem: "Financial operations manually entered data from thousands of vendor invoices, POs, and shipping manifests into legacy ERP systems every week.",
    solution: "An automated document intelligence pipeline that ingests unstructured PDFs, executes schema validation, and syncs data to ERPs via secure REST APIs.",
    description: "Robust Python ETL framework with OCR data extraction, schema validation, exception routing, and automated audit logs.",
    serviceCategory: "01 — AI Workflow Automation",
    technologies: ["Python", "FastAPI", "SQLAlchemy", "PostgreSQL", "Docker", "Celery"],
    impact: "Replaced 120+ weekly manual entry hours with zero data entry errors",
    demoUrl: null,
    featured: true,
    caseStudy: {
      oneLineOutcome: "Eliminated 120+ hours of weekly manual data entry across accounting & logistics teams.",
      summary: "An enterprise document processing platform built to parse, validate, and load unstructured vendor invoices and purchase orders directly into ERP databases.",
      challenge: "Receiving invoices in 50+ different formats caused constant manual entry backlogs, high error rates in line-item matching, and delayed vendor payments.",
      solution: "Engineered a containerized Celery worker pipeline that ingests multi-page documents, executes vision-based layout analysis, checks line items against PO databases, and flags anomalies for human review.",
      role: "Backend Lead — Developed the Celery distributed queue, SQLAlchemy database model, validation logic, and FastAPI administration API.",
      architectureDescription: "Email Ingestion → Celery Worker Pool → Document Parser → Pydantic Validator → ERP API Sync.",
      architectureNodes: [
        { step: "01 Ingest", label: "Email / S3 Listener", detail: "Monitors inbox and S3 buckets for incoming PDF, PNG, and TIFF attachments." },
        { step: "02 Extraction", label: "Layout Analysis Engine", detail: "Extracts line items, tax IDs, totals, and invoice numbers with 99.2% field accuracy." },
        { step: "03 Verification", label: "DB Reconciliation", detail: "Cross-checks totals with database PO records to verify price discrepancies." },
        { step: "04 Load", label: "ERP Synchronization", detail: "Pushes verified records into ERP endpoints and logs full audit trail." }
      ],
      keyResults: [
        { label: "Hours Saved", value: "120+ hrs/wk", detail: "Operational manual entry time eliminated" },
        { label: "Field Accuracy", value: "99.2%", detail: "Extraction precision across complex multi-line invoices" },
        { label: "Processing Speed", value: "4.5 secs", detail: "Average processing time per invoice" }
      ],
      gallery: [
        { title: "Validation & Exception Dashboard", caption: "Admin view showing auto-processed invoices and side-by-side anomaly flag UI.", type: "image" }
      ],
      lessonsLearned: [
        "Bounding box visual coordinates were crucial for validating line-item tables spanning across page boundaries.",
        "Automated slack alerts for failed validation rules allowed human operators to resolve edge cases in seconds."
      ]
    }
  },
  {
    id: "analytics-engine",
    slug: "analytics-engine",
    title: "Executive Revenue Analytics Suite",
    category: "Data & Reporting",
    year: "2025",
    oneLiner: "Real-time BI platform for unit economics & SaaS cohort performance",
    problem: "Leadership lacked a single source of truth for multi-channel ARR, retention cohorts, customer acquisition costs, and churn predictions.",
    solution: "A unified data warehousing pipeline feeding interactive executive dashboards with automated anomaly detection and daily report delivery.",
    description: "Automated PostgreSQL data pipeline and Power BI / Next.js reporting suite for C-suite decision making.",
    serviceCategory: "03 — Data & Reporting Systems",
    technologies: ["Python", "PostgreSQL", "Power BI", "SQLAlchemy", "Pandas", "Scikit-learn"],
    impact: "Centralized 4 business verticals into a 100% automated real-time reporting hub",
    demoUrl: null,
    featured: true,
    caseStudy: {
      oneLineOutcome: "Unified multi-channel financial metrics into an automated real-time executive reporting engine.",
      summary: "An end-to-end data analytics and forecasting platform providing executive teams with instant visibility into ARR, CAC payback, LTV cohorts, and churn risks.",
      challenge: "Data resided in siloed platforms (Stripe, HubSpot, Google Ads, SQL databases), requiring finance managers to spend 3 days every month compiling manual spreadsheet reports.",
      solution: "We built an automated Python ETL pipeline that extracts raw transactions from 5 APIs, cleans and normalizes schema records into PostgreSQL, and presents live executive analytics via custom web components and Power BI dashboards.",
      role: "Data & Analytics Architect — Designed the PostgreSQL schema, data normalization pipelines, DAX metrics, and executive summary dashboard.",
      architectureDescription: "Data Sources → Python ETL → PostgreSQL Data Warehouse → Analytics Engine → Executive Dashboard.",
      architectureNodes: [
        { step: "01 Extract", label: "API Extractors", detail: "Scheduled nightly sync scripts pulling data from Stripe, CRM, and ad platforms." },
        { step: "02 Transform", label: "Pandas Normalizer", detail: "Calculates MRR, ARR, churn velocity, and customer cohort retention matrices." },
        { step: "03 Model", label: "Churn Risk Model", detail: "ML classifier scoring account drop-off risk 30 days prior to contract renewal." },
        { step: "04 Present", label: "Executive Suite", detail: "Interactive web analytics dashboard with automated PDF report email dispatch." }
      ],
      keyResults: [
        { label: "Reporting Delay", value: "0 days", detail: "Real-time metrics replacing 3-day manual monthly compiling" },
        { label: "Revenue Visibility", value: "100%", detail: "Unified visibility across all 4 product revenue channels" },
        { label: "Retention Impact", value: "+3.4%", detail: "Quarterly retention improvement from early churn alerts" }
      ],
      gallery: [
        { title: "Executive ARR & Cohort View", caption: "Interactive chart showing monthly retention curves and CAC payback velocity.", type: "image" }
      ],
      lessonsLearned: [
        "Pre-aggregating daily summary metrics into database materialized views reduced dashboard query load times from 8s to under 120ms.",
        "Automated automated email summaries sent directly to executives every Monday morning drove high daily platform engagement."
      ]
    }
  }
];

export function getProjectBySlug(slug: string): Project | undefined {
  return FEATURED_PROJECTS.find((p) => p.slug === slug);
}
