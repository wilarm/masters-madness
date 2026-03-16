---
name: ui-ux-pro-max
description: "Premium UI/UX design skill for building stunning, polished web applications. Combines 50+ design styles, 161 color palettes, 57 font pairings, 99 UX guidelines, and 25 chart types with the 21st.dev Magic MCP component library for generating production-ready React/Next.js/HTML components. Use this skill whenever the user asks for: visual makeovers, UI redesigns, polished web design, beautiful frontend interfaces, modern website design, landing pages, dashboards, admin panels, design systems, component styling, responsive layouts, animations, dark mode, accessibility improvements, or any task where the visual quality and user experience of a web interface matters. Also trigger when the user mentions 'make it look better', 'premium feel', 'modern design', 'visual overhaul', 'professional UI', or wants to transform a basic site into something polished. Even if the user doesn't explicitly say 'design' — if they're building a web app and care about how it looks, use this skill."
---

# UI/UX Pro Max — Premium Design Intelligence + Component Generation

A comprehensive design skill that pairs deep UI/UX knowledge (styles, palettes, typography, accessibility, animation) with the **21st.dev Magic MCP server** for generating production-quality UI components. The goal is to help you build interfaces that look and feel like they were crafted by a senior design team.

## When to Use

This skill should be your go-to whenever the task involves **how something looks, feels, moves, or is interacted with** on the web.

### Must Use
- Designing new pages (landing pages, dashboards, admin panels, SaaS apps, portfolios)
- Full visual makeovers or redesigns of existing sites
- Creating or styling UI components (buttons, cards, modals, navbars, tables, forms, charts)
- Choosing color schemes, typography systems, spacing standards, or layout grids
- Implementing responsive behavior, animations, or dark mode
- Building analytics dashboards or data visualizations
- Making product-level design decisions (style direction, information hierarchy, brand expression)

### Recommended
- UI that looks "not professional enough" but the reason isn't obvious
- Pre-launch quality polish
- Accessibility audits and improvements
- Cross-device consistency checks

### Skip
- Pure backend logic, APIs, or database work
- DevOps or infrastructure
- Non-visual scripts or automation

---

## Architecture: Two Systems Working Together

### System 1: Design Intelligence (Local Scripts)
The `scripts/search.py` tool provides data-driven design recommendations from a curated database of styles, colors, typography, product patterns, and UX best practices.

### System 2: 21st.dev Magic MCP (Component Generation)
The Magic MCP server generates beautiful, production-ready UI components using a library of premium designs. Use it to:
- Generate complete React/Next.js components with modern styling
- Get pre-built component patterns (hero sections, pricing cards, feature grids, etc.)
- Access a library of polished, animated UI patterns
- Create components that follow current design trends

**The workflow**: Use System 1 to make design decisions (what style, what colors, what typography), then use System 2 to generate the actual components with those design decisions applied. For pure HTML/CSS projects, use System 1's recommendations and implement directly.

---

## Step-by-Step Workflow

### Step 1: Analyze Requirements

Extract from the user's request:
- **Product type**: What is this? (Pool/tournament app, SaaS, e-commerce, dashboard, portfolio, etc.)
- **Audience**: Who uses it? (Age range, context, tech-savviness)
- **Style direction**: What feeling? (Premium, playful, sporty, minimal, bold, elegant)
- **Tech stack**: What are we building with? (HTML/CSS/JS, React, Next.js, etc.)
- **Key pages/features**: What needs to be designed?

### Step 2: Generate Design System

Always start here — get a comprehensive design recommendation:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system -p "Project Name"
```

This returns: recommended style, color palette, typography, effects, spacing, and anti-patterns to avoid.

**Example:**
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "sports tournament pool fantasy golf premium" --design-system -p "Masters Madness"
```

### Step 3: Deep-Dive Specific Domains

Use targeted searches when you need more detail:

```bash
# Style options
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "dark premium sporty" --domain style

# Color palettes
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "sports luxury green gold" --domain color

# Typography pairings
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "elegant modern sporty" --domain typography

# UX best practices
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "dashboard animation loading" --domain ux

# Chart/data visualization
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "analytics comparison matrix" --domain chart

# Landing page structure
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "hero social-proof cta" --domain landing
```

### Step 4: Generate Components (Magic MCP)

For React/Next.js projects, use the Magic MCP server to generate premium components:
- Hero sections with animations
- Navigation bars with scroll effects
- Card layouts with hover states
- Data tables with sorting/filtering
- Chart containers with tooltips
- Modal dialogs with transitions
- Form layouts with validation states

For HTML/CSS projects, implement the design system recommendations directly using modern CSS (Grid, Flexbox, custom properties, animations).

### Step 5: Apply UX Quality Checklist

Before delivering, verify against these critical checks:

#### Accessibility (CRITICAL)
- Color contrast ≥ 4.5:1 for text, ≥ 3:1 for large text
- All interactive elements keyboard-navigable
- Visible focus indicators (2-4px rings)
- Alt text for images, aria-labels for icon buttons
- Heading hierarchy (h1 → h6, no skips)

#### Touch & Interaction (CRITICAL)
- Touch targets ≥ 44×44px
- 8px+ spacing between interactive elements
- Loading feedback on async operations
- Cursor: pointer on clickable elements
- Never rely on hover alone for critical info

#### Layout & Responsive (HIGH)
- Mobile-first, then scale up
- Breakpoints: 375 / 768 / 1024 / 1440
- No horizontal scroll on mobile
- 16px minimum body text
- Consistent max-width containers

#### Animation (MEDIUM)
- Duration 150-300ms for micro-interactions
- Use transform/opacity only (never animate width/height)
- Respect prefers-reduced-motion
- Ease-out for entering, ease-in for exiting
- Stagger list items by 30-50ms

#### Typography & Color (MEDIUM)
- Line-height 1.5-1.75 for body text
- 65-75 characters per line max
- Semantic color tokens (not raw hex everywhere)
- Consistent type scale (e.g., 12/14/16/18/24/32/48)
- Font-weight hierarchy: Bold headings (600-700), Regular body (400)

---

## Design Patterns for Common Page Types

### Dashboard / Analytics
- **Layout**: Sidebar nav + header + content grid
- **Cards**: Stats at top, charts below, tables for details
- **Colors**: Muted backgrounds, accent colors for data highlights
- **Charts**: Use accessible color sets, always include legends and tooltips
- **Animations**: Subtle entrance animations on cards, smooth number transitions

### Landing Page
- **Hero**: Full-width, bold headline, clear CTA, visual element
- **Social proof**: Testimonials, logos, statistics
- **Features**: Icon + heading + description in grid
- **CTA sections**: Contrasting background color, centered content
- **Footer**: Links, contact, legal

### Data Table / Leaderboard
- **Headers**: Sticky, clear visual distinction
- **Rows**: Alternating backgrounds, hover highlights
- **Sorting**: Click-to-sort with visual indicators
- **Responsive**: Horizontal scroll or card view on mobile
- **Status indicators**: Color-coded badges or dots

### Profile / Account
- **Avatar**: Circular with fallback initials
- **Settings**: Grouped in logical sections
- **Forms**: Visible labels, inline validation, clear submit states

---

## Available Search Domains

| Domain | Use For | Example Keywords |
|--------|---------|------------------|
| `product` | Product type recommendations | SaaS, sports, tournament, dashboard, portfolio |
| `style` | UI styles and effects | glassmorphism, minimalism, dark mode, premium, sporty |
| `typography` | Font pairings | elegant, modern, sporty, playful, professional |
| `color` | Color palettes by context | sports, luxury, green-gold, dark-premium, vibrant |
| `landing` | Page structure patterns | hero, testimonial, pricing, social-proof, CTA |
| `chart` | Data visualization | trend, comparison, matrix, funnel, scatter |
| `ux` | Best practices | animation, accessibility, forms, navigation, loading |
| `google-fonts` | Individual font lookup | sans-serif, serif, display, monospace, variable |

---

## Professional UI Rules (Quick Reference)

### Icons & Visual Elements
- **No emojis as structural icons** — use SVG icon libraries (Lucide, Heroicons, Phosphor)
- **Consistent icon family** — same stroke width, same corner radius throughout
- **Vector-only assets** — SVG scales cleanly, supports theming

### Interaction States
- Every interactive element needs: default, hover, active, focus, disabled states
- Pressed feedback within 80-150ms
- Disabled = reduced opacity (0.38-0.5) + cursor change + no action

### Light/Dark Mode
- Text contrast ≥ 4.5:1 in both modes
- Use semantic color tokens, not hardcoded hex
- Dark mode uses desaturated/lighter tonal variants, not inverted colors
- Test both modes before delivery

### Spacing System
- Use 4px/8px base grid consistently
- Section spacing tiers: 16 / 24 / 32 / 48 / 64
- Consistent max-width on desktop (1200-1440px)
- Readable line length: 60-75 characters

---

## Tips for Outstanding Results

1. **Start with the design system** — always run `--design-system` first. It prevents inconsistency.
2. **Explain the "why"** — when choosing colors, fonts, or layouts, explain the reasoning. This helps the user and keeps decisions intentional.
3. **Mobile-first always** — design for 375px first, then expand. Never the reverse.
4. **Less is more** — whitespace is a design element. Don't fill every pixel.
5. **Consistent rhythm** — spacing, sizing, and color should feel like a system, not ad-hoc choices.
6. **Test in context** — a component in isolation looks different from a component in a full page. Always consider the whole.
