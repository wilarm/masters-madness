# Masters Madness — Roadmap

**Tournament:** April 9–12, 2026 · **Picks Lock:** April 9, 2026 @ 5:00 AM MT
**Live URL:** https://mastersmadness.com
**Supabase Project:** amrwikktihzaafqbiawi (us-west-2)
**Last updated:** 2026-03-19 (session 3)

---

## ✅ Completed

### Infrastructure & Auth
- [x] **Next.js 15 + Tailwind + shadcn** — full project scaffold
- [x] **Design system** — Masters green/gold palette, typography, component library (Card, Badge, Button, Avatar, ScoreBadge, etc.)
- [x] **Clerk auth** — sign-in/sign-up flows, `pk_live_` production keys on mastersmadness.com
- [x] **Middleware** — auth-required route gating, admin subdomain routing (`admin.mastersmadness.com` → `/admin/*`)
- [x] **Platform admin gating** — `ADMIN_USER_IDS` env var (Will: `user_3B04zPjDZcFNdfp3dZTWGAE7EWO`)
- [x] **Supabase** — live DB, all tables migrated, service role + anon keys wired
- [x] **Vercel** — deployed to production, GitHub auto-deploy on push to `main`
- [x] **Custom domain** — mastersmadness.com + www, DNS via Squarespace → Vercel

### Phase 2 — Role System (completed 2026-03-17)
- [x] `pool_members` schema — `display_name` + `custom_tag` columns added via migration
- [x] `db/pools.ts` — `getPoolMembers()`, `updateMemberDisplayName()`, `addPoolMember()` with display name
- [x] `POST /api/pools` — stores commissioner display name from Clerk on pool creation
- [x] `POST /api/pools/[slug]/join` — join pool as player, captures display name from Clerk
- [x] `GET/POST /api/pools/[slug]/picks` — save picks to Supabase, respects lock state, allows commissioner override
- [x] `auth.ts` — `isPlatformAdmin()`, `getUserPoolRole()`, `isPoolCommissioner()`, `requireAuth()`, `requirePlatformAdmin()`
- [x] `/pool/[slug]` — wired to real DB: actual member count, names, roles, role-based CTAs
- [x] `/picks?pool=slug` — `handleSubmit` POSTs to API; warns if no pool context; Suspense boundary
- [x] `JoinPoolButton` — client component with loading/error state, calls join API + refreshes

### Phase 17 — Real Supabase Keys (completed 2026-03-17)
- [x] Supabase project created, all tables migrated (initial migration `001`)
- [x] Env vars wired: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [x] Service role client used for all server-side DB calls (bypasses RLS)

### Phase 19 — 2026 Tournament Field + Dynamic Tiers (completed 2026-03-18)
**Goal:** Replace placeholder golfer data with the real 2026 Masters field; make tier assignments driven by pool config rather than hardcoded odds ranges

- [x] **`src/data/players.ts` — full 2026 field (86 players)**
  - All players from the official invite list with March 2026 odds
  - Complete scouting report for every player: summary, bull case, bear case
  - Stats: world ranking, Masters appearances, best finish, 2025 result, recent form
  - `tier` field set to 5-per-tier demo default (ranks 1-5 = T1, 6-10 = T2, …, 41+ = T9)
  - Tier labels: Elite / Contender / Threat / Sleeper / Value / Upside / Longshot / Flier / Hail Mary
  - "Not listed" players (odds not available) all land in Tier 9 (Hail Mary) — 41 players incl. Tiger, Phil, DJ, Vijay, past champions, international qualifiers
- [x] **`src/lib/tier-assignments.ts` — dynamic tier engine**
  - `PLAYERS_BY_ODDS` — sorted array (ascending oddsNum, then currentRank)
  - `getTierPlayers(tierNum, playersPerTier)` — slices the sorted field; no hardcoded ranges
  - `buildTierMap(numTiers, playersPerTier)` — full tier map for the pool config
  - `DEMO_NUM_TIERS = 9`, `DEMO_PLAYERS_PER_TIER = 5` constants for demo/marketing default
- [x] **`GET /api/pools/[slug]/route.ts` — new pool config endpoint**
  - Returns `{ slug, name, state, numTiers, playersPerTier }` from pool config
  - Used by picks page on mount to load the commissioner's tier configuration
- [x] **`/picks` page — wired up end-to-end**
  - **Loads existing picks from DB on mount** — `GET /api/pools/[slug]/picks` on mount; no more losing picks on page refresh
  - **Respects pool config** — fetches pool's `numTiers` + `playersPerTier` on mount; entire UI (sidebar tiers, progress bar, navigation, submit button) driven by those values
  - **Falls back to demo defaults** — `numTiers=9, playersPerTier=5` when no pool context (logged-out / demo)
  - A pool configured with 8 players/tier automatically shows 8 options per group — no code change needed

### Phase 18 — Marketing Demo Mode (completed 2026-03-18)
- [x] `/standings` — `defaultDemo=true` + `showDemoToggle` for all visitors; demo banner visible, picks shown
- [x] `/analytics` — same demo-on-by-default pattern; removed from middleware auth-required routes
- [x] Pool Analytics added to navbar for all visitors (removed `auth: true` gate)
- [x] `StandingsShell` — new `showDemoToggle` + `defaultDemo` props; `participants` prop overrides mock data
- [x] `StandingsPreview` — accepts `participants?: StandingsParticipant[]` to display real pool members
- [x] `AnalyticsShell` — new `showDemoToggle` + `defaultDemo` props, same pattern as standings
- [x] `/pool/[slug]` — participants section replaced with `StandingsShell` + real member data; 4 stat tiles (Prize Pool, Participants, Entry Fee, Tournament); gold banner updated to "Join this Pool" (→ sign-up + picks redirect) / "Sign In"
- [x] Localhost dev unblocked: `DEV_USER_ID` bypass in `getAuthUserId()` for all API routes
- [x] Pool creation wizard: "Create Account" CTA at end of funnel for unauthenticated users (sessionStorage config persistence)

### Phase 15 — Commissioner Dashboard (completed 2026-03-17)
**Goal:** Full pool management UI at `/pool/[slug]/commissioner`
- [x] **Tab 1 — Members:** view all members, paid toggle (optimistic), remove member
- [x] **Tab 2 — Picks:** read-only view of all member picks per tier
- [x] **Tab 3 — Settings:** edit pool name, prize pool display, entry fee, Venmo link
- [x] **Tab 4 — Customize:** set custom tags + display names per participant
- [x] Route protection: must be `isPoolCommissioner()` to access
- [x] API routes: `PATCH/DELETE /api/pools/[slug]/members/[userId]`, `PATCH /api/pools/[slug]/settings`
- [x] DB helpers: `updateMember()`, `removeMember()`, `updatePoolSettings()`
- [ ] **Remaining:** Picks edit (commissioner override post-lock), send announcement email (Phase 9 dep)

### Phase 20 — Admin Portal (completed 2026-03-18)
**Goal:** Internal tool at admin.mastersmadness.com (Will + co-founder only)
- [x] `/admin` dashboard — stats tiles (total pools, members, picks, live pools), pools-by-state summary
- [x] Searchable pools table — name, slug, state badge, member/pick counts
- [x] Per-pool state override — 4 state buttons (Pre-Lock, Post-Lock, Live, Complete) with optimistic update + server refresh
- [x] State glossary — explains all 4 pool states at a glance
- [x] **Rules editor** — collapsible section to edit all rules page content: community message, entry deadline, fee, max entries, payment info, payout rows (add/remove/highlight), payout note, share URL
- [x] `settings` table (migration `002`) — key-value store for site-wide config; seeded with default rules
- [x] `src/lib/db/settings.ts` — `getRulesContent()` / `updateRulesContent()` with typed `RulesContent` + fallback defaults
- [x] `PATCH /api/admin/rules` — admin-only save endpoint; merges partial updates
- [x] `/rules` page — now async server component, fetches from DB with `revalidate=60` ISR
- [x] Middleware DEV_USER_ID bypass — admin routes work on localhost without Clerk session

### Phase 23 — Pool Discovery + Nav Overflow Menu (completed 2026-03-19)
- [x] `/join` pool discovery page with search + pagination
- [x] `PoolDiscoveryCard` with Join Pool / View Pool / Sign In to Join CTAs
- [x] `MoreMenu` overflow dropdown for pool members (desktop)
- [x] Navbar 3-state restructure (signed out / no pool / pool member)
- [x] `getPublicPools` DB helper + `GET /api/pools` public endpoint
- [x] `getPoolsForUser` returns `PoolWithRole[]` (role per pool)
- [x] `PoolStub` extended with `role`; `/api/me/pools` includes role

### Session 3 — Pool UX + Rules + communityMessage (completed 2026-03-19)
- [x] **Pool-aware navbar** — fetches pools once, passes to PoolSwitcher; My Picks / Pool Analytics / Rules links include `?pool=[slug]`
- [x] **Rules page** — reads `?pool=slug`, pulls entry fee / prize pool / Venmo / communityMessage from pool config; `CopyShareButton` replaces hardcoded link
- [x] **Commissioner Settings** — `communityMessage` textarea (500 char) saves to pool config
- [x] **Settings API** — wires `communityMessage` through config save/clear
- [x] **`DEFAULT_RULES.communityMessage`** — updated to generic text (no donation mention)

### Previously Completed Phases
- [x] **Phase 1** — Pool create wizard (multi-step, config stored to Supabase)
- [x] **Phase 3** — Picks UI (tier-by-tier golfer selection, watchlist, scouting reports)
- [x] **Phase 4** — Research/analytics page
- [x] **Phase 5** — Rules page
- [x] **Phase 6** — Home page with pool CTA
- [x] **Phase 11** — Design system & component library
- [x] **Phase 13** — Watchlist (localStorage, star toggle)
- [x] **Phase 14** — Player group tags (LIV, lefty, debutant, etc.)

---

## 🔲 Remaining (priority order, 22 days to lock)

### Phase 23 — Pool Discovery + Nav Overflow Menu ✅ (completed 2026-03-19)
**Goal:** Give signed-in users without a pool a clear path to find one; slim the primary nav with a "more" overflow menu for pool members.

#### Nav States (implemented)
| State | Primary Nav | More Menu (…) |
|---|---|---|
| Signed out | Standings, Leaderboard, Research, Rules | Not shown |
| Signed in, **no pools** | Join a Pool, Leaderboard, Research | Not shown |
| Signed in, **in pool(s)** | Standings, Leaderboard, My Picks | Pool Analytics, Research, Rules, —, Join Another Pool, Commissioner Settings* |

*Commissioner Settings only shown if `userPools[0].role === 'commissioner'`

- [x] **23A-1** `getPublicPools(page, search)` — Supabase `.select("*, pool_members(count)")`, returns `{ pools: PoolWithCount[], total }`
- [x] **23A-2** `getPoolsForUser` updated to return `PoolWithRole[]` (pool + `myRole` per pool)
- [x] **23A-3** `GET /api/pools` — public discovery endpoint (page + q params)
- [x] **23A-4** `GET /api/me/pools` — now includes `role` in each pool stub
- [x] **23A-5** `PoolStub` type extended with `role` field
- [x] **23B-1** `/join` — SSR server component, reads `?q` + `?page`, fetches pools + user memberships in parallel
- [x] **23B-2** `PoolDiscoveryCard` — state badge, member count, entry fee; join → redirect to pool page
- [x] **23B-3** Pagination controls (Prev/Next + "Page X of Y · N pools")
- [x] **23B-4** Search form (plain GET form, no JS required)
- [x] **23B-5** Signed-out CTA: "Sign In to Join" link
- [x] **23C-1** `MoreMenu` — `MoreHorizontal` icon, click-outside-to-close, active-state highlighting
- [x] **23C-2/3/4/5** Navbar fully restructured for all three user states; mobile drawer includes overflow with divider
- [x] **23D-1** Landing page "Join a Pool" CTAs → `/join`

### Phase 9 — Email Notifications 🔴 HIGH
**Goal:** Transactional emails via Resend + React Email
- [ ] Set up Resend account + API key (`RESEND_API_KEY` env var)
- [ ] Pick confirmation email (sent on `POST /api/pools/[slug]/picks`)
- [ ] Deadline reminder email (24h before lock — April 8)
- [ ] Pool invite email (commissioner shares link → triggered on join)
- [ ] Commissioner announcement email (blast to all pool members)
- [ ] React Email templates with Masters branding

### Phase 10 — Payments 🔴 HIGH
**Goal:** Track payment status, show unpaid banner
- [ ] `paid` column already exists on `pool_members` ✅
- [ ] Commissioner can mark members as paid (in commissioner dashboard)
- [ ] "Payment pending" banner for unpaid members on pool page
- [ ] Venmo/PayPal deep link in pool config (commissioner sets at creation)
- [ ] Entry fee display on pool page (from `pool.config.entryFee`)

### Phase 8 — Live Scoring 🟡 MEDIUM
**Goal:** Real-time leaderboard during tournament (April 9–12)
- [ ] Golf data API integration (ESPN API or SportsData.io)
- [ ] `scores` table population via cron job (every 10 min during tournament)
- [ ] `golfers` table seeded with tournament field
- [ ] Pool standings calculation (sum of each member's 9 golfer scores)
- [ ] Live leaderboard on `/pool/[slug]` — replaces "Participants" with "Standings"
- [ ] Cut detection — mark cut golfers, apply penalty or zero scoring
- [ ] Score display on pool page (ScoreBadge, movement arrows)
- [ ] `getPoolState()` auto-transitions: `pre_lock` → `post_lock` → `in_progress` → `complete`

### Phase 16 — Supabase RLS Policies ✅ (completed 2026-03-18 session 2)
**Goal:** Lock down DB so anon/client-side can't read other users' picks
- [x] `pools` — public read for public pools; write by creator
- [x] `pool_members` — member-read, self-insert, commissioner update/delete; `display_name`/`custom_tag` columns ensured
- [x] `picks` — owner read/insert/update; commissioner read; post-lock read by pool members
- [x] `scores` / `golfers` — public read
- [x] `settings` — deny-all public; service role only
- [x] Migration `003_rls_policies.sql` — idempotent `DO $$ ... $$` blocks, architecture note explaining Clerk+service-role pattern
- [x] **Migration applied to production** — run in Supabase SQL Editor 2026-03-18; "Success. No rows returned" confirmed
- [x] **Navbar pool switcher** — `PoolSwitcher` component fetches `/api/me/pools`, shows pool name as link (1 pool) or dropdown (multiple); only visible when signed in
- [x] **No demo data for signed-in users** — `standings` and `analytics` pages pass `defaultDemo={!userId}` / `showDemoToggle={!userId}`; demo is marketing-only
- [x] `getPoolsForUser(userId)` DB helper — joins `pool_members → pools`, returns all pools user belongs to
- [x] `GET /api/me/pools` route — returns user's pools, 401 if unauthenticated

### Phase 21 — www Redirect 🟢 LOW
- [ ] Redirect `www.mastersmadness.com` → `mastersmadness.com` (canonical)
- [ ] Set up in Vercel project settings

### Phase 22 — SEO & OG Tags 🟢 LOW
- [ ] Per-pool OG image (pool name, member count, prize pool)
- [ ] `robots.txt`, `sitemap.xml`
- [ ] Twitter card meta tags

---

## Key Decisions & Architecture

| Concern | Decision |
|---------|----------|
| Auth | Clerk (production instance on mastersmadness.com) |
| DB | Supabase (Postgres), service role for server-side, anon for client |
| Role storage | Supabase `pool_members.role` (NOT Clerk Organizations) |
| Platform admin | `ADMIN_USER_IDS` env var — no DB needed |
| Picks format | JSONB `{ "tier-1": "Scottie Scheffler", "tier-2": "..." }` |
| Pool state | `pre_lock` → `post_lock` → `in_progress` → `complete` |
| Tier assignments | Dynamic — `getTierPlayers(tierNum, playersPerTier)` slices odds-sorted field; no hardcoded ranges |
| Demo tier default | `numTiers=9, playersPerTier=5` — top 45 players by odds, Tier 9 catches all "not listed" players |
| Email | Resend + React Email (not yet set up) |
| Payments | Manual tracking (paid boolean) + Venmo/PayPal link — no Stripe |
| Deployment | Vercel, GitHub auto-deploy, iad1 (US East) region |

---

## Upcoming Session Priorities (next build session)

1. **Phase 9** — Email (Resend setup + pick confirmation + deadline reminder)
2. **Phase 10** — Payments (paid badge, Venmo link, unpaid banner on pool page)
3. **Phase 8** — Live scoring stub (seed golfers, wire `getPoolState()` auto-transition)
