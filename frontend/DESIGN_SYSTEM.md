# Meet Chetanpura — personal portfolio design system

This document describes the current personal site. `PORTFOLIO_STRATEGY.md` tracks the evidence and content decisions. MC Intelligence is a separate future company portfolio.

## Intent and visitor paths

- **Hiring team:** identify Meet, inspect work, understand contribution and background, then contact him. Resume download remains dependent on approval of the current PDF.
- **Project team:** understand capabilities and approach, inspect relevant work, then describe a project through the contact section.
- Keep Meet's name and personal voice prominent. Do not present unverified project records as client engagements, measured outcomes, or live demos.

## Foundations

The implementation is in `src/styles/theme.css`, imported by `src/app/globals.css`. Use the variables below rather than hardcoded page colors. Tailwind utilities can compose layouts around these tokens.

| Role | Light | Dark | Token |
| --- | --- | --- | --- |
| Canvas | `#f4f7f6` | `#050708` | `--color-void` |
| Panel | `#ffffff` | `#0b0f11` | `--color-panel` |
| Raised panel | `#edf2f0` | `#111719` | `--color-panel-raised` |
| Text | `#101718` | `#f5f7f7` | `--color-ink` |
| Secondary text | `#536166` | `#9aa4aa` | `--color-muted` |
| Action | `#087d68` | `#8ef7dc` | `--color-signal` |

Borders, ambient backgrounds, cards, controls, and shadows also use tokens. The accent signals actions and emphasis; avoid putting it on every surface. Check contrast in both themes whenever a new combination is introduced.

## Type and layout

- **Inter** for headlines, body, navigation, and buttons; **JetBrains Mono** for short labels and technical metadata. Both are loaded in `src/app/layout.tsx`.
- Use `.type-display-lg`, `.type-h1` through `.type-h4`, `.type-body-lg` and `.type-body-md`, `.type-label`, and `.type-caption` from `theme.css`. Keep body copy in sentence case and constrain long lines.
- `.shell` caps the content width at `84rem` with responsive side gutters. `.tech-section` provides section rhythm and a top divider. Use cards sparingly to group actual information, not to fill empty space.
- Primary buttons use `.btn-primary`; secondary actions use `.btn-secondary`. All interactive controls need a visible focus state and descriptive text.

## Motion and depth

- The homepage takes visual direction from an editorial portfolio reference: oversized type, a dark portrait opening, alternating project layouts, quiet metadata, and generous section transitions. Use Meet's own portrait, AI/ML diagrams, and portfolio copy; do not copy the reference site's claims, testimonials, or imagery.
- The hero uses the repository's existing portrait. The Canvas neural network appears in the introduction as a conceptual **illustration**, not evidence of a delivered client architecture. It projects five layers in 3D, responds subtly to a fine pointer, and pauses outside the viewport. Its caption says it is conceptual.
- The system-thinking section uses layered CSS cards to explain data, features, model, and feedback. It is a conceptual workflow, not a claim about the listed projects. Its text remains readable without hover or animation.
- Pointer motion responds only to a mouse and stays subtle. The static view contains the same information. Do not require animation to understand a page or reach an action.
- Entrance motion should stay brief; the portrait headline uses a staggered 0.85-second reveal. Avoid a timed intro gate, perpetual content movement, and scroll effects that interrupt reading.
- Respect `prefers-reduced-motion`: remove animation and pointer-driven rotation, keep content visible, and allow ordinary scrolling. Avoid large WebGL dependencies unless a measured benefit justifies them.

## Components and page order

1. `Hero.tsx`: personal portrait, positioning, and two primary actions.
2. `Manifesto.tsx` and `NeuralNetworkScene.tsx`: recruiter/project-team paths and a conceptual 3D neural network.
3. `HorizontalWorkSection.tsx`: project records in review with abstract system diagrams; no measured outcomes until proof and disclosure permission are available.
4. `Services.tsx`: capability areas and examples, phrased as personal scope rather than a company promise.
5. `MLPipeline.tsx`: conceptual data-to-decision sequence illustrated with depth.
6. `ProcessSection.tsx`: working approach and checkpoints.
7. `About.tsx`: personal introduction; the `/about` route expands the approach.
8. `ContactSection.tsx`: inquiry form and verified contact destinations.

`/work` and `/work/[slug]` use the same tokens and clearly mark project details as pending verification. Detailed case-study fields remain in data for editorial review; the UI does not display them until approved. The old six-record dataset must not be merged with the four current records without resolving duplicates and provenance.

## Responsive and accessibility checks

- At narrow widths, the portrait fills the hero behind readable text; project layouts become one column; the 3D illustration scales within the viewport; navigation becomes a menu that closes on Escape.
- Maintain logical heading order, a main landmark, skip link, useful link names, keyboard access, and visible focus. Decorative graphic nodes are hidden from assistive technology.
- Check light and dark theme, 320px mobile through wide desktop, touch input, keyboard navigation, and reduced motion. Avoid hover-only information.

## Editorial release gate

Before restoring project details, dates, education, badges, metrics, resume, demos, or client names, verify them against owner-approved artifacts. A repository file proves that copy exists; it is not proof of a real-world result. Keep missing destinations absent. Review legal text and live form delivery separately before deployment.
