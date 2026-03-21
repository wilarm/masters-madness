# Masters Madness — Roadmap

**Tournament:** April 9–12, 2026 · **Picks Lock:** April 9, 2026 @ 5:00 AM MT
**Live URL:** https://mastersmadness.com
**Supabase Project:** amrwikktihzaafqbiawi (us-west-2)
**Last updated:** 2026-03-21 (session 5)

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

### Phase 9 — Email Notifications ✅ (completed 2026-03-21)
**Goal:** Transactional emails via Resend
- [x] `resend` package installed; `RESEND_API_KEY` + `EMAIL_FROM` env vars
- [x] `src/lib/email.ts` — HTML email templates + `sendPickConfirmation`, `sendPoolJoined`, `sendAnnouncement`, `sendDeadlineReminder`
- [x] Pick confirmation email — fired on `POST /api/pools/[slug]/picks` (non-blocking)
- [x] Pool joined welcome email — fired on `POST /api/pools/[slug]/join` (non-blocking)
- [x] Commissioner announcement blast — `POST /api/pools/[slug]/announce` (Clerk-resolved member emails)
- [x] Deadline reminder — `POST /api/admin/reminders` (admin-only, targets members without picks)
- [x] "Email" tab added to commissioner dashboard — shows auto-email status + announcement composer
- **TODO:** Verify `mastersmadness.com` domain in Resend dashboard; add `RESEND_API_KEY` to Vercel env vars

### Phase 10 — Payments ✅ (completed 2026-03-21)
- [x] `paid` column on `pool_members` ✅
- [x] Commissioner marks paid via toggle in Commissioner Dashboard → Members tab
- [x] "Payment pending" amber banner on pool page — shown to unpaid members when `entryFee > 0`; includes "Pay Now" button linking to Venmo if set
- [x] Entry fee formatted as `$100` on pool page stats card
- [x] Venmo/PayPal deep link in pool config (set in Commissioner Dashboard → Settings)

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

### Phase 21 — www Redirect ✅ (completed 2026-03-21)
- [x] `next.config.ts` redirect: `www.mastersmadness.com/:path*` → `mastersmadness.com/:path*` (permanent 308)

### Phase 22 — SEO & OG Tags ✅ (completed 2026-03-21)
- [x] `src/app/robots.ts` — disallows `/admin/` and `/api/`, points to sitemap
- [x] `src/app/sitemap.ts` — static routes + all public pool pages (fetched from Supabase)
- [x] Root layout — `metadataBase`, Twitter card, canonical URL, `robots` metadata
- [x] `/pool/[slug]` — `generateMetadata` with per-pool title, description (member count + prize pool), canonical URL, OG + Twitter tags

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

## Phase 27 — Commissioner Tags in Standings ✅ (completed 2026-03-21)
- [x] `StandingsParticipant` type extended with `customTag?: string | null`
- [x] `standings/page.tsx` — passes `m.custom_tag` from pool members to participants
- [x] `standings-preview.tsx` — renders tag pill (`bg-masters-gold/15 text-masters-gold-dark`) next to name in both pre-lock and post-lock row states; `MOCK_STANDINGS` typed as `StandingsParticipant[]`
- [x] Commissioner dashboard Customize tab — split single "Custom Tag" input into separate **Emoji** (single grapheme) + **Tag Label** fields; save concatenates to `"🔥 Dark Horse"` format; existing tags parsed on load

## Upcoming Session Priorities (next build session)

### Near-term (pre-Masters launch)
1. **Phase 9** — Email (Resend setup + pick confirmation + deadline reminder)
2. **Phase 10** — Payments (paid badge, Venmo link, unpaid banner on pool page)
3. **Phase 8** — Live scoring stub (seed golfers, wire `getPoolState()` auto-transition)
4. **Commissioner settings** — Add `numScoring`, `maxEntriesPerUser`, `communityMessageTitle` fields to creation wizard + settings UI
5. **Admin rules editor** — Add `communityMessageTitle` field to admin panel rules editor

### Post-Masters growth (Phases 28–32)
6. **Phase 28** — Tournament data model (`tournaments` table, link pools, data-driven pool state)
7. **Phase 29** — "Continue Playing" commissioner flow + post-tournament email campaign
8. **Phase 30** — Multi-tournament pick cycles (scoped picks, golfer field per tournament)
9. **Phase 31** — Season-long scoring & aggregate leaderboard
10. **Phase 32** — Full PGA Tour season mode (premium / future)

---

## Phase 24 — Pool Context Persistence & Auth-Aware Routing ✅ (completed 2026-03-21)

**Goal:** Make pool context stick across tab navigation; prevent signed-in users from seeing marketing/generic pages.

### 24A — Fix Active Pool Persistence in Navbar

**Root cause (current bug):** `urlPoolSlug` in `Navbar` is derived inside a `useEffect` with `[pathname]` as the only dependency. Reading `window.location.search` inside a pathname-only effect means:
- Switching pools while staying on the same page (e.g., going from pool-a → pool-b while on `/standings`) never updates `urlPoolSlug` because the pathname doesn't change.
- Page refresh drops back to `userPools[0]` (no persistence of the last-used pool).

**Fix plan:**
- [ ] **24A-1** Replace `window.location.search` read in `useEffect([pathname])` with Next.js `useSearchParams()` hook — this is reactive to query param changes and eliminates the stale-read bug.
- [ ] **24A-2** Persist active pool slug to `localStorage("mm_active_pool")` whenever it changes (pool switch, URL change). On mount, seed `activeSlug` from localStorage before the URL effect runs so it survives page refreshes.
- [ ] **24A-3** `PoolSwitcher` currently navigates to `/pool/${slug}` (pool detail page) when switching pools. Change it to navigate to the **current page** with the new pool slug: e.g., if user is on `/rules?pool=old-slug`, clicking pool B goes to `/rules?pool=new-slug`. Use `usePathname()` + `useSearchParams()` to construct the target URL. Fall back to `/standings?pool=${slug}` for paths without `?pool=` support (e.g., `/leaderboard`, `/research`).
- [ ] **24A-4** Mobile pool switcher (in the mobile drawer) applies the same logic as 24A-3.

### 24B — Auth-Aware Page Routing

**Goal:** Signed-in users with at least one pool should never land on the marketing/generic version of Standings, Analytics, or Rules.

**Rules:**
| User state | `/standings` (no pool param) | `/rules` (no pool param) | `/analytics` (no pool param) | `/` (home) |
|---|---|---|---|---|
| Signed out | Marketing demo ✅ | Global default rules ✅ | Demo analytics ✅ | Marketing ✅ |
| Signed in, **no pool** | Show a "join a pool" prompt or redirect → `/join` | Global rules ✅ | Demo analytics ✅ | Marketing with "Join a Pool" CTA ✅ |
| Signed in, **has pool(s)** | Redirect → `/standings?pool=[active]` | Redirect → `/rules?pool=[active]` | Redirect → `/analytics?pool=[active]` | Pool-aware home (see 24C) |

- [ ] **24B-1** In `standings/page.tsx`, `rules/page.tsx`, `analytics/page.tsx`: when `userId` exists, user has pools, and `?pool=` is absent — server-side redirect to the same page with `?pool=[first pool slug]`. Use `getPoolsForUser()` + `redirect()` from Next.js.
- [ ] **24B-2** `StandingsShell` on the standings page currently ignores the pool slug and shows demo/mock data even for authenticated pool members. Wire up `getPoolMembers(pool.id)` and pass real participants to `StandingsShell` (same pattern as `/pool/[slug]` page). The `showDemoToggle={!userId}` prop already exists — just needs real data fed in.
- [ ] **24B-3** The "How scoring works" info banner on the standings page hardcodes "best 4 of 9" — replace with pool-config-driven values (`numScoring`, `numTiers`) when a pool slug is present.

### 24C — Pool-Aware Home Page

**Goal:** Signed-in users with a pool shouldn't be stuck on the marketing home page — the logo link and the home page itself should provide pool-context navigation.

- [ ] **24C-1** In `Navbar`, change the logo `href="/"` to `href={hasPool ? \`/standings?pool=${activeSlug}\` : "/"}` so clicking the "M" logo goes to the user's pool standings, not the marketing home.
- [ ] **24C-2** `app/page.tsx` (home): if the user is signed in and has pools, show a "Your Pools" section above the marketing hero with quick-links to each pool (Standings, My Picks, Rules). Keep the full marketing content below for unauthenticated visitors.
- [ ] **24C-3** Home page CTAs ("Create a Pool" / "Join a Pool") should already be visible to signed-in users since they may want to join another pool — keep these.

### 24D — Edge Cases to Handle

- [ ] **Multi-pool users:** When a signed-in user with multiple pools visits a generic page, redirect to `?pool=[last-active]` (from localStorage preference), falling back to their first pool.
- [ ] **Pool slug in URL takes precedence:** If someone deep-links `/rules?pool=specific-slug` to a signed-in user, don't override it with their preferred pool — respect the explicit slug.
- [ ] **Pool you're not a member of:** If `?pool=someone-elses-pool`, display the pool's public info (same as `/pool/[slug]` page) but don't show pool-member-only content.
- [ ] **First sign-in / sign-up redirect:** After Clerk sign-in, Clerk's `afterSignInUrl` / `afterSignUpUrl` should land users on `/standings?pool=[slug]` if they were redirected from a pool-specific page. Currently lands on `/`.
- [ ] **`isActive()` in Navbar:** The active link check uses `pathname` only — a link to `/standings?pool=x` shows as active on `/standings?pool=y`. Fix: compare both pathname AND pool slug from the link href.

---

## Phase 25 — My Picks: Confirmation View & Post-Lock State ✅ (completed 2026-03-21)

**Goal:** When a user has already submitted picks, visiting the My Picks tab should default to a confirmation/summary view. After the picks lock, show read-only picks with no edit option.

### Current state
- `submitted` is local React state — resets on every page load.
- Existing picks are loaded into the picker UI (correct behavior during pick-making), but there's no indication to the user that their picks are already saved.
- No distinction between pre-lock (editable) and post-lock (read-only) states.
- `entry_num` hardcoded as `1` — no support for multiple entries even if the pool allows it.

### 25A — Confirmation View on Load
- [ ] **25A-1** After `useEffect` loads existing picks from `GET /api/pools/[slug]/picks`, if picks are found (at least 1 tier filled), immediately set `submitted = true` to show the confirmation view. The user sees their picks and an "Edit Picks" button.
- [ ] **25A-2** Confirmation view improvements:
  - Show the golfer's name, tier label, and flag (country emoji) in a clean card grid.
  - Show a "Last updated: [timestamp]" line using `pick.updated_at` from the API response.
  - Show a green "Picks saved" badge with the submission timestamp.
  - Show the pool name prominently at the top.
- [ ] **25A-3** "Edit Picks" button sets `submitted = false` and drops back into the picker UI with picks pre-loaded (already works).

### 25B — Post-Lock Read-Only Mode
- [ ] **25B-1** Check pool state (`getPoolState()` or from pool config) in the picks page. If state is `post_lock`, `in_progress`, or `complete`, show the confirmation view with NO "Edit Picks" button. Add a "Picks are locked" banner.
- [ ] **25B-2** The API (`POST /api/pools/[slug]/picks`) already rejects saves after lock — the UI should preemptively prevent attempts rather than waiting for an API error.
- [ ] **25B-3** If user has no picks and the pool is locked — show an "Oops, you missed the deadline" empty state with a link to watch standings.

### 25C — Multiple Entries (if pool allows)
- [ ] **25C-1** Pool config needs `maxEntriesPerUser` field (add to DB pool config schema, commissioner creation wizard, and commissioner settings UI).
- [ ] **25C-2** If `maxEntriesPerUser > 1`, the confirmation view shows entry tabs ("Entry 1", "Entry 2", etc.). Clicking an entry shows that lineup.
- [ ] **25C-3** If user has submitted entry 1 but entry 2 is empty (and pool allows 2), show a "Submit Entry 2" card alongside the Entry 1 confirmation — clicking it opens the picker for entry 2.

### 25D — No Pool Context State
- [ ] **25D-1** If user navigates to `/picks` without a `?pool=` param while signed in with a pool, redirect to `/picks?pool=[activeSlug]` rather than showing the "Open from your pool page to save picks" warning.
- [ ] **25D-2** If genuinely no pool (new user), keep the current demo/preview behavior but prompt to join/create a pool.

---

## Phase 26 — Rules Page Redesign ✅ (completed 2026-03-21)

**Goal:** Replace the scattered entry details cards with 4 prominent overview tiles at the top. Make all values dynamic from pool config. Rename/rework the community message section.

### Pool config fields needed (prerequisites)
Before building the Rules redesign, we need two fields added to the pool config schema:
- [ ] **26-pre-1** `numScoring` — how many of your golfers count toward your total score (currently hardcoded as 4 in all UI copy). Add to: pool creation wizard (Step 2), commissioner settings PATCH endpoint, `pool.config` type.
- [ ] **26-pre-2** `maxEntriesPerUser` — max lineups a single participant can submit. Add to: pool creation wizard, commissioner settings.

### 26A — Community Message Section
- [ ] **26A-1** Move the community message card to the very top of the page (above the new overview tiles). It's already there — keep the position.
- [ ] **26A-2** Change the section header from "Why Your Participation Matters" to a commissioner-configurable title. Add `communityMessageTitle` field to `RulesContent` / pool config.
  - Default title: `"Welcome to [pool name]"` (or `"Welcome to Masters Madness 2026"` when no pool).
  - Change the icon from `Heart` to `Trophy` or `PartyPopper` for a more celebratory / generic vibe.
- [ ] **26A-3** Commissioner can edit this title in the Commissioner Settings → Customize tab (alongside the message body).

### 26B — Overview Tiles (4 horizontal tiles)

Place these **below** the community message, **above** the How It Works / Simulator section.

| Tile | Value source | Fallback |
|---|---|---|
| **Scoring** — "Best X of Y count" | `pool.config.numScoring` / `pool.config.numTiers` | 4 of 9 |
| **Entries** — "X entry per person" | `pool.config.maxEntriesPerUser` | "1 entry" |
| **Entry Fee** — "$X per entry" + payment link below | `pool.config.entryFee` + `pool.config.venmoLink` | global settings fee |
| **Payouts** — top payout % or amount | `pool.config.payouts[0].amount` | 1st place from default payouts |

- [ ] **26B-1** Build `<RulesOverviewTiles>` client (or server) component — 4 equal-width square tiles in a horizontal row (responsive: 2×2 on mobile, 4×1 on desktop).
- [ ] **26B-2** Each tile: large centered value, small label below, optional sublabel (e.g., payment link under entry fee tile).
- [ ] **26B-3** Entry Fee tile: if `venmoLink` is set, render a clickable Venmo link below the fee amount (small text, opens in new tab).
- [ ] **26B-4** Scoring tile: display as "Best **4** of **9**" with the numbers bold/highlighted.

### 26C — How It Works section updates
- [ ] **26C-1** The "Selection" rule item currently hardcodes "9 groups" — replace with `numTiers` from pool config.
- [ ] **26C-2** The "Scoring" rule item hardcodes "best 4" — replace with `numScoring`.
- [ ] **26C-3** The `ScoringVisualizer` component uses hardcoded 9-tier / 4-count logic internally — wire `numTiers` and `numScoring` props into it.

### 26D — Entry Details section
- [ ] **26D-1** Now that the 4 tiles cover fee/entries/payouts, the separate "Entry Details" card below can be collapsed or removed to avoid duplication. Keep only the "Payment" and "Deadline" details cards (the fee and max entries are now in the overview tiles).
- [ ] **26D-2** Keep the "Payouts & Prizes" card and the "Spread the Word" share card as-is.

---

## Additional Edge Cases (applies across phases)

### Data model gaps
- [ ] `pool.config` type needs `numScoring` and `maxEntriesPerUser` — add TypeScript typing in `src/types/index.ts` and update the pool config DB schema/migration if needed.
- [ ] The `settings` table `RulesContent` type needs `communityMessageTitle` field added.

### Commissioner settings gaps
- [ ] Commissioner dashboard → Settings tab currently lets the commish edit: name, prize pool, entry fee, Venmo link. Need to add: numScoring, maxEntriesPerUser, communityMessageTitle.
- [ ] Pool creation wizard (Step 2 — Scoring Rules) should expose numScoring and maxEntriesPerUser as inputs (currently may hardcode defaults).

### Standings page — real member data
- The standings page for a signed-in pool member currently falls back to demo/mock data. It should show real pool members' names even before tournament scores exist (show "—" for score columns pre-lock). This overlaps with Phase 24B-2.

### Leaderboard vs Standings
- These are two different concepts that may confuse users: "Leaderboard" = real golf leaderboard (Phase 8); "Standings" = pool standings. Ensure nav labels and page headers make this distinction clear. Consider renaming "Leaderboard" to "Golf Leaderboard" in the nav.

### isActive() link highlighting in Navbar
- Current `isActive()` checks pathname only. `/standings?pool=x` and `/standings?pool=y` both "match" `/standings`. This means both pools' Standings links appear active simultaneously. Fix: include pool slug in the active check.

---

## Phase 28 — Tournament Data Model 🟡 MEDIUM

**Goal:** Lift the concept of a "tournament" out of hardcoded constants in `pool-state.ts` and make it a first-class DB entity. This is the foundational change that unlocks everything in Phases 29–32.

### The core problem today
`getPoolState()` in `pool-state.ts` uses four hardcoded `Date` constants — the picks deadline, tournament start, and tournament end for the 2026 Masters. There is no way for a pool to point at a different tournament, no way to add PGA Championship support, and no way for a commissioner to configure which tournament their pool is running on. Every phase in multi-tournament support depends on this being data-driven.

### Design principles (Norman + Krug)
- **Affordance (Norman):** Each tournament in the system should clearly signal what actions are available — commissioners should never have to guess what "configuring a tournament" means.
- **Visibility (Norman):** Pool state (locked, live, complete) should be derived from the tournament's dates, not hidden in code. If a commissioner can see the tournament dates, they can predict the pool's behavior.
- **Don't Make Me Think (Krug):** A commissioner setting up a pool for the PGA Championship shouldn't have to know anything about the underlying data model — just pick the tournament from a list and everything else follows.

### 28A — `tournaments` table
```sql
create table tournaments (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,                       -- "The Masters 2026"
  short_name   text not null,                       -- "Masters"
  slug         text unique not null,                -- "masters-2026"
  tour         text not null default 'pga',         -- 'pga', 'liv', 'dp_world'
  season       int not null,                        -- 2026
  picks_lock   timestamptz not null,                -- deadline for picks submissions
  starts_at    timestamptz not null,                -- first tee time
  ends_at      timestamptz not null,                -- last putt on Sunday
  course       text,                                -- "Augusta National"
  city         text,                                -- "Augusta, GA"
  logo_url     text,                                -- tournament logo/badge
  is_major     boolean not null default false,
  created_at   timestamptz default now()
);
```

- [ ] **28A-1** Write migration `004_tournaments.sql` — create `tournaments` table with the schema above.
- [ ] **28A-2** Seed the Masters 2026 tournament row: `slug = 'masters-2026'`, picks_lock = `2026-04-09T11:00:00Z`, starts_at = `2026-04-09T13:00:00Z`, ends_at = `2026-04-12T23:59:00Z`.
- [ ] **28A-3** Seed the remaining 2026 Major rows (PGA Championship, US Open, The Open Championship) with correct dates.

### 28B — Link pools to tournaments
- [ ] **28B-1** Add `tournament_id uuid references tournaments(id)` column to the `pools` table (nullable — existing pools stay valid; we backfill Masters 2026 via migration).
- [ ] **28B-2** Backfill existing pools: `UPDATE pools SET tournament_id = (SELECT id FROM tournaments WHERE slug = 'masters-2026')`.
- [ ] **28B-3** Add DB helper `getTournamentForPool(poolId)` → returns the `Tournament` row or null.
- [ ] **28B-4** Add `getTournamentBySlug(slug)` for use in server components.

### 28C — Data-driven `getPoolState()`
Replace the hardcoded constants with tournament-aware state derivation:

```ts
// Before (hardcoded):
export function getPoolState(now = new Date()): PoolState { ... }

// After (tournament-aware):
export function getPoolStateForTournament(tournament: Tournament, now = new Date()): PoolState {
  if (now < tournament.picks_lock) return "pre_lock";
  if (now < tournament.starts_at) return "post_lock";
  if (now <= tournament.ends_at) return "in_progress";
  return "complete";
}
```

- [ ] **28C-1** Add `Tournament` TypeScript type to `src/types/index.ts`.
- [ ] **28C-2** Add `getPoolStateForTournament(tournament, now?)` to `pool-state.ts`. Keep the existing `getPoolState()` as a backward-compat shim that uses Masters 2026 dates until callers are migrated.
- [ ] **28C-3** Update `standings/page.tsx`, `rules/page.tsx`, `picks/page.tsx` to fetch the pool's tournament and call `getPoolStateForTournament()` instead of `getPoolState()`.

### 28D — Tournament picker in pool creation wizard
- [ ] **28D-1** In the pool creation wizard (Step 2), replace the static "2026 Masters" text with a tournament selector. Show upcoming tournaments sorted by `starts_at`. Display tournament name, course, dates.
- [ ] **28D-2** Default selection: the next tournament that hasn't started yet (by `starts_at`). If none, the most recent one.
- [ ] **28D-3** Store `tournament_id` in the pool config when saving via `POST /api/pools`.
- [ ] **28D-4** Commissioner can later change the tournament in commissioner settings → Settings tab (before picks lock).

---

## Phase 29 — Post-Tournament "Continue Playing" Flow 🟡 MEDIUM

**Goal:** After the Masters ends (pool state = `complete`), give commissioners a clear, zero-friction path to continue the pool for the next Major or the full season. This is the primary growth lever post-Masters.

### Design principles (Norman + Krug)
- **Signifier (Norman):** The "Continue Playing" CTA must appear naturally at the moment commissioners realize the tournament ended — on the standings page, in the post-tournament email. It shouldn't require them to navigate somewhere.
- **Feedback (Norman):** After a commissioner starts a new tournament cycle, all participants should receive an email within seconds confirming the pool is continuing.
- **Three-click rule (Krug):** Commissioner sees standings → clicks "Continue Playing" → picks a tournament → done. Three clicks, no dead ends.
- **Don't Make Me Think (Krug):** The button label must be instantly obvious. "Continue Playing" or "Set Up Next Tournament" — not "Configure Pool Tournament ID."

### 29A — Post-complete banner on standings page
When `poolState === "complete"` and `isCommissioner`:

```
┌─────────────────────────────────────────────────────────────┐
│  🏆  The Masters 2026 is in the books!                      │
│  Ready to keep playing? Set up your pool for the next       │
│  Major or run the full season.                              │
│                                                             │
│  [Continue Playing →]    [View Final Standings]             │
└─────────────────────────────────────────────────────────────┘
```

- [ ] **29A-1** Add `<ContinuePlayingBanner>` component — only rendered when `poolState === "complete"` AND `isCommissioner`. Lives in `standings/page.tsx` above the standings table.
- [ ] **29A-2** "Continue Playing" button → opens modal (29B) or navigates to `/pool/[slug]/continue`.
- [ ] **29A-3** "View Final Standings" scrolls down / dismisses banner (localStorage key to suppress after dismissal).
- [ ] **29A-4** For non-commissioner pool members who visit a complete pool, show a read-only congrats banner: "🏆 Tournament Complete · [Winner name] wins [Prize]!" No CTA. Encourages commissioner to set up next tournament.

### 29B — "Continue Playing" setup modal/page
A minimal 3-step wizard accessible from the standings banner:

**Step 1 — Pick your next tournament**
- List of upcoming tournaments (from `tournaments` table) not yet associated with this pool
- Show name, dates, course
- Pre-select the next chronologically upcoming Major

**Step 2 — Choose a mode**
- [ ] **Season Majors** (4 tournaments, cumulative scoring — recommended) — "Play through all 4 Majors in 2026. New picks for each tournament; cumulative season leaderboard."
- [ ] **This tournament only** — "Set up your pool for just the PGA Championship 2026. Fresh picks, fresh start."

**Step 3 — Confirm & notify**
- Summary: pool name, tournament, mode
- "Notify Participants" checkbox (default on) — triggers email blast
- [Start Next Tournament] button

- [ ] **29B-1** Build `ContinueWizard` component (3-step) — follows same visual pattern as pool creation wizard.
- [ ] **29B-2** On save: `POST /api/pools/[slug]/continue` — creates a new `pool_tournament` record linking this pool to the next tournament, optionally transitions the pool to `pre_lock` for the new cycle.
- [ ] **29B-3** If "Notify Participants" is checked: trigger email to all pool members via Resend (depends on Phase 9).

### 29C — Post-tournament email campaign
Separate from the in-app flow, an automated email 24h after tournament completion:

**To commissioners:**
> Subject: "🏆 The Masters is over — keep your pool going?"
> Body: Short congratulations (winner name, their prize). One clear CTA: "Continue Playing →" (deep link to `/pool/[slug]/continue`).

**To participants:**
> Subject: "How'd you do at the Masters? 🏌️"
> Body: Their final rank + score. Pool winner + prize. One CTA: "View Final Standings". Teaser: "Your pool might be continuing for the PGA Championship — stay tuned!"

- [ ] **29C-1** Email templates (React Email) for commissioner + participant post-tournament summary.
- [ ] **29C-2** Cron job or webhook trigger: fires 24h after `tournament.ends_at`. Uses pool's `tournament_id` to know which tournament just completed.
- [ ] **29C-3** Winner name + prize included in email (requires live scoring from Phase 8 — stub with "Check standings" link if scoring not ready).

---

## Phase 30 — Multi-Tournament Pick Cycles 🟡 MEDIUM

**Goal:** When a pool spans multiple tournaments, each tournament has its own independent pick cycle — its own picks deadline, its own set of golfer selections per participant, its own lock window.

### The key insight
In a multi-tournament season, picks are not global — they're per-tournament. A participant picks a lineup for the Masters, then a fresh lineup for the PGA Championship. Their picks from April shouldn't override or conflict with their picks from May.

### 30A — Tournament-scoped picks
- [ ] **30A-1** Add `tournament_id uuid references tournaments(id)` column to the `picks` table. Existing picks get the Masters 2026 ID via backfill migration.
- [ ] **30A-2** Update `GET/POST /api/pools/[slug]/picks` to scope queries by `tournament_id`. The active tournament is derived from the pool's current `tournament_id` (or a `?tournament=` query param for historical lookup).
- [ ] **30A-3** DB helper `getPicksForTournament(poolId, userId, tournamentId)` — used by picks page + scoring.
- [ ] **30A-4** The picks page UI should show which tournament it's collecting picks for ("Making picks for: PGA Championship 2026"). No ambiguity for the user.

### 30B — Golfer field per tournament
- [ ] **30B-1** The current `players.ts` file has the Masters 2026 field. For multi-tournament support, we need tournament-specific player fields (the PGA Championship has a different field, different odds).
- [ ] **30B-2** Add a `golfers` table to Supabase with `tournament_id` — seeded with the full field + odds for each tournament. The picks UI reads from the active tournament's golfer list.
- [ ] **30B-3** Tier assignments become per-tournament: `getTierPlayers(tierNum, playersPerTier, tournamentId)` reads from the `golfers` table for that tournament's field.

### 30C — Picks navigation UI
When a pool has completed multiple tournaments, the standings/picks/analytics pages should allow historical navigation:

```
[Masters 2026 ✓]  [PGA Champ. (Active)]  [US Open (Upcoming)]
```

- [ ] **30C-1** `TournamentTabBar` component — horizontal tabs/pills showing each tournament the pool has run. Completed tournaments show a checkmark, active shows a dot, upcoming shows a clock.
- [ ] **30C-2** Clicking a past tournament tab loads that tournament's picks (read-only) and standings.
- [ ] **30C-3** The `?tournament=` query param encodes the active tournament context, just like `?pool=` encodes pool context.

---

## Phase 31 — Season-Long Scoring & Aggregate Leaderboard 🟡 MEDIUM

**Goal:** When a pool runs multiple tournaments, provide a cumulative season leaderboard — a single view showing who's winning across all tournaments combined.

### Scoring model
Each participant has a score per tournament (sum of their 4 best golfer scores at that event). The season score is the sum of their scores across all tournaments they've participated in. Lower is better (strokes-to-par).

### 31A — Season leaderboard data
- [ ] **31A-1** DB view or function `season_standings(pool_id)` — joins picks + scores across all of a pool's tournaments; returns `(participant_id, display_name, [per-tournament score], total_season_score)`.
- [ ] **31A-2** `GET /api/pools/[slug]/season-standings` — returns ranked season standings. Cached / invalidated when new tournament scores are ingested.

### 31B — Season standings UI
- [ ] **31B-1** Add a "Season" tab to the standings page (alongside individual tournament tabs from Phase 30C).
- [ ] **31B-2** Season standings table: rank, name, per-tournament score columns, season total. Columns for incomplete tournaments show "—" or "TBD".
- [ ] **31B-3** Movement arrows on season standings reflect position change since last tournament completed.

### 31C — Season payouts
- [ ] **31C-1** Commissioner can configure season payouts separately from per-tournament payouts in the pool creation wizard / commissioner settings.
- [ ] **31C-2** Season payouts card on the standings page shows season payout breakdown (1st, 2nd, 3rd across all Majors).

---

## Phase 32 — Full PGA Tour Season Mode (Future / Premium) 🟢 LOW

**Goal:** Allow pools to run for any PGA Tour event — not just Majors — and offer a "full 2026 season" mode with a season-long leaderboard across 40+ events. This is a premium/growth feature, not needed for the 2026 Masters launch.

### Design principles (Krug)
- **Progressive disclosure:** Don't surface this complexity to commissioners until they've successfully run at least one tournament. Show it as "Unlock the full season →" after the first tournament completes.
- **Scannability:** When 40 events are listed, the UI needs grouping (Majors, Signature Events, Regular Events) and smart defaults (show next 4 events, collapse the rest).

### 32A — PGA Tour event catalog
- [ ] **32A-1** Seed `tournaments` table with the full 2026 PGA Tour schedule (FedEx Cup events). Source: PGA Tour official schedule.
- [ ] **32A-2** Add `event_type` enum: `major`, `signature`, `elevated`, `regular`, `playoff`. Used to filter and group events in the UI.
- [ ] **32A-3** Add `fedex_cup_points` and `purse_usd` columns for display purposes (shows the prestige of each event).

### 32B — "Full Season" pool mode
- [ ] **32B-1** New pool config option: `season_type: "single" | "majors" | "full_season"`.
  - `single` — current behavior (one tournament, done).
  - `majors` — 4 Majors only, cumulative scoring.
  - `full_season` — all tour events, cumulative FedEx Cup–style scoring.
- [ ] **32B-2** Full season pools: participants make fresh picks before each event's lock window.
- [ ] **32B-3** Season-long leaderboard (Phase 31) powers the full-season standings.

### 32C — In-app growth surface
- [ ] **32C-1** After Masters 2026 completes, show commissioners a "Your season doesn't have to end here" section with three cards: "Next Major (PGA Champ)", "All 4 Majors", "Full PGA Tour Season". Each card briefly explains the format + a CTA.
- [ ] **32C-2** UX copy principles (Krug): label actions by outcome, not configuration — "Play the PGA Championship" not "Add tournament to pool". "Play all 4 Majors" not "Enable multi-tournament mode."
- [ ] **32C-3** "Full Season" mode should be the upsell / premium tier if Masters Madness ever monetizes. Gate behind a "Pro" flag in pool config if needed.

---

## Multi-Tournament Architecture Decisions

| Concern | Decision |
|---------|----------|
| Tournament identity | `tournaments` table in Supabase; each row is one PGA Tour event |
| Pool ↔ Tournament | `pools.tournament_id` for single-tournament; `pool_tournaments` junction table for multi-tournament season mode |
| Pool state source of truth | Derived from `tournament.picks_lock / starts_at / ends_at`, not hardcoded dates |
| Picks scoping | `picks.tournament_id` FK — all pick queries filter by active tournament |
| Golfer field | `golfers` table with `tournament_id` FK; replaces static `players.ts` for multi-tournament |
| Season scoring | DB view / function aggregating per-tournament scores; not computed client-side |
| "Continue Playing" entry point | Post-complete banner on standings page + post-tournament email (24h delay) |
| Commissioner UX copy | Action-labeled CTAs ("Play the PGA Championship") not config-labeled ("Add tournament") — Krug principle |
