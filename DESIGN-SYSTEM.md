# Masters Madness 2026 — Design System

## Brand Direction
**Theme:** Premium sports tournament pool — Augusta National inspired
**Feeling:** Exclusive, prestigious, competitive, but approachable and fun
**Keywords:** luxury-sports, dark-green, gold-accent, premium, sophisticated, modern

---

## Color Palette

### Primary Masters Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#025928` | Augusta green — headers, nav, primary buttons |
| `--primary-dark` | `#013D1B` | Darker green — hover states, active nav |
| `--primary-light` | `#E6F7E9` | Light green wash — highlights, selected rows |
| `--accent` | `#C4A747` | Masters gold — badges, ranks, accents, trophy icons |
| `--accent-dark` | `#A16207` | Deep gold — WCAG-compliant text on white backgrounds |

### Neutral Scale
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#FAFAF5` | Page background — warm off-white (not stark white) |
| `--card` | `#FFFFFF` | Card/container background |
| `--foreground` | `#1C1917` | Primary text — near-black |
| `--muted` | `#64748B` | Secondary text, timestamps, labels |
| `--border` | `#D6D3D1` | Borders, dividers |
| `--muted-bg` | `#F5F3E8` | Muted backgrounds (carried from original) |

### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | `#16A34A` | Under par, positive trends |
| `--danger` | `#DC2626` | Over par, negative trends, destructive actions |
| `--warning` | `#F59E0B` | Caution, pending states |
| `--info` | `#2563EB` | Links, informational badges |

### Score Colors (Tournament-Specific)
| Token | Hex | Usage |
|-------|-----|-------|
| `--score-under` | `#025928` | Under par scores (green, bold) |
| `--score-over` | `#DC2626` | Over par scores (red) |
| `--score-even` | `#1C1917` | Even par scores (neutral) |
| `--score-cut` | `#9CA3AF` | Missed cut / withdrawn |

---

## Typography

### Font Pairing: Playfair Display + Inter
- **Headings:** Playfair Display (serif) — elegant, premium, editorial feel
- **Body:** Inter (sans-serif) — clean, highly readable, modern
- **Monospace:** JetBrains Mono — scores, stats, numbers

### Type Scale
| Element | Size | Weight | Font |
|---------|------|--------|------|
| Page title (h1) | 36px / 2.25rem | 700 | Playfair Display |
| Section heading (h2) | 28px / 1.75rem | 600 | Playfair Display |
| Subsection (h3) | 22px / 1.375rem | 600 | Playfair Display |
| Body text | 16px / 1rem | 400 | Inter |
| Small text | 14px / 0.875rem | 400 | Inter |
| Caption/label | 12px / 0.75rem | 500 | Inter |
| Score/stat number | 16px / 1rem | 600 | JetBrains Mono |
| Large stat | 32px / 2rem | 700 | JetBrains Mono |

### Google Fonts Import
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
```

---

## Spacing

Base unit: **4px**

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight gaps (icon to text) |
| `--space-2` | 8px | Inner padding, small gaps |
| `--space-3` | 12px | Default component padding |
| `--space-4` | 16px | Card padding, section gaps |
| `--space-6` | 24px | Between related sections |
| `--space-8` | 32px | Major section spacing |
| `--space-12` | 48px | Page section separators |
| `--space-16` | 64px | Hero/major section padding |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Tags, badges |
| `--radius-md` | 8px | Buttons, inputs, small cards |
| `--radius-lg` | 12px | Cards, panels |
| `--radius-xl` | 16px | Large cards, modal dialogs |
| `--radius-full` | 9999px | Avatars, pills |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation (inputs) |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | Cards, dropdowns |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, popovers |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.1)` | Hero cards, featured elements |

---

## Animation

| Property | Value |
|----------|-------|
| Duration (micro) | 150ms |
| Duration (standard) | 250ms |
| Duration (complex) | 400ms |
| Easing (enter) | `cubic-bezier(0.0, 0.0, 0.2, 1)` — ease-out |
| Easing (exit) | `cubic-bezier(0.4, 0.0, 1, 1)` — ease-in |
| Easing (standard) | `cubic-bezier(0.4, 0.0, 0.2, 1)` — ease-in-out |
| Stagger delay | 30-50ms per item |

---

## Breakpoints

| Name | Width | Target |
|------|-------|--------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1440px | Large screens |

Max content width: **1200px** (centered)

---

## Component Patterns

### Cards
- White background, `radius-lg`, `shadow-md`
- `space-4` padding
- Hover: slight scale (1.01) + shadow increase over 250ms
- Green left border for "featured" or "your entry" states

### Tables (Leaderboard/Standings)
- Sticky header with `--primary` background
- Alternating row backgrounds (white / `--muted-bg`)
- Hover highlight in `--primary-light`
- Score cells use monospace font + semantic colors
- Rank column: bold, centered
- Movement indicators: ▲ green, ▼ red, — gray

### Buttons
- Primary: `--primary` bg, white text, `radius-md`
- Secondary: white bg, `--primary` border + text
- Ghost: transparent bg, `--muted` text
- Destructive: `--danger` bg, white text
- All: 150ms transition, slight scale on press (0.98)

### Navigation
- Top nav bar: white bg, `--primary` accent
- Active link: green bottom border (3px)
- Mobile: hamburger → slide-out drawer
- Sticky on scroll

### Avatars / Initials
- Circular, `radius-full`
- Size tokens: sm (32px), md (40px), lg (56px)
- Fallback: initials on `--primary` background
- Hover in matrix: scale up + tooltip with full name
