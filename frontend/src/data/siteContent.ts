export const siteContent = {
  brand: {
    name: "Meet Chetanpura",
    studio: "MC Intelligence",
    role: "AI Systems Engineer",
    entryEyebrow: "MC Intelligence / Systems online",
    entryQuestion: "Ready to turn repetitive work into intelligent systems?",
    entryCopy: "We engineer AI agents, automation, and data products that give ambitious teams back their time.",
  },
  company: {
    mission: "Make advanced AI practical, accountable, and valuable for modern operations.",
    promise: "We combine machine intelligence with product engineering to remove friction, accelerate decisions, and create measurable operating leverage.",
  },
  problems: [
    { code: "01", title: "Knowledge is hard to reach", text: "We turn scattered documents and business context into reliable, permission-aware AI knowledge systems." },
    { code: "02", title: "Teams repeat manual work", text: "We automate document handling, data movement, triage, and cross-platform workflows with human oversight." },
    { code: "03", title: "Data arrives too late", text: "We build operational intelligence layers that transform fragmented data into timely, useful decisions." },
  ],
  technologies: ["Python", "Java", "React", "Next.js", "FastAPI", "Docker", "PostgreSQL", "Azure", "LangChain", "Power BI"],
  about: {
    headline: "Engineering intelligence with a business point of view.",
    summary: "I am Meet Chetanpura. I work at the intersection of machine learning, software, and the practical questions that make a system useful.",
    images: [
      { src: "/linkedin.webp", alt: "Meet Chetanpura professional portrait" },
      { src: "/hero-2.png.jpeg", alt: "Meet Chetanpura at university convocation" },
      { src: "/hero-3.png.jpeg", alt: "Meet Chetanpura professional photograph" },
      { src: "/hero-4.png.jpeg", alt: "Meet Chetanpura graduation photograph" },
    ],
    milestones: [
      { period: "2024—2026", title: "Master of Computer Applications", place: "GLS University, Ahmedabad", detail: "Machine learning, distributed systems, database architecture, and enterprise software." },
      { period: "2021—2024", title: "Bachelor of Computer Applications", place: "Gujarat University", detail: "Data structures, algorithms, full-stack engineering, and applied Python." },
      { period: "Now", title: "AI systems practice", place: "Ahmedabad · Global", detail: "Agentic AI, intelligent automation, ML systems, and operational data products." },
    ],
  },
} as const;
