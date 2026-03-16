# Masters Madness 2026 — Project Roadmap

**Branch:** `2026-masters-makeover`
**Last Updated:** 2026-03-15
**Current Phase:** Phase 3 — Visual Redesign (in progress)

---

## Project Overview

Complete overhaul of the Masters Madness tournament pool website for 2026. Transforming from a single static HTML page into a full-featured, polished web application with authentication, live data, analytics, and the ability for anyone to spin up their own pool.

---

## Phases & Status

### Phase 0: Planning & Setup ✅ COMPLETE
- [x] Clone repo and create `2026-masters-makeover` branch
- [x] Set up ui-ux-pro-max skill (design intelligence + 21st.dev Magic MCP)
- [x] Add Magic MCP server to Claude config
- [x] Create project roadmap (this document)
- [x] Generate design system (colors, typography, style direction) → see `DESIGN-SYSTEM.md`
- [x] Finalize tech stack decisions with user (Next.js + Clerk + Supabase + Vercel)
- [x] Set up project scaffolding

### Phase 1: Tech Stack & Architecture ✅ COMPLETE
**Goal:** Establish the technical foundation for all features.

- [x] **1.1 Choose framework** — Next.js 15 (App Router) with TypeScript
- [x] **1.2 Choose auth provider** — Clerk (with graceful fallback when keys not configured)
- [x] **1.3 Choose database** — Supabase (Postgres + Realtime + Auth + Storage)
- [x] **1.4 Choose hosting** — Vercel
- [x] **1.5 DNS setup plan** — Documented in Phase 9
- [x] **1.6 Scaffold Next.js project** — Tailwind 4, TypeScript, ESLint, all configured
- [x] **1.7 Define data model** — Types defined in `src/types/index.ts`
- [ ] **1.8 Set up database schema in Supabase** — Needs Supabase project creation
- [ ] **1.9 Set up CI/CD** — GitHub Actions for linting, type checking

### Phase 2: Authentication & Roles 🟡 PARTIALLY STARTED
**Goal:** Users can sign up, log in, and have role-based access.

- [x] **2.1 Auth provider integration** — Clerk integrated: sign-in/sign-up pages, middleware, navbar auth buttons
  - ⚠️ Needs real Clerk keys (create project at https://dashboard.clerk.com)
- [ ] **2.2 Role system** — 4 permission levels:
  - **Admin**: Full control (manage pool, edit golfer tiers, set deadlines, view all data)
  - **Player**: Make/edit picks, view standings, view own analytics
  - **Co-player**: Shared access to a Player's picks (invited by Player)
  - **Viewer**: Read-only access to standings, leaderboard, results
- [ ] **2.3 Profile system** — Name, initials (auto-generated), optional profile picture upload
- [ ] **2.4 Co-player invitation flow** — Player sends invite link, co-player gets access to that player's picks
- [ ] **2.5 Protected routes** — Middleware to enforce role-based access on every page

### Phase 3: Visual Redesign 🟡 IN PROGRESS
**Goal:** Complete visual makeover — premium, polished, modern.

- [x] **3.1 Generate design system** — Augusta green + gold, Playfair Display + Inter, full token system → `DESIGN-SYSTEM.md`
- [x] **3.2 Design global layout** — Top nav with responsive mobile drawer, max-w-7xl containers
- [x] **3.3 Design homepage / standings page** — Hero with wave divider, countdown, stat cards, standings table with avatars
- [x] **3.4 Design leaderboard page** — Clean table with score coloring, refresh button
- [x] **3.5 Design rules page** — Card-based sections with icons, payout display, entry details grid
- [x] **3.6 Design pick entry flow (placeholder)** — Coming soon page with lock deadline
- [x] **3.7 Design analytics dashboard (placeholder)** — Coming soon with feature preview cards
- [x] **3.8 Design research page** — Trending up/down cards, full player table with tiers/odds/trends/ranking
- [ ] **3.9 Dark mode support** — Full light/dark mode toggle
- [ ] **3.10 Mobile optimization** — Fine-tune on 375px, 768px, 1024px, 1440px
- [x] **3.11 Animations & micro-interactions** — Stagger enter animations, hover transitions, score coloring

### Phase 4: Core Features — Pick System 🔲 NOT STARTED
**Goal:** Replace Google Forms with a native pick system.

- [ ] **4.1 Golfer database** — All tournament golfers with: name, odds, tier, stats, bio/summary
- [ ] **4.2 Tier/group system** — 9 groups based on odds (Admin configurable)
- [ ] **4.3 Pick entry UI** — Select 1 golfer per group, visual confirmation, save to DB
- [ ] **4.4 Pick editing** — Modify picks before deadline
- [ ] **4.5 Pick locking** — Automatic lock at deadline (Thursday AM before tournament)
- [ ] **4.6 Entry fee tracking** — Mark as paid/unpaid (Admin feature)
- [ ] **4.7 Max 2 entries per participant**
- [ ] **4.8 Email confirmation** — Send confirmation when picks are submitted/changed

### Phase 5: Live Scoring & Standings 🔲 NOT STARTED
**Goal:** Pull live Masters scores and compute pool standings in real-time.

- [ ] **5.1 Research live scoring APIs** — Options:
  - ESPN API (unofficial but reliable)
  - SportsData.io (paid, official)
  - Web scraping from masters.com leaderboard
  - TheSportsDB or similar free APIs
- [ ] **5.2 Score ingestion service** — Cron job or webhook to pull scores every 5-10 min during tournament
- [ ] **5.3 Scoring engine** — Compute pool standings:
  - Aggregate scores of each player's 9 golfer picks
  - Best 4 of 9 count toward total
  - If <4 make the cut, use cut line score as replacement
- [ ] **5.4 Real-time updates** — Supabase realtime subscriptions to push score updates to clients
- [ ] **5.5 Standings display** — Ranked table with scores, movement indicators, expandable details

### Phase 6: Analytics Dashboard 🔲 NOT STARTED
**Goal:** Post-lock analytics showing risk vs. safety of each lineup.

- [ ] **6.1 Risk scoring algorithm** — Calculate a risk score for each lineup based on:
  - Golfer odds (longshots = high risk, favorites = low risk)
  - Historical volatility (consistency of recent finishes)
  - Course history at Augusta
- [ ] **6.2 Risk-reward matrix visualization** — 2D scatter plot:
  - X-axis: Risk level (safe → risky)
  - Y-axis: Upside potential (low ceiling → high ceiling)
  - Each point = a player's initials or profile picture
  - Hover to see full name + lineup summary
- [ ] **6.3 Lineup comparison tools** — Side-by-side compare any two entries
- [ ] **6.4 Popular picks chart** — Which golfers were picked most/least
- [ ] **6.5 "Bold pick" highlights** — Flag picks that are unusual/contrarian

### Phase 7: Research Page 🔲 NOT STARTED
**Goal:** Comprehensive golfer research hub with odds, trends, and analysis.

- [ ] **7.1 Golfer directory** — All tournament players sorted by odds to win
- [ ] **7.2 Player cards** — Each golfer row shows:
  - Name, photo, current odds, tier assignment
  - Trend indicator: ↑3 or ↓2 (spots moved since baseline)
  - Key stats: World ranking, recent form, Augusta history
- [ ] **7.3 Hover/click detail panel** — Expanded view with:
  - Player bio/summary
  - Analysis: Why they could contend / Why they might struggle
  - Recent tournament results
  - Course history at Augusta
- [ ] **7.4 Odds tracking** — Week-over-week odds comparison
  - Baseline odds (to be provided by user)
  - Current odds (updated weekly or from API)
  - Trend calculation: current rank vs. baseline rank
- [ ] **7.5 Trending players section** — Top movers up and down
- [ ] **7.6 Tier visualization** — Show all 9 tiers with players in each
- [ ] **7.7 Search/filter** — Filter by name, tier, trend direction

### Phase 8: Pool Creation (Self-Service) 🔲 NOT STARTED
**Goal:** Anyone can create their own Masters pool.

- [ ] **8.1 Pool creation wizard** — Name, entry fee, rules, payout structure, deadline
- [ ] **8.2 Pool invite system** — Shareable link to join a pool
- [ ] **8.3 Multi-pool support** — One user can be in multiple pools
- [ ] **8.4 Pool admin panel** — Manage members, payments, settings
- [ ] **8.5 Pool-specific standings** — Each pool has its own leaderboard
- [ ] **8.6 Default rules template** — Pre-filled with the current Masters Madness rules
- [ ] **8.7 Custom tier/group configuration** — Pool admin can adjust tiers

### Phase 9: DNS & Deployment 🔲 NOT STARTED
**Goal:** mastersmadness.com points directly to the app (not a redirect).

- [ ] **9.1 Vercel project setup** — Connect GitHub repo to Vercel
- [ ] **9.2 Custom domain configuration** — Add mastersmadness.com in Vercel dashboard
- [ ] **9.3 DNS records** — Update DNS at registrar:
  - A record → Vercel's IP (76.76.21.21)
  - CNAME for www → cname.vercel-dns.com
- [ ] **9.4 SSL certificate** — Auto-provisioned by Vercel
- [ ] **9.5 Remove forwarding** — Remove any existing URL forwarding rules at registrar
- [ ] **9.6 Verify & test** — Confirm root domain loads the app directly

### Phase 10: Polish & Launch Prep 🔲 NOT STARTED
- [ ] **10.1 End-to-end testing** — All flows work (sign up → pick → view standings)
- [ ] **10.2 Performance audit** — Lighthouse score ≥ 90 on all pages
- [ ] **10.3 Mobile testing** — Test on real devices (iOS Safari, Android Chrome)
- [ ] **10.4 SEO basics** — Meta tags, OG images, sitemap
- [ ] **10.5 Error handling** — Graceful error pages, loading states everywhere
- [ ] **10.6 Analytics** — Basic page view tracking (Vercel Analytics or similar)
- [ ] **10.7 Update 2026 content** — Rules, dates, payout info, golfer data
- [ ] **10.8 Beta test with small group** — Get feedback before wide release
- [ ] **10.9 Launch** 🚀

---

## Tech Stack (Proposed)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 14+ (App Router) | SSR, API routes, great ecosystem |
| Language | TypeScript | Type safety across the stack |
| Styling | Tailwind CSS + shadcn/ui | Utility-first + accessible components |
| Auth | NextAuth.js v5 (or Clerk) | Flexible, supports multiple providers |
| Database | Supabase (PostgreSQL) | Realtime, auth, storage, generous free tier |
| ORM | Prisma or Drizzle | Type-safe DB queries |
| Deployment | Vercel | Seamless Next.js deployment, CDN, analytics |
| Domain | mastersmadness.com | Custom domain via Vercel |
| Live Scores | TBD (ESPN/SportsData/scraping) | Need to evaluate options |
| Charts | Recharts or Chart.js | React-friendly data visualization |

---

## Data Model (Draft)

```
User
  - id, email, name, initials, avatarUrl, role (admin/player/co-player/viewer)

Pool
  - id, name, entryFee, rules, payoutStructure, deadline, createdBy (User)

PoolMember
  - id, poolId, userId, role (admin/player/viewer), isPaid

Entry
  - id, poolId, userId, lockedAt, totalScore, rank

Pick (one per group per entry)
  - id, entryId, groupNumber, golferId, golferScore

Golfer
  - id, name, photoUrl, odds, tier, worldRanking, trend, bio, analysis
  - augustaHistory, recentForm, baselineOdds, currentOdds

Score (live tournament scores)
  - id, golferId, round, score, position, thru, today, total

OddsSnapshot (weekly tracking)
  - id, golferId, odds, rank, capturedAt
```

---

## Session Log

| Date | Session | What Was Done | Next Steps |
|------|---------|---------------|------------|
| 2026-03-15 | Session 1 | Created branch, set up ui-ux-pro-max skill + Magic MCP, created roadmap, generated design system (DESIGN-SYSTEM.md), scaffolded full Next.js 15 app with Clerk auth + Supabase + Tailwind 4, built all 6 pages (home/hero, leaderboard, research, rules, picks, analytics), created reusable components (Navbar, Card, Avatar, ScoreBadge, Countdown), defined full TypeScript data model, verified build passes and all pages render | Hook up real Clerk keys, set up Supabase project + schema, build functional pick system (Phase 4), integrate live scoring API (Phase 5) |

---

## How to Resume

1. Open this file (`ROADMAP.md`) to see current status
2. Check the "Session Log" table for what happened last
3. Look at the first unchecked item in the current phase
4. Continue from there

**Current stop point:** Phases 0-1 complete, Phase 2-3 partially complete. The app is scaffolded, builds, and renders all 6 pages with the full design system applied. Next priorities: (1) Set up real Clerk keys for auth, (2) Create Supabase project + run schema, (3) Build the functional pick entry system (Phase 4), (4) Integrate a live scoring API (Phase 5).
