# Meet Chetanpura — Next.js 14+ AI Portfolio

A premium, responsive, and performance-optimized single-scroll portfolio website built for **Meet Chetanpura** using **Next.js 14+ (App Router)** and **TypeScript**.

## Tech Stack
* **Framework**: Next.js 14+ (App Router), React, TypeScript
* **Styling**: Tailwind CSS v4 with custom design-token config
* **Animation**: Framer Motion, GSAP, Lenis Smooth Scroll
* **Data Viz**: Recharts (Radar Chart overview)
* **Icons**: Lucide React / React Icons
* **Email System**: Nodemailer serverless Next.js API endpoint

---

## Key Advanced Upgrades

1. **Lenis Smooth Scrolling**:
   Integrates physics-based smooth scrolling with automatic speed controls and instant anchors. Honors accessibility settings by disabling smooth physics if `prefers-reduced-motion` is active.

2. **Orbiting Avatar Badges**:
   The Hero avatar is surrounded by a circular orbit of key technology tags. The orbit rotates slowly in a linear path and pauses instantly when hovered. The badges are counter-rotated relative to the orbit path, ensuring text remains horizontally upright and legible.

3. **Recharts Radar Chart**:
   Visualizes core expertise categories (Machine Learning, Deep Learning, BI, etc.) in a premium responsive Radar Chart with a custom dark-glass themed container.

4. **Animated Stats Counter**:
   Stats (number of projects, certifications) animate by counting up from 0 to their target value when they scroll into view.

5. **Typewriter Completion Fix**:
   The typewriter hook resolves common render-reset loop bugs in React by buffering the words array in a React Ref, preventing infinite typing resets when layouts re-render.

6. **Interactive Custom Cursor**:
   Framer Motion spring physics drive a premium cursor dot and lagging trailing ring. The ring expands, glows, and snaps to position when hovering over interactive elements. Automatically disabled on touch screens and reduced-motion states.

7. **API Route Migration**:
   The contact form submits to a Next.js API Route (`/api/contact`). A failed request displays an error and keeps the entered values for retry.

---

## Local Setup

### Installation
From the `frontend` directory:
```bash
npm install
```

### Run Local Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### Production Build
```bash
npm run build
```
Generates an optimized production build in the `.next` folder, including server-side API routes.
