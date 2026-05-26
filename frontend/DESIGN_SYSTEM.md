# Portfolio design system (AI / Data Science)

## Recommended color palette

| Role | Hex | Usage |
|------|-----|--------|
| **Void** | `#050508` | Deepest background |
| **Surface** | `#0A0A0F` | Section backgrounds |
| **Raised** | `#12121C` | Cards, nav |
| **Violet** | `#8B5CF6` | Primary CTA, links, AI brand |
| **Fuchsia** | `#D946EF` | Gradient mid-tone |
| **Cyan** | `#22D3EE` | Data / tech accents |
| **Rose** | `#F472B6` | Highlights, featured tags |
| **Emerald** | `#34D399` | Success, availability |
| **Text** | `#F4F4F5` / `#A1A1AA` | Primary / muted |

### Gradient (headlines & buttons)

```
135deg: #8B5CF6 → #D946EF → #22D3EE
```

Avoid more than 3 accent colors per screen — keeps a luxury, Vercel/Apple feel.

## Animation guidelines

| Effect | Where | Tool |
|--------|--------|------|
| Scroll fade-up | Section headers | Framer `whileInView` |
| Stagger children | Grids, lists | `staggerChildren: 0.08` |
| Orb float | Hero badges, skills | `y: [0,-10,0]` loop |
| Shimmer CTA | Primary buttons | Moving gradient overlay |
| Mouse glow | Global ambient | `MouseGlow.jsx` |
| 3D tilt | Project/bento cards | `TiltCard.jsx` |
| Typewriter | Hero role line | `useTypewriter` |

Keep duration **0.4–0.6s**, easing `[0.22, 1, 0.36, 1]`.

## 3D & glass

- **Glass:** `bg-white/[0.04]` + `backdrop-blur-xl` + `border-white/10`
- **Glow:** `shadow-[0_0_40px_rgba(139,92,246,0.35)]` on hover
- **3D:** max tilt **6–8°** — subtle, not gimmicky

## Typography

- **Headings:** Outfit — bold, tight tracking
- **Labels / code:** JetBrains Mono — uppercase micro labels

## Files

- Tokens: `src/styles/theme.css`
- Effects: `src/components/effects/MouseGlow.jsx`, `TiltCard.jsx`
