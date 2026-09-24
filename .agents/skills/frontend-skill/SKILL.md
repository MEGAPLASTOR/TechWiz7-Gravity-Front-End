---
name: frontend-skill
description: |
  Create visually strong landing pages, websites, and app UIs with restrained composition. Production frontend playbook curated from OpenDesign and OpenAI.
triggers:
  - "landing page"
  - "frontend playbook"
  - "ui composition"
  - "restrained ui"
  - "frontend design"
  - "ui design"
od:
  mode: design-system
  category: design-systems
  upstream: "https://github.com/nexu-io/open-design/blob/main/skills/frontend-skill/SKILL.md"
---

# frontend-skill

> Production frontend playbook curated from OpenDesign & OpenAI.

Use this skill when designing or building user interfaces: landing pages, websites, dashboards, SaaS application screens, or React components. The objective is to produce production-grade frontend experiences that are visually distinctive, refined in craft, and free of generic AI tropes.

---

## 1. Core Principles

1. **Spend Your Boldness in One Place**:
   - Let one single element be memorable (a striking hero layout, an interactive demo, or bold typography).
   - Keep everything else quiet, disciplined, and functional. Cut decoration that does not serve the product.

2. **Avoid Default "AI Tells" (Anti-AI Slop)**:
   - **No generic color clichés**: Avoid default warm cream (`#F4F1EA`) with clay/terracotta accent, or generic pure black with neon green unless specifically requested.
   - **No repetitive card syndrome**: Avoid cutting every piece of content into identical rounded cards with identical soft drop shadows (`rgba(0,0,0,0.08)`).
   - **No template chrome**: Do not add tracked-out uppercase eyebrow labels (`FEATURE // 01`), unnecessary middle dots (`A • B • C`), or decorative gradient blobs that add no information.
   - **No single-word colored accents**: Avoid highlighting a single word in a headline with a vibrant gradient or color unless it is genuinely meaningful.

3. **Typography Drives Personality**:
   - Limit to 1 or 2 typeface families. If using two, ensure high contrast between them (e.g. an expressive serif/display paired with a clean, neutral sans-serif).
   - Keep line lengths under 80 characters for optimal legibility.
   - Define a clear, deliberate typographic scale using CSS variables (`--font-size-sm`, `--font-size-base`, `--font-size-xl`, `--font-size-hero`).

4. **Visual Structure is Information**:
   - Dividers, hairlines, subtle borders, and padding are information architecture tools, not mere decoration.
   - Only use numbered markers (`01`, `02`, `03`) if the content is truly a sequential timeline or step-by-step process.

5. **Restrained, Purposeful Motion**:
   - Avoid having every section fade and slide up simultaneously on scroll.
   - Use one orchestrated entrance sequence or page reveal.
   - Micro-interactions must respond to user actions (hovering, toggling, clicking) with high-performance CSS transitions (`transform`, `opacity`).

---

## 2. Practical Workflow

### Step 1: Brief & Direction Analysis
- Understand audience, domain, emotional tone, and technical constraints.
- Pick a concrete aesthetic direction: *clean editorial, brutalist minimal, dense operational dashboard, warm consumer, or sleek enterprise*.

### Step 2: Design Token Foundation
Establish a concise token system in CSS:
- **Palette**: 4–6 cohesive hex values (Background, Surface, Text-Primary, Text-Muted, Accent, Border).
- **Typography**: Font family, weights, and hierarchical scale.
- **Spacing Scale**: 4px/8px-based grid (`4px`, `8px`, `16px`, `24px`, `32px`, `48px`, `64px`).
- **Radius**: Consistent corner rounding (e.g. `4px` or `8px` for subtle refinement; avoid over-rounding everything).

### Step 3: Architecture & Component Implementation (React + Vite)
- Place reusable UI elements in `src/components/` (Button, Card, Modal, Input).
- Place views in `src/pages/` and navigation in `src/routes/`.
- Manage global/theme state in `src/context/` or custom hooks in `src/hooks/`.
- Ensure path aliases (`@/components/...`) are used consistently.

### Step 4: Copywriting & Content Craft
- Write from the end-user perspective with active voice.
- Call-to-actions (CTAs) state exact outcomes: *"Create Workspace"* or *"Download Report"* instead of vague *"Submit"*.
- Error and empty states must provide clear direction and next steps.

### Step 5: Self-Critique & Quality Floor
- **Responsiveness**: Verify smooth layouts across mobile (375px+), tablet (768px+), and desktop (1280px+).
- **Accessibility**: Semantic HTML (`<header>`, `<main>`, `<nav>`, `<section>`), readable contrast ratios, and visible `:focus-visible` outlines.
- **Interactive Feedback**: All interactive items have clear hover, active, and disabled states.

---

## 3. Reference Links
- OpenDesign Source: [nexu-io/open-design/skills/frontend-skill](https://github.com/nexu-io/open-design/blob/main/skills/frontend-skill/SKILL.md)
- OpenAI Skills: [openai/skills](https://github.com/openai/skills)
