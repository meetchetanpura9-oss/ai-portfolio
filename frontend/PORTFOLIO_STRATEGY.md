# Personal portfolio strategy — review draft

This document proposes a personal portfolio for Meet Chetanpura. It is a content and experience plan, not approval to publish the claims below or change the UI. The separate **MC Intelligence company portfolio** is a future project with its own audience, claims, brand, and proof.

## Evidence standard

The audit covers `src/app`, `src/data/siteContent.ts`, `src/data/projects.ts`, `src/lib/projects.ts`, `src/data/skills.ts`, `src/data/certifications.ts`, and `DESIGN_SYSTEM.md`, plus the components that expose their links and calls to action. **Verified** means a route, source file, image, or destination exists in this repository. It does **not** mean an employer, client, issuer, result, or external account has independently confirmed a claim. **Unverified** means the repository asserts a fact or supplies an external URL but contains no supporting evidence. **Missing** means the repository has no destination or proof for the item. Keep unverified claims out of prominent outcome copy until supporting material and permission to publish are supplied.

## Current experience and content conflicts

| Current route or source | Repository observation | Strategy implication |
|---|---|---|
| `/` | `src/app/page.tsx` renders Hero → TechTicker → ProblemSection → HorizontalWorkSection → Services → ProcessSection → About → ContactSection → Footer, behind an intro screen. | It leads with a studio-like service pitch and four asserted client results. Give personal identity and evidence clearer priority; do not make visitors wait through an intro to reach work. |
| `/work` and `/work/[slug]` | Four detailed cases come from `src/lib/projects.ts`. The detail pages present architecture, roles, results, and lessons as factual. | Keep the case-study route pattern, but distinguish a built project, a concept, and an anonymized client engagement. Require evidence and disclosure approval before claiming measured impact. |
| `/about` | Uses `siteContent.about` for biography and two education milestones. | Make the personal timeline, role, location, and education contingent on the owner's confirmation or documents. |
| `/privacy`, `/terms`, `/cookies` | Pages and footer links exist. Legal copy asserts compliance and dates that the repository does not substantiate. | Retain the routes, but review the claims and actual data practices before publication. |
| `src/data/projects.ts` | Six older `LegacyProject` records with different names and results. `Projects.tsx` and `ProjectCard.tsx` can use them, but the active home and `/work` routes use `src/lib/projects.ts`. | Choose one canonical project inventory. Do not silently merge records that may describe the same work with conflicting figures. |
| `src/data/skills.ts` and `src/data/certifications.ts` | Skills have self-rated percentages. Eight credentials have local badge images; only one has a credential URL. The current home route does not mount `Skills` or `Certifications`. | Show a short evidence-led skills summary and a credential section only after details are confirmed. Avoid numerical skill scores. |
| `src/data/siteContent.ts` | Mixes personal biography with `MC Intelligence`, “we” language, a company mission, and a service promise. | Use first person on the personal site. Reserve agency language and company promises for the future company site. |
| `DESIGN_SYSTEM.md` versus current UI | The guide specifies dark violet/cyan, Outfit, glass, and subtle tilt. `src/styles/theme.css` now uses light/dark green tokens with Inter and JetBrains Mono; work pages also hardcode lime and charcoal. The guide references old `.jsx` effect paths. | Decide on one personal visual system and update the guide before implementation. Keep motion restrained and accessible. |

## Two visitor paths

| Visitor | First question | Fast path | Primary action |
|---|---|---|---|
| Recruiter or hiring manager | What role can Meet fill, what did he personally build, and where is the evidence? | Hero identity → selected verified work → personal contribution and stack → experience/education → credentials → resume and contact. | **View work**; persistent **Download resume** once the current PDF is approved. |
| International client | Can Meet solve this class of problem, communicate across time zones, and deliver responsibly? | Hero capabilities → relevant case study or clearly labeled sample → delivery approach → scope and constraints → contact. | **Discuss a project** leading to a short inquiry form or verified contact channel. Do not assert current availability, delivery capacity, or client outcomes without confirmation. |

The same personal site can serve both paths through clear navigation and contextual calls to action. Avoid a second company-style home page inside the personal site.

## Proposed page structure and section order

| Page | Proposed order | Calls to action |
|---|---|---|
| `/` | 1. Personal name, role, and concise value statement; 2. two path choices (“Hiring” and “Building a project”); 3. selected work with evidence labels; 4. practical capabilities with examples; 5. how Meet works and what he personally owns; 6. brief verified background and credentials; 7. contact. | Hero: **View work** and **Discuss a project**. Resume is a visible recruiter action, contingent on approving `public/cv.pdf`. Work cards: **Read case study**. |
| `/work` | Project index with project type, contribution, stack, evidence level, and a concise problem statement. Feature only cases cleared for publication; label prototypes or concepts honestly. | **Read case study**; secondary **Discuss similar work**. |
| `/work/[slug]` | Project identity and disclosure label → problem/context → personal role and team → constraints → architecture/decisions → implementation or demo evidence → measured result *only if documented* → lessons and limitations → next project/contact. | **Discuss a similar problem**; optional **View code/demo** only for supplied, approved URLs. |
| `/about` | Personal profile → confirmed education and experience timeline → methods and collaboration → selected credentials → contact/resume. | **Download resume** and **Get in touch**, after destinations are approved. |
| `/privacy`, `/terms`, `/cookies` | Keep legal/supporting pages outside the main narrative. | Settings/contact links only; validate legal statements with the owner. |

### Case-study publishing template

For each case, record: title; **real project / prototype / concept**; client and disclosure permission; dates; problem and user; Meet's exact contribution; team and constraints; design alternatives; architecture diagram tied to an actual implementation; repository/screenshots/demo that may be shared; measurement definition, baseline, sample, period, and source; outcome; limitations; lessons; approved links. If evidence is unavailable, use a qualitative description that can be supported by code or remove the case from the featured set. Render diagrams and gallery slots only when real artifacts exist.

## 3D and motion direction

Use a professional, technical visual language: layered system diagrams, restrained depth on case cards, and a compact hero object suggesting data flowing through a pipeline. Any diagram should reflect a real or clearly labeled illustrative architecture; do not depict fictional client dashboards as evidence. Keep the subject and CTAs readable without motion. Start with CSS/SVG or lightweight canvas; add WebGL only if performance testing justifies it. Limit card tilt to the design guide's 6–8° maximum, use 0.4–0.6 second transitions for entrances, avoid continuous motion that competes with reading, and provide static fallbacks for reduced-motion preferences, keyboard use, touch devices, and low-powered devices. Resolve the current guide/token/page-color mismatch before building new effects.

## Project evidence inventory

All ten project identities, client contexts, dates, roles, stacks, architecture descriptions, and outcomes below are **unverified as real-world claims**: the repository supplies copy, not source code for these systems, client permission, measurements, or external proof. The four current case-study **routes themselves are verified** as implemented pages.

| Dataset | Project | Claim status | Repository evidence and missing proof |
|---|---|---|---|
| `src/lib/projects.ts` | Operations Copilot | Unverified | Current `/work/operations-copilot` page exists. Need project artifact, role/client permission, and measurement record. Demo URL is missing. |
| `src/lib/projects.ts` | Support Intelligence Engine | Unverified | Current `/work/support-intelligence` page exists. Need Zendesk/integration evidence, role/client permission, and measurement record. Demo URL is missing. |
| `src/lib/projects.ts` | Enterprise Workflow Automation Engine | Unverified | Current `/work/workflow-automation` page exists. Need pipeline evidence, role/client permission, and measurement record. Demo URL is missing. |
| `src/lib/projects.ts` | Executive Revenue Analytics Suite | Unverified | Current `/work/analytics-engine` page exists. Need dashboard/ETL evidence, role/client permission, and measurement record. Demo URL is missing. |
| `src/data/projects.ts` | AI Inventory Intelligence Platform | Unverified | Legacy data only; no current case-study route, GitHub URL, or demo URL. Need artifact and measurement record. |
| `src/data/projects.ts` | Intelligent Workflow Automation Agent | Unverified | Legacy data only; no current case-study route, GitHub URL, or demo URL. Need artifact and measurement record. |
| `src/data/projects.ts` | Customer Retention & Churn Prediction Engine | Unverified | Legacy data only; no current case-study route, GitHub URL, or demo URL. Need artifact and measurement record. |
| `src/data/projects.ts` | Enterprise BI & Revenue Analytics Platform | Unverified | Legacy data only; no current case-study route, GitHub URL, or demo URL. Need artifact and measurement record. |
| `src/data/projects.ts` | Enterprise Knowledge Base RAG Assistant | Unverified | Legacy data only; no current case-study route, GitHub URL, or demo URL. Need artifact and measurement record. |
| `src/data/projects.ts` | Automated Data Validation & ETL Pipeline | Unverified | Legacy data only; no current case-study route, GitHub URL, or demo URL. Need artifact and measurement record. |

Names and outcomes overlap across the two datasets (knowledge assistant/RAG, automation, churn/retention, BI). Whether any pairs represent the same work is **unverified**. Resolve identity and canonical wording before a merged index is designed.

## Metric inventory

Every figure in this table is **unverified** as a measured real-world result. It appears only in repository copy. Repeated figures within one record are grouped; divergent phrasing is called out. Project years (2025/2026) and role dates are likewise unverified. Do not publish the numbers as measured outcomes until the owner supplies a method, source, and permission.

| Source / project | Numerical or absolute claims in the record | Status |
|---|---|---|
| Current: Operations Copilot | 3+ hours/day baseline; 82% search-latency reduction; 4.2× ticket throughput; 45 minutes to under 30 seconds (also 28 seconds); 96.4% answer accuracy on 250 queries; 24% hybrid-retrieval gain; 1536-dimensional embeddings, top-20 to top-5 retrieval. | Unverified |
| Current: Support Intelligence Engine | 60% tier-1 automation; 94% approval/CSAT (two different labels); 70% of reps' time on repetitive queries; under 2-minute response; greater than 88% confidence threshold. | Unverified |
| Current: Enterprise Workflow Automation Engine | 120+ hours/week saved; “zero data entry errors”; 50+ invoice formats; 99.2% field accuracy; 4.5 seconds per invoice. | Unverified |
| Current: Executive Revenue Analytics Suite | Four business verticals/channels; “100% automated”; three-day to zero-day reporting delay; five source APIs; 30-day churn prediction; +3.4% retention; 8 seconds to under 120 ms query time. | Unverified |
| Legacy: AI Inventory Intelligence Platform | 28% fewer stock-outs; 91.4% forecast accuracy; weekly automated planning. | Unverified |
| Legacy: Intelligent Workflow Automation Agent | 15+ hours/week per person saved; over three hours/day baseline; 24 hours to under 45 seconds processing. | Unverified |
| Legacy: Customer Retention & Churn Prediction Engine | 84% detection at least 30 days early; ROC-AUC 0.89; 3.4 percentage-point quarterly churn decrease. | Unverified |
| Legacy: Enterprise BI & Revenue Analytics Platform | Four business verticals; daily automated refresh. | Unverified |
| Legacy: Enterprise Knowledge Base RAG Assistant | Over 70% shorter technical-query resolution time. | Unverified |
| Legacy: Automated Data Validation & ETL Pipeline | 99.9% clean ingestion. | Unverified |
| Skills (`src/data/skills.ts`) | AI/ML: 94, 90, 92, 88, 86, 84%; generative AI: 90, 88, 86, 92, 85%; backend: 95, 92, 89, 86, 80%; frontend: 88, 86, 92, 90%; data: 94, 92, 90, 88, 90%; DevOps: 92, 84, 80, 88%. | Unverified self-ratings; no scoring rubric |
| `siteContent.about.milestones` | MCA 2024–2026; BCA 2021–2024; associated institutions and curriculum. | Unverified biographical claims |

## Credential inventory

All eight badge **image files are verified to exist** in `src/assets`. Their titles, dates, issuer attribution, and descriptions are **unverified** by repository evidence; an image is not independent credential validation. The one external verification URL is present in code but has not been independently checked. Other credential URLs are **missing**.

| Credential in `src/data/certifications.ts` | Claimed date | Claim status | Verification link |
|---|---|---|---|
| Microsoft AI Skills Fest 2026 | June 2026 | Unverified; local badge image exists | Credly URL present, external destination/ownership unverified |
| Deep Learning for Developers — Infosys Springboard | May 4, 2026 | Unverified; local badge image exists | Missing |
| Introduction to Robotic Process Automation — Infosys Springboard | April 29, 2026 | Unverified; local badge image exists | Missing |
| Computer Vision 101 — Infosys Springboard | April 21, 2026 | Unverified; local badge image exists | Missing |
| Introduction to Deep Learning — Infosys Springboard | April 15, 2026 | Unverified; local badge image exists | Missing |
| Introduction to Artificial Intelligence — Infosys Springboard | April 14, 2026 | Unverified; local badge image exists | Missing |
| Introduction to Natural Language Processing — Infosys Springboard | April 2, 2026 | Unverified; local badge image exists | Missing |
| Introduction to Data Science — Infosys Springboard | March 31, 2026 | Unverified; local badge image exists | Missing |

## Link and destination inventory

Repeated uses of the same destination are grouped. **Verified** here only means a local route/anchor/file exists; it does not validate the destination's content or an external account owner.

| Destination used or expected | Status | Evidence / action needed |
|---|---|---|
| `/`, `/about`, `/work`, four `/work/[slug]` pages | Verified | Implemented in `src/app`. Case-study facts remain unverified. |
| `/#work`, `/#services`, `/#contact`, `#main-content` | Verified | Matching sections/landmark exist on the active home page. |
| `/privacy`, `/terms`, `/cookies` | Verified | Local pages exist; legal accuracy is unverified. |
| `/cv.pdf` | Verified file presence; content unverified | `public/cv.pdf` exists but is currently an uncommitted change. Owner must approve its contents and publication. |
| Contact form `/api/contact` and newsletter `/api/newsletter/subscribe` | Verified route presence | Server routes exist; delivery requires configured mail and a live integration check. |
| Email fallback in `contact/constants.ts` and email in legal pages | Unverified | An address is present in code; confirm preferred public address and mail handling. Another address appears in backend playground copy, so reconcile before reuse. |
| LinkedIn fallback in `contact/constants.ts` | Unverified | URL is present; confirm account ownership and preferred profile URL. |
| GitHub fallback in `contact/constants.ts` | Unverified | URL is present; confirm account ownership and preferred profile URL. |
| Credly URL for Microsoft badge | Unverified | URL is present; confirm that it resolves to Meet's badge and may be published. |
| Canonical/Open Graph domain in `src/app/layout.tsx` | Unverified | Domain is configured in metadata; confirm the actual personal-site domain. |
| Four current project demo URLs | Missing | All `demoUrl` values are `null`; request URLs only for demos approved for public access. |
| Six legacy project GitHub URLs and six demo URLs | Missing | All `github` and `demo` values are `null`; request actual public URLs or leave actions absent. |
| Seven Infosys verification URLs | Missing | `credentialUrl` is `null`; request issuer verification links if available, otherwise show no verification action. |

## Facts and decisions needed from Meet

1. Which of the ten project records describe real work, prototypes, concepts, or duplicates? For each publishable case: exact title, dates, client disclosure permission, personal role, team, architecture artifacts, screenshots, and public code/demo URLs.
2. For every numeric claim above: baseline, measurement window, denominator/sample, source artifact, and permission to publish. Identify any estimates or illustrative figures so they can be labeled or removed.
3. Confirm preferred role, current location/time zone, hiring status, client availability, education institutions/dates, and an approved resume PDF.
4. Confirm credential titles/dates, provide issuer or Credly verification links and permission to show badge images. Supply evidence for any credentials that should appear in the hiring path.
5. Confirm public email, LinkedIn, GitHub, personal domain, and whether direct contact should use email, the form, or both. Supply only approved URLs; absent links should stay absent.
6. Choose the personal visual direction after reviewing the current design-system mismatch. Confirm whether MC Intelligence should be named merely as a future venture or omitted entirely from the personal site.

## Separate future company portfolio

Plan MC Intelligence as a distinct later site with its own domain, identity, services, team description, contact process, and substantiated company case studies. Do not transfer Meet's personal projects into company client claims without explicit ownership and disclosure approval. The personal site should continue to speak as Meet; the company site can use “we” only when its team and operating model are defined.
