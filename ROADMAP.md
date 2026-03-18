# Masters Madness 2026 — Product Roadmap

**Branch:** `2026-masters-makeover`
**Last Updated:** 2026-03-17
**Current Phase:** Phase 11 ✅ COMPLETE · Phase 6 ✅ · Phase 17 🟡 (schema + helpers ✅, real Supabase keys needed) · Phase 19 mobile 🟡 (wizard mobile ✅)
**Up Next:** Phase 9 (Email), Phase 10 (Payments), Phase 8 (Live Scoring), Phase 2 remaining (Roles)

---

## Project Overview

Complete overhaul of the Masters Madness tournament pool website for 2026. Transforming from a single static HTML page into a full-featured, polished web application with authentication, live data, analytics, and the ability for anyone to spin up their own pool.

---

## Phase 0: Planning & Setup ✅ COMPLETE
- [x] Clone repo and create `2026-masters-makeover` branch
- [x] Set up `ui-ux-pro-max` skill (design intelligence + 21st.dev Magic MCP)
- [x] Add Magic MCP server to Claude config
- [x] Create project roadmap (this document)
- [x] Generate design system → `DESIGN-SYSTEM.md`
- [x] Finalize tech stack: Next.js 15 + Clerk + Supabase + Vercel
- [x] Set up project scaffolding

---

## Phase 1: Tech Stack & Architecture ✅ COMPLETE
- [x] Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- [x] shadcn/ui components installed
- [x] Clerk auth (`@clerk/nextjs@latest`) — middleware, ClerkProvider, sign-in/sign-up pages
- [x] Supabase planned (placeholder keys in `.env.local`)
- [x] Masters green/gold design system in `globals.css`
- [x] Fonts: Playfair Display (headings), Inter (body), JetBrains Mono (stats)
- [x] CSS animations, score color classes, custom properties
- [ ] Supabase project creation + schema migration
- [ ] CI/CD (GitHub Actions for lint + typecheck)

---

## Phase 2: Authentication & Roles ✅ CORE COMPLETE
- [x] Clerk integrated — middleware (`src/middleware.ts`), `ClerkProvider`, `<Show>` components
- [x] Sign In / Sign Up pages at `/sign-in`, `/sign-up`
- [x] Navbar auth-conditional links (My Picks, Analytics behind `<Show when="signed-in">`)
- [x] `UserButton` in navbar
- [x] Role system defined — `PoolRole: "commissioner" | "player" | "co_player" | "viewer"`
  - **Commissioner**: full pool control, can see all picks pre-lock, manage entries, edit picks past deadline
  - **Player**: submit/edit picks before deadline, view standings, view own analytics
  - **Co-player**: shares picks access with a Player (family share scenario)
  - **Viewer**: read-only access, no picks pre-lock visibility
- [x] `src/lib/auth.ts` — `isPlatformAdmin`, `getUserPoolRole`, `isPoolCommissioner`, `requireAuth`, `requirePlatformAdmin`
  - Platform admin gated by `ADMIN_USER_IDS` env var (comma-separated Clerk user IDs)
  - Pool commissioner read from Supabase `pool_members.role`; graceful fallback while DB not connected
- [x] Protected routes in middleware:
  - `/picks`, `/analytics` → require sign-in, redirect to `/sign-in?redirect_url=...`
  - `/pool/*/commissioner` → require sign-in
  - `/admin/*` and `admin.` subdomain → require sign-in + `ADMIN_USER_IDS` membership
  - Admin subdomain rewrite: `admin.mastersmadness.com/*` → `/admin/*`
- [x] `standings/page.tsx` — real `isPlatformAdmin` check replaces `!!userId` placeholder
- [ ] Profile system (name, initials auto-generated, optional avatar upload)
- [ ] Co-player invitation flow (player sends invite link)

---

## Phase 3: Visual Redesign ✅ COMPLETE
- [x] Design system tokens (Augusta green `#025928`, gold `#C4A747`, warm off-white `#FAFAF5`)
- [x] Top nav with responsive mobile drawer, auth-conditional links, `StartPoolButton`
- [x] **Home page** (`/`) — Hero with wave divider, countdown timer, stat cards, pool standings
- [x] **Leaderboard page** (`/leaderboard`) — placeholder
- [x] **Rules page** (`/rules`) — Interactive scoring visualizer (auto-play, simulate cuts), rule cards
- [x] **Analytics page** (`/analytics`) — placeholder
- [x] **Picks page** (`/picks`) — placeholder
- [x] **Research page** (`/research`) — Trending movers, full sortable/filterable player table
  - Hover cards (via React portal — fully opaque, no stacking context issues)
  - Click-to-expand scouting reports (summary, bull/bear case, stat blocks)
  - Tier filter pills, sort by any column, show full field button
- [x] **Pool slug page** (`/pool/[slug]`) — Shareable pool URL, public standings, auth CTA
- [x] **Pool creation** (`/pool/create`) — 5-step wizard (Basics → Tiers → Scoring → Payouts → Review)
- [x] Stagger animations, CSS micro-interactions, score color classes
- [x] Font readability fixes (replaced all `text-muted` with `text-foreground/N` variants)
- [ ] Dark mode toggle
- [ ] Mobile fine-tuning (375px, 768px, 1024px)

---

## Phase 4: Standings — Participant Picks Expansion ✅ COMPLETE
**Goal:** Click any participant row to see their full lineup with visual scoring states, plus key stats surfaced inline.

### Pre-lock view (standings row, collapsed)
- [ ] Show each participant's **pick personality badge** (auto-tagged, see Phase 13)
- [ ] Show commissioner-granted **custom badges** with hover tooltip (see Phase 13)
- [ ] Do NOT show picks — only who is in the pool

### Post-lock view (standings row, collapsed)
- [x] Show **top N golfer chips** inline (N = pool's counting number, default 4)
- [x] Each chip: abbreviated golfer name + current tournament score + tier dot (T1–T9)
- [x] Show participant's **current pool score** and **rank movement** indicator

### Expanded row (click participant name)
- [x] **Stat bar**: pool total score, projected finish, top-3 chance %, top-10 chance %
- [x] **All 9 picks** displayed as cards in a grid, grouped by status
- [x] **Visual states per golfer card:**
  - Counting — green left accent, "COUNTING" badge, shadow
  - Bench — neutral styling, "BENCH" badge
  - Cut — red accent, dimmed, strikethrough name, "CUT" badge
- [x] Each card shows: golfer name, tier badge, current total score, position, round-by-round scores (R1/R2/R3/R4)
- [x] **Score trajectory sparkline** — mini SVG sparkline showing cumulative score trajectory per golfer card
- [x] **What-if mode** button (post-lock) — toggle UI with swap indicators on each card; simulator banner (full implementation deferred to Phase 11)
- [x] Works pre-tournament (shows picks without scores), during (live scores), post (final)

### Files created/modified
- [x] `src/components/standings/participant-picks.tsx` — expandable picks component + GolferChips
- [x] `src/components/standings/standings-preview.tsx` — click handler, expanded row via Fragment + colSpan, Top Picks column
- [x] `src/data/mock-picks.ts` — mock participant picks data (15 participants, 9 picks each)
- [x] `src/middleware.ts` — public routes for unauthenticated access
- [x] `src/app/globals.css` — expandIn keyframe animation

---

## Phase 4b: Pool Creation Flow — Wire Up & Rules Sync 🔲 NOT STARTED
**Goal:** Connect the 'Start a Pool' wizard to actually create a real pool in the database, and ensure the Rules page reflects what the commissioner configured during setup.

- [ ] On wizard completion (Review step), POST pool data to API route → insert into Supabase `pools` table
- [ ] Generate unique pool slug and redirect commissioner to `/pool/[slug]`
- [ ] Rules page (`/rules`) reads pool config from DB instead of hardcoded defaults
  - Scoring structure, tier count, counting golfers, cut rules, payout structure all reflect what the commissioner set
  - Falls back to defaults for the demo/marketing pool
- [ ] Pool config stored as JSON in `pools.config` column (already in schema plan)
- [ ] Commissioner sees confirmation screen + shareable invite link after creation

---

## Phase 5: Marketing Page — mastersmadness.com ✅ COMPLETE
**Goal:** Polished public-facing landing page at the root domain. Built with the `ui-ux-pro-max` 21st.dev Magic MCP skill.

### Sections
1. **Hero** — Big headline, "Start a Pool" + "Join a Pool" CTAs, animated Augusta/golf visual
2. **How It Works** — 4-step: Create Pool → Invite Friends → Pick Golfers → Win
3. **Features Grid** — Live Scoring, Custom Rules, Research Tools, Analytics, Shareable Links, Side Games
4. **Social Proof** — Mock stats ("X pools created", "X picks made"), testimonial cards
5. **Pool Showcase** — Live-feel preview of standings with animated scores
6. **Research Preview** — Tease the player research page (odds/tier sample cards)
7. **It's Free (for now)** — "Always free during beta. Founding members get free pools for life." with referral hook
8. **CTA Footer** — "Ready to run your pool?" → Start a Pool button

### Notes
- Use `ui-ux-pro-max` skill + 21st.dev Magic MCP for hero animations, feature cards, testimonials
- Match Masters green/gold design system exactly
- Unauthenticated visitors at `mastersmadness.com` → marketing page
- Authenticated users redirect to `/app` (their pool standings)
- Referral program copy: "Sign up now — founding members get free pools forever when we go paid"

---

## Phase 6: Pre/Post Lock App States ✅ COMPLETE
**Goal:** The app should feel meaningfully different before and after picks lock. Commissioners get a demo mode.

### Pre-lock state
- Standings shows who is in the pool with their **pick personality badge** (publicly visible)
- Commissioner-granted **custom badges** visible (e.g. "Founding Member", "Two-time Champ")
- Picks are completely hidden from all non-admin users
- "Picks lock in: Xd Xh Xm Xs" countdown prominent throughout
- My Picks page shows your own picks (editable until lock)
- No analytics available (nothing to analyze yet)

### Post-lock state
- Full standings with all pick details visible after lock
- Analytics dashboard unlocked
- Message board opens for comments and reactions
- Side game picks revealed
- "Picks locked X hours ago" indicator replaces countdown

### Commissioner demo mode
- Toggle in commissioner settings: "Preview post-lock view"
- Simulates what the app looks like as if the deadline has passed
- Uses current picks data, shows them as if revealed
- Banner: "DEMO MODE — Simulating post-lock view" (dismissible)
- Useful for testing before the real tournament

### Implementation notes
- `poolState` enum: `"pre_lock" | "post_lock" | "in_progress" | "complete"`
- All components read from pool state to determine what to show
- Admin role bypasses lock for their own view (plus demo mode)

---

## Phase 7: Core Pick System 🟡 IN PROGRESS
**Goal:** Replace Google Forms with a native, locked-on-deadline pick system.

- [ ] Golfer database — all tournament golfers synced to Supabase
- [ ] Tier/group system — 9 groups based on odds (Admin configurable per pool)
  - **Custom tier mode**: Commissioner can choose between:
    - **"By Odds"** (default) — auto-groups golfers by betting odds into N tiers
    - **"Custom Groups"** — commissioner creates named groups (e.g., "Left Handed", "Bearded", "35+ Year Olds", "Amateurs", "Past Champions") and assigns golfers to each
  - [x] Custom tiers added in pool creation wizard (Step 2: Tier Configuration) with toggle between odds-based and custom
  - Research page tier filters are **dynamic** — pull from pool config so if commissioner made custom groups, those become the filter pills instead of T1–T9
- [x] **My Picks page** — tier-by-tier selection UI with integrated player research (scouting reports, bull/bear cases, stats inline)
- [x] **Research ↔ Picks integration** — same player analysis cards available in both tabs; can view scouting report while selecting
- [x] **Watchlist** — bookmark players in Research tab; watchlisted players highlighted in Picks tab
- [ ] Pick entry UI — select 1 golfer per group, visual confirmation, save to DB
- [ ] Pick editing — modify picks before deadline
- [ ] Pick locking — automatic lock at deadline (Apr 9, 2026 at 5am MT)
- [ ] **Autopick options** — when a participant hasn't picked, offer:
  - "Highest Odds" — auto-select the best-odds available golfer per tier
  - "Random" — randomly select one golfer per tier
  - "Commissioner's Picks" — commissioner can set a default lineup, used as autopick basis
- [ ] Max 2 entries per participant
- [ ] Email confirmation on submit/change (see Phase 9)
- [ ] **Commissioner: make picks on behalf of participant** — admin can enter/edit picks for any member at any time, even past deadline; logged with "Entered by [admin]" note
- [ ] **Commissioner: edit picks past deadline** — override lock for individual entries; requires confirmation + reason
- [ ] Entry validation — prevent duplicate golfer picks across a participant's two entries

---

## Phase 8: Live Scoring & Standings 🔲 NOT STARTED
**Goal:** Pull real Masters scores, compute pool standings in real-time.

- [ ] Research live scoring APIs (ESPN unofficial, SportsData.io, masters.com scraping)
- [ ] Score ingestion — cron job or webhook, every 5–10 min during tournament
- [ ] Scoring engine — best 4 of 9 count, cut rule replacement logic
- [ ] Supabase Realtime subscriptions → push updates to clients without polling
- [ ] "Scores as of X min ago" indicator

---

## Phase 9: Email Notifications (Wiring) 🔲 NOT STARTED
**Goal:** Set up the email infrastructure so notifications can be triggered by events.

### Provider
- Use **Resend** (resend.com) — simple API, great Next.js integration, generous free tier
- `src/lib/email.ts` — Resend client + send helpers
- React Email for templates (`@react-email/components`)

### Notification types
| Trigger | Recipient | Content |
|---------|-----------|---------|
| Picks submitted/changed | Participant | Confirmation with picks summary |
| 24h before lock | All members | Reminder with lock deadline |
| 1h before lock | Members who haven't picked | Urgent reminder |
| Picks locked | All members | Lock confirmation + link to standings |
| Daily score digest (R1–R4) | All members (opt-in) | Morning standings snapshot |
| Position change (+/- 2 spots) | Participant | "You moved to #X" alert |
| Tournament ends | All members | Final standings + winner announcement |
| Payment requested | New member | Pool join confirmation with payment link |
| Commissioner announcement | All members | Rich text from commissioner |

### User preferences
- Per-pool notification settings (opt-in/out per category)
- Stored in Supabase `notification_prefs` table
- Managed in user profile settings

---

## Phase 10: Payments & Prize Management 🔲 NOT STARTED
**Goal:** Commissioners can track who has paid and display payment info clearly.

### Commissioner settings
- Add Venmo handle, PayPal.me link, Zelle info (stored as text, displayed as buttons)
- Set entry fee per pool
- Mark individual entries as Paid / Unpaid (toggle in admin panel)

### Pool standings display
- **Prize pool total** — prominently shown, calculated as: `(paid entries × entry fee)`
- **Below prize pool**: subtle "% paid" progress bar — e.g. "12 of 15 paid (80%)"
  - Green bar fills as more people pay
  - Clicking opens payment info modal with commissioner's payment links
- **Unpaid badge** on participant row — red "UNPAID" chip visible only to admin; participant sees "Payment pending" on their own view
- **Payout breakdown** — "1st: $X · 2nd: $X · 3rd: $X" shown in pool info section
- Winner payout confirmation — commissioner marks payout as distributed, triggers notification

### Payment Pending Banner (participant-facing)
- **Gold banner** shown at the top of the pool page (below nav) when the signed-in participant has NOT been marked as paid by the commissioner
- Banner text: "Your entry fee hasn't been marked as paid yet. Send payment to your commissioner to confirm your spot."
- Banner includes **payment action buttons** — dynamically rendered based on what the commissioner has configured:
  - Venmo: deep link button "Pay via Venmo @handle"
  - PayPal: button "Pay via PayPal"
  - Zelle: text showing Zelle info (phone/email) with copy button
  - At minimum, shows the commissioner's Venmo handle as plain text if no deep links set
- Banner is **dismissible per session** (don't nag on every page load after dismissed)
- Banner disappears automatically once commissioner marks the entry as paid

### Notes
- No payment processing (Stripe, etc.) — just tracking and deep links to Venmo/PayPal
- Entry fee × entries = projected prize pool; actual prize pool = paid entries only

---

## Phase 10b: Standings Tab Customization 🔲 NOT STARTED
**Goal:** Commissioners can personalize the standings/home tab with a custom message and choose which stat tiles to display.

### Commissioner customization options (in admin/settings)
- **Custom message** — rich text or plain text field; displayed prominently at the top of the standings tab (e.g. "Welcome to the Armstrong Family Pool! Good luck everyone 🌿")
  - Pinned above the standings table
  - Supports basic formatting (bold, emoji, links)
- **Stat tile picker** — commissioner selects which tiles appear in the top tile row
  - Defaults to current tiles: Prize Pool, Entries, Days Until Lock, etc.
  - Can add, remove, or reorder tiles
  - Available tile types: Prize Pool, Entry Count, Days Until Lock, Top Score, Your Rank, % Paid, Countdown, Custom Metric
  - Custom metric: commissioner defines label + value (e.g. "Defending Champ: Will A.")
- **Tile layout** — commissioner picks how many tiles per row (2, 3, or 4)

### CTA section for unauthenticated / non-participant viewers
- Below the stat tiles, show a subtle **CTA bar** when the viewer is not a pool participant (or not signed in)
- Two buttons side by side:
  - **"Enter the Pool"** — links to join/picks flow for this pool
  - **"Sign In"** — links to sign-in page (post-auth redirect back to this pool)
- This CTA is hidden for participants who are already in the pool
- Supports the shareable standings link use case — anyone with the link sees this CTA

### Files
- `src/app/pool/[slug]/page.tsx` — add CTA section, custom message, tile picker rendering
- `src/components/standings/commissioner-message.tsx` — custom pinned message component
- `src/components/standings/tile-grid.tsx` — configurable tile grid replacing current hardcoded tiles

---

## Phase 11: Advanced Analytics Dashboard ✅ COMPLETE
**Goal:** Post-lock visualizations of risk, projections, and lineup intelligence.

### What was built
- `/analytics` page — gated behind pool state (locked pre-April 9, unlocked post-lock)
- **Commissioner demo mode** — same pattern as standings: amber banner, "Preview Analytics" toggle, "Exit Demo" button
- **3-tab pill selector** (21st.dev style: `#025928` active bg, `#C4A747` active icon)
  - **Tab 1: Metrics** — pick ownership, tier concentration, risk matrix, bold/consensus picks
  - **Tab 2: Projections** — sortable standings table, collapsed to top 5 with expand/collapse
  - **Tab 3: Simulator** — editable projected scores → live finish recalculation

### Components built
- [x] `analytics-shell.tsx` — tabs, demo mode, pool state gating, commissioner banner
- [x] `analytics-stats-bar.tsx` — Most Owned, Pool Size, Boldest Entry, Current Leader stat tiles
- [x] `pick-ownership-chart.tsx` — horizontal bar chart (Recharts), tier-color coded, contrarian reference line at 33%
- [x] `tier-coverage.tsx` — per-tier concentration bars (red ≥80%, amber 60–79%, green <60%)
- [x] `risk-matrix.tsx` — scatter plot (Recharts ScatterChart):
  - X axis = projected score; **right = Ahead (under par)**, left = Behind (over par)
  - Y axis = avg ownership; top = Consensus, bottom = Contrarian
  - Reference lines at x=0 (par) and y=50 (ownership midpoint)
  - Custom avatar dots (initials, colored by Safe/Balanced/Bold risk profile)
  - 4 quadrant labels: ↗ Consensus & Ahead (blue), ↖ Consensus & Behind (gray), ↘ Contrarian & Ahead (green), ↙ Contrarian & Behind (amber)
- [x] `bold-picks.tsx` — contrarian picks (≤2 entries) + consensus locks (≥10 entries)
- [x] `projections-table.tsx` — sortable by Pool Score / Proj. Finish / Top 3% / Top 10%, top-5 default with expand, mini progress bars, gold #1 / green top-3
- [x] `what-if-simulator.tsx` — participant dropdown, editable score inputs per golfer, best-4-of-N calculation, simulated finish vs. field, ▲/▼ delta, Reset button
- [x] `src/data/mock-analytics.ts` — `OWNERSHIP_CHART_DATA`, `PARTICIPANT_RISK`, `TIER_BREAKDOWN`, `CONTRARIAN_PICKS`, `CONSENSUS_PICKS`

### Deferred (future sessions)
- Correlation matrix (% pick overlap between pairs of participants)
- Round-by-round score breakdown chart
- `src/lib/projections.ts` Monte Carlo engine (currently uses mock projected scores)

---

## Phase 12: History, Badges & Identity 🔲 NOT STARTED
**Goal:** Build long-term identity and community feel across years.

### All-time standings
- Commissioner can import previous year data (CSV upload or manual entry)
- Schema stores historical picks + results per year
- All-time leaderboard: aggregate wins, podiums, appearances
- Head-to-head records between any two participants
- Year-over-year picks archive — browse any past year's full picks and results

### Commissioner-granted badges
- Commissioner can assign any badge to any participant from the admin panel
- Badge = short label + optional emoji/icon + tooltip description (e.g. "👑 Two-time Champ", "🏛 Founding Member")
- Badges appear next to participant name in standings; hover to see description
- Multiple badges supported per participant
- Examples: "Founding Member", "Defending Champ", "Two-time Champ", "Best Upset Pick"

### Auto-tags (subtle, system-generated)
Shown as small secondary label below name. Based on pick history:
- **"The Safe Bettor"** — avg golfer odds in top 20% across entries
- **"The Gambler"** — avg golfer odds in bottom 20% (loves longshots)
- **"The Contrarian"** — consistently picks low-ownership golfers
- **"The Streaker"** — same top-3 picks two years in a row
- **"Augusta Expert"** — picks have consistently outperformed odds at Augusta specifically
- **"Tier Hopper"** — picks spread evenly across all 9 tiers
- **"Big Dog Rider"** — always heavy on T1/T2 picks
- First year: auto-tag is just "New to the Pool" or withheld until year 2

### Achievements (unlockable badges)
- "First Pick" — submitted first ever picks
- "3-Peat" — won 3 consecutive years
- "Upset King" — picked a winner with 150:1+ odds
- "Perfect Score" — all 4 counting golfers finished top 10
- "Cut Proof" — none of your 9 picks missed the cut
- "Bold Caller" — picked a 100:1 golfer who made top 5

---

## Phase 13: Side Games 🔲 NOT STARTED
**Goal:** Optional bonus games that add stakes and engagement throughout the week.

### Default supported side games (commissioners can enable/disable each)
| Game | How it works | Scoring |
|------|-------------|---------|
| **Day 1 Leader** | Pick the golfer leading after Round 1 | Bonus points or side pot |
| **Day 2 Leader** | Pick the golfer leading after Round 2 | Same |
| **Made the Cut** | Pick 3 golfers you think make the cut | 1pt per correct pick |
| **Missed the Cut** | Pick 1 golfer you think misses the cut | Bonus points if correct |
| **Weekend Winner** | Pick who wins R3 (low round of the day) | Bonus points |
| **Final Champion** | Standalone pick of tournament winner (separate from main picks) | Separate prize |
| **Closest to Score** | Pick the winning total score (e.g. -15) | Closest wins tie-break prize |

### UI notes
- Side games are shown in a separate "Side Games" tab or section, not mixed with main standings
- Commissioner enables them during pool setup (add to wizard step)
- Each side game has its own mini-leaderboard
- Side game picks have their own lock deadline (typically same as main picks)

---

## Phase 14: Social, Sharing & Referrals 🔲 NOT STARTED
**Goal:** Organic growth through sharing and referral incentives.

### League message board
- Rich text (markdown) posts — commissioner pinned announcements + member posts
- Nested comments (one level deep)
- Emoji reactions on posts
- Post notifications (opt-in)
- Rendered in a "League Chat" tab on the pool page

### Social sharing cards
- OG image generation (via `@vercel/og`) for:
  - Your picks (pre-lock): "I'm in the pool! See you at Augusta. 🌿"
  - Your standings position (post-lock): "Currently #1 with -18 in Masters Madness"
  - Tournament complete: "I finished 2nd in Masters Madness 2026 🏆"
- Share to Twitter/X, Slack, iMessage with generated card image

### Referral system
- Every user gets a unique referral link: `mastersmadness.com?ref=will`
- When someone creates a pool via your link: you get credited as referrer
- **Founding member offer**: "Sign up now — pools are free during beta. Founding members get free pools forever when we eventually charge."
  - Planned future pricing: ~$5/pool creation
  - Founding members (signed up before Apr 9, 2026) are locked in free for life
  - This is surfaced prominently on the marketing page and in the signup flow

---

## Phase 15: Commissioner Dashboard 🔲 NOT STARTED
**Goal:** Give pool commissioners full control over their pool without needing to contact support. Accessible at `/pool/[slug]/commissioner` — only visible to members with `role = "commissioner"`.

### Layout
- Dedicated `/pool/[slug]/commissioner` route, linked via a "Commissioner Tools" button in the pool nav (only shown to commissioners)
- Tabbed layout: **Overview · Picks · Members · Notifications · Customize · Settings**

---

### Tab 1: Overview
- Pool health snapshot — entries submitted vs. expected, % paid, days until lock
- Recent activity feed — "Will A. submitted picks", "Jane edited picks", "Payment marked for Bob"
- Quick-action buttons: Announce to Pool, Extend Deadline, Preview Post-Lock View
- Commissioner demo mode toggle (same "Preview Post-Lock" amber banner as exists today)

---

### Tab 2: Picks Management
**Core: manually modify picks after lock**
- Full table of all participants × their picks — shows all 9 picks per row, submission timestamp, locked/unlocked status
- **Edit any pick** — click a participant row → inline tier-by-tier picker opens (same UI as My Picks page) → save with required "reason" text field → logged with `entered_by: commissioner_id + timestamp + reason`
- **Enter picks on behalf of participant** — same flow; logs "Entered by [Commissioner Name]" note visible to that participant
- **Lock override** — unlock a specific entry past deadline; requires confirmation modal + reason; auto-logged
- **Bulk autopick** — select participants who haven't submitted → assign "Highest Odds", "Random", or "Commissioner's Default Lineup" in bulk
- **Commissioner's Default Lineup** — commissioner can set a saved lineup that becomes the autopick template for their pool
- **Audit trail** — collapsible per-entry history showing all changes with timestamps, actor, and reason

---

### Tab 3: Member Management
- Table of all pool members with columns: Name, Entry Status, Payment Status, Tags/Badges, Joined Date
- **Invite members** — enter email addresses (comma-separated) → send invite email with pool link
- **Remove member** — confirmation modal; option to refund-flag their payment
- **Merge duplicate accounts** — detect and manually merge two accounts into one entry
- **Payment column**: toggle paid/unpaid per member; shows running "X of Y paid" summary
- **Waitlist** — toggle cap (max entries); overflow goes to waitlist; commissioner can approve/deny waitlisted members; notify when spot opens

---

### Tab 4: Notifications (Send Emails)
**Core: send custom emails/notifications to pool members**
- **Compose announcement** — rich text editor (bold, italic, links, emoji); preview before send
- **Recipient scope**: All Members · Unpaid Only · Haven't Submitted Picks · Custom selection (checkboxes)
- **Channel**: Email only (in-app notifications Phase 14 territory)
- **Quick templates** (one-click fill):
  - "Picks lock in 24 hours — submit now!"
  - "Picks are locked — tournament starts [date]"
  - "Score update — current standings as of [date]"
  - "Winner announced — congrats to [name]!"
  - "Payment reminder — please pay your entry fee"
  - "Custom announcement" (blank)
- **Send history** — table of past sends with subject, recipients, sent-at timestamp, and open rate (if Resend provides it)
- **Scheduled sends** — set a future date/time for a notification (e.g. schedule the "good luck" email for Apr 8)

---

### Tab 5: Customize (Home Screen)
**Core: edit text and badges on the pool home screen**

#### Welcome Message
- Rich text editor → saved as `pools.config.welcome_message`
- Displayed pinned above standings table for all pool members
- Supports bold, italic, emoji, and URLs
- Character limit: 500; preview renders in-line

#### Participant Tags / Badges
- Full member list with current tags shown per row
- **Add tag to participant**: click "Add Tag" → tag editor modal:
  - Choose from pre-built templates OR create custom:
    - Pre-built: 🏆 Defending Champ · 👑 Two-time Champ · 🌿 Founding Member · 🎯 Bold Caller · 🔥 On a Streak · 🐣 Pool Rookie · 💀 Never Won · 😤 Always Second · 🎲 The Gambler · 🧲 Fan Fav
  - Custom tag: label text + emoji picker + optional tooltip description
  - Color: Green / Gold / Blue / Red / Gray (maps to Tailwind badge color classes)
- **Multiple tags per participant** — shown as stacked pills in standings
- **Remove tag** — click × on any tag pill to remove
- Tags stored in `badges` table (`pool_id, user_id, label, emoji, description, granted_by, granted_at`)
- Tags appear next to participant name in standings rows (collapsed + expanded view)

#### Stat Tile Picker
- Drag-and-drop reorder of the top stat tiles row
- Toggle tiles on/off: Prize Pool · Entry Count · Days Until Lock · Top Score · Your Rank · % Paid · Countdown · Custom Metric
- Custom metric tile: commissioner defines label + value (e.g. "Defending Champ: Will A.")
- Tile row density: 2 / 3 / 4 columns

---

### Tab 6: Pool Settings
- Edit pool name, description
- Move the picks lock deadline (forward or backward); auto-sends notification to all members if moved within 48h
- Scoring rules summary (read-only here; edit via re-run of wizard in future)
- Toggle side games on/off per game type
- Pool visibility: Public (listed in directory) / Unlisted (link-only) / Private (invite-only)
- **Danger zone**: Archive pool (read-only), Delete pool (requires typing pool name to confirm)

---

### Files (planned)
- `src/app/pool/[slug]/commissioner/page.tsx` — tab shell + auth guard
- `src/components/commissioner/picks-editor.tsx` — inline picks modification with audit trail
- `src/components/commissioner/member-table.tsx` — member management + payment toggles
- `src/components/commissioner/notification-composer.tsx` — rich text + template system + send history
- `src/components/commissioner/badge-editor.tsx` — tag assignment with pre-built + custom tag support
- `src/components/commissioner/customize-panel.tsx` — welcome message + stat tile picker
- `src/lib/db/commissioner.ts` — typed helpers for all commissioner mutations

---

## Phase 16: Self-Service Pools & Discovery 🟡 PARTIALLY DONE
- [x] Pool creation wizard (`/pool/create`) — 5 steps, configurable rules
- [x] Shareable pool URL (`/pool/[slug]`) — public standings + join CTA
- [ ] Pool invite system — unique invite link with optional password
- [ ] **Multi-pool support** — user can belong to multiple pools simultaneously
  - Pool switcher in the **top-left of the navbar/app shell** — dropdown or pill toggle showing current pool name with chevron
  - Lists all pools the user belongs to (commissioner or participant)
  - "Create a new pool" option at the bottom of the switcher
  - Active pool context persists across page navigation (stored in URL param or local state)
  - Badge on switcher showing count of pools user is in (if > 1)
- [ ] Public pool directory — browse publicly listed pools; join with one click
- [ ] Pool templates marketplace — fork another commissioner's rule set
- [ ] Embeddable standings widget — `<iframe>` snippet for embedding on any site
- [ ] Spectator mode — non-participant read-only access via public link

---

## Phase 17: Database & Supabase Integration 🟡 PARTIALLY DONE

### Schema
```sql
pools              -- id, slug, name, config (json), created_by, created_at, state (pre_lock|post_lock|in_progress|complete)
pool_members       -- pool_id, user_id, role, joined_at, paid, badges (json array)
picks              -- pool_id, user_id, golfer_picks (json), submitted_at, locked, entered_by (admin override)
golfers            -- id, name, country, tier, odds, world_rank, ...
scores             -- golfer_id, round, score, total, position, is_cut
odds_snapshots     -- golfer_id, odds, rank, captured_at
side_game_picks    -- pool_id, user_id, game_type, pick_value, submitted_at
notification_prefs -- pool_id, user_id, preferences (json)
historical_results -- pool_id, year, user_id, rank, total_score, picks (json)
badges             -- pool_id, user_id, label, emoji, description, granted_by, granted_at
```

### Files
- [x] `src/lib/supabase.ts` — client + service role setup
- [x] `src/lib/db/pools.ts` — pool CRUD + member helpers
- [x] `src/lib/db/picks.ts` — picks upsert, lock, query
- [x] `src/lib/db/golfers.ts` — golfer queries by tier/name
- [x] `src/lib/db/scores.ts` — score upsert + leaderboard
- [x] `src/lib/db/index.ts` — barrel export
- [x] `supabase/migrations/001_initial.sql` — full schema + RLS
- [ ] Run migration in Supabase dashboard (needs real keys)
- [ ] Row-level security verified in production

---

## Phase 18: DNS & Vercel Deployment 🔲 NOT STARTED
- [ ] Push to GitHub main, connect Vercel project
- [ ] Add production env vars (Clerk prod keys, Supabase prod URL/key, Resend API key)
- [ ] Configure Vercel domain: `mastersmadness.com` + `www.mastersmadness.com`
  - A record → `76.76.21.21` (Vercel)
  - CNAME `www` → `cname.vercel-dns.com`
- [ ] Remove existing URL forwarding at registrar
- [ ] Update Clerk allowed origins for production domain
- [ ] Vercel cron job for score polling during tournament week (Apr 9–12)
- [ ] SSL auto-provisioned by Vercel

---

## Phase 19: Polish & Launch 🟡 IN PROGRESS

### Tab rename
- [x] Rename `Analytics` tab/nav item → **"Pool Analytics"** everywhere (navbar, page titles)

### iPhone & Mobile Optimizations
**Goal:** The app should feel native and polished on iPhone Safari. Target: 375px (iPhone SE) through 430px (iPhone 15 Pro Max).

- [x] **Navbar** — hamburger menu collapses all nav links on mobile; 48px min-height touch targets; active states; safe area padding on bottom
- [x] **Standings table** — horizontal scroll on small screens; hide "Move" column on mobile (movement shown inline next to name); responsive padding/text sizes
- [x] **Participant picks expansion** — golfer card grid reflows to 1-column on mobile; stat bar stacks vertically with divide-y; responsive padding
- [x] **Research page** — player table horizontally scrollable (min-w-[560px] + overflow-x-auto); group tag filter mode added (Tiers/Groups toggle with 8 group pills); filter pills wrap cleanly
- [x] **Rules page** — scoring visualizer mobile: reduced row padding (px-2.5 sm:px-4), smaller gaps, text-xs player name on mobile, "Counting/Bench" label hidden on mobile (sm:inline)
- [ ] **Pool creation wizard** — multi-step form tested and usable on mobile keyboard/viewport
- [x] **Typography** — minimum 16px on inputs to prevent iOS zoom; heading sizes scale down via sm: breakpoints
- [x] **Touch targets** — all interactive elements ≥ 44×44px (iOS HIG) in navbar, standings rows, buttons
- [x] **Safe area insets** — viewport-fit=cover meta tag; env(safe-area-inset-*) on body and mobile menu
- [ ] **Payment banner** — gold banner stacks gracefully, payment buttons are full-width on mobile
- [ ] **Pool switcher** — full-width dropdown sheet on mobile (bottom sheet pattern)
- [ ] Verify on real devices: iPhone SE (375px), iPhone 15 (393px), iPhone 15 Pro Max (430px), iOS Safari

- [ ] End-to-end testing (sign up → picks → standings flow)
- [ ] Lighthouse ≥ 90 on all key pages
- [ ] Mobile testing on real devices (iOS Safari, Android Chrome)
- [ ] SEO: meta tags, OG images, sitemap
- [ ] Graceful error pages + loading states
- [ ] Vercel Analytics
- [ ] Beta test with small group (founding members)
- [ ] **Launch** 🚀 before Apr 9, 2026

---

## Phase 20: Admin Portal (admin.mastersmadness.com) 🔲 NOT STARTED
**Goal:** A separate, locked-down super-admin panel for platform owners (Will + co-founder only). Accessible at the `admin.mastersmadness.com` subdomain. No regular users ever see this.

### Access control
- Hardcoded allowlist of Clerk user IDs in env vars (`ADMIN_USER_IDS=clerk_xxx,clerk_yyy`)
- Middleware on the `admin.` subdomain checks Clerk session against allowlist; all other requests → 403
- No "admin" role in the main app — this is entirely separate from the commissioner role
- Consider IP allowlist as second layer (Vercel Edge Config or middleware)

### Routing
- Next.js multi-domain routing via `next.config.ts` hostname rewrites
- All routes under `admin.mastersmadness.com/*` map to `src/app/admin/` directory
- Separate layout with minimal nav — no public-facing design; utility-first

---

### Page 1: Dashboard (Home)
- **Platform health tiles**: Total pools, Total users, Picks submitted (this year), Active pools (in-progress), Emails sent (last 7d), Sign-ups (last 7d)
- **Recent activity feed**: Last 20 platform events — new pool created, new user signed up, picks submitted, commissioner override logged
- **Tournament status widget**: Current Masters leaderboard status, scoring API health (green/red), last score sync timestamp
- **Key dates reminder**: Days until lock, days until tournament, days until finals

---

### Page 2: Users
- Searchable, sortable table of all Clerk users
- Columns: Name, Email, Sign-up Date, Pools (count), Role Override, Last Active, Founding Member status
- **Per-user actions**:
  - **Impersonate** — "View as this user" button → opens a new tab with the app loaded as that user (for debugging; session isolated)
  - **Grant founding member** — toggle that locks them into free-for-life status; logged
  - **Revoke founding member** — with reason; logged
  - **Suspend account** — blocks sign-in; shows "account suspended" on login
  - **Delete account** — requires typing email to confirm; cascades to pool membership removal
- Export user list as CSV

---

### Page 3: Pools
- All pools across the platform, sortable by created date / state / entry count
- Columns: Pool Name, Slug, Commissioner, Entries, State, Created At, Founding Member pool (yes/no)
- **Per-pool actions**:
  - **View as commissioner** — opens `/pool/[slug]/commissioner` signed in as an admin proxy (no impersonation needed)
  - **View public page** — opens `/pool/[slug]`
  - **Force archive** — mark pool as archived (e.g. spam/abuse)
  - **Delete pool** — hard delete with confirmation
- Pool state filter pills: All · Pre-Lock · Post-Lock · In Progress · Complete · Archived
- Export pool list as CSV

---

### Page 4: Notifications (Platform-Wide)
- **Compose broadcast** — rich text email to ALL platform users, or filtered segments:
  - Founding members only
  - Commissioners only
  - Users who haven't submitted picks yet (requires pool context)
  - All users signed up after a date
- **Templates**: Maintenance notice, Feature announcement, Tournament launch, Season recap
- **Send history**: Table of all platform-level emails with subject, segment, sent-at, delivery stats from Resend
- **Founding member sequence**: Pre-configured onboarding email drip for new founding members (trigger on sign-up if before Apr 9, 2026)

---

### Page 5: Scoring & Data
- **Scoring API health**: Live status of the Masters score ingestion pipeline — last run timestamp, last error, retry count
- **Manual score override**: Search for any golfer → override their current round score with a reason note; resets on next successful API sync unless "pin override" is toggled
- **Golfer database management**: View all golfers in DB, edit tier assignments, odds, country; bulk import via CSV
- **Odds snapshots**: Timeline of when odds were captured; view any historical snapshot
- **Sync controls**: "Force sync now" button (runs score ingestion job immediately); useful during tournament week

---

### Page 6: Feature Flags
- Toggle platform features on/off without deploying:
  - `picks_open` — globally allow/disallow pick submission
  - `analytics_unlocked` — force-unlock analytics for all pools
  - `payment_banner_enabled` — show/hide payment pending banners globally
  - `founding_member_offer_active` — show/hide founding member marketing copy
  - `side_games_enabled` — globally enable/disable side games
  - `pool_creation_enabled` — prevent new pool creation (e.g. maintenance)
- Per-user overrides: enable a flag for a specific user ID (for beta testing features with select users)
- Flags stored in Supabase `feature_flags` table; read at edge via middleware

---

### Page 7: Audit Log
- Immutable, append-only log of all consequential actions across the platform:
  - Commissioner overriding picks (who, for whom, what changed, reason)
  - Admin impersonating a user
  - Admin granting/revoking founding member status
  - Pick lock deadline changes
  - Platform broadcast emails sent
  - Feature flag changes
  - Pool deletions / account suspensions
- Filter by: date range, actor, action type, pool
- Export as CSV for compliance/record-keeping

---

### Page 8: Founding Members
- Dedicated view of all founding members (signed up before Apr 9, 2026)
- Columns: Name, Email, Sign-up Date, Pools Created, Referrals
- Grant/revoke founding member status manually
- Export list (for "free for life" benefit tracking when monetization launches)
- Summary stats: total founding members, % who've created a pool, avg pools per founding member

---

### Schema additions
```sql
feature_flags    -- key, enabled (bool), updated_by, updated_at, per_user_overrides (json)
audit_log        -- id, actor_id, action, target_type, target_id, payload (json), created_at
founding_members -- user_id, granted_at, granted_by, revoked_at (nullable)
```

### Files (planned)
- `src/app/admin/layout.tsx` — admin shell + allowlist auth guard
- `src/app/admin/page.tsx` — platform dashboard
- `src/app/admin/users/page.tsx` — user management
- `src/app/admin/pools/page.tsx` — pool directory
- `src/app/admin/notifications/page.tsx` — broadcast composer + history
- `src/app/admin/scoring/page.tsx` — API health + manual overrides
- `src/app/admin/flags/page.tsx` — feature flag management
- `src/app/admin/audit/page.tsx` — audit log
- `src/app/admin/founding-members/page.tsx` — founding member registry
- `src/middleware.ts` — extend to handle admin subdomain routing + allowlist check
- `src/lib/db/admin.ts` — audit log writes, feature flag reads/writes, founding member helpers

---

## Deferred / Not This Year
- Mobile app (React Native / Expo)
- Dark mode toggle
- Internationalization
- PWA / offline mode
- Accessibility audit (WCAG 2.1)
- Live hole-by-hole scoring detail
- In-app push notifications (web push)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth | Clerk (`@clerk/nextjs@latest`) |
| Database | Supabase (PostgreSQL + Realtime) |
| Email | Resend + React Email |
| Deployment | Vercel |
| Domain | mastersmadness.com |
| UI Components | 21st.dev Magic MCP (`ui-ux-pro-max` skill) |
| Icons | Lucide React |
| OG Images | `@vercel/og` |

---

## Key Dates

| Date | Milestone |
|------|-----------|
| 2026-04-09 | Masters Tournament begins — picks lock at 5am MT |
| 2026-04-12 | Final round |
| 2026-03-16 | Today — 24 days until lock |
| Before Apr 9 | Founding member window closes (free-for-life referral offer) |

---

## Session Log

| Date | What Was Done |
|------|---------------|
| 2026-03-15 | Created branch, set up `ui-ux-pro-max` skill + Magic MCP, generated design system, scaffolded Next.js 15 + Clerk + Tailwind, built all 6 pages with full design system, defined TypeScript data model |
| 2026-03-16 | Built Research page (sortable player table, hover cards via React portal, scouting reports), Rules page (interactive scoring visualizer), Pool Creation wizard (5-step), Pool Slug page, `StartPoolButton`, expandable standings. Fixed Clerk API deprecation, renamed middleware, added utility functions. Fixed font readability and hover card transparency. Full feature audit against ESPN/CBS/Yahoo Fantasy — 60+ features documented. Detailed 19-phase roadmap with user-specified feature requirements. |
| 2026-03-16 (cont.) | **Phase 4**: Built participant picks expansion — click-to-expand standings rows showing 9 golfer picks grouped by status (counting/bench/cut). Added stat bar (pool score, proj. finish, top-3%, top-10%), golfer chips in collapsed row, left-accent card styling, staggered animations. Created mock picks data for 15 participants. Updated middleware with public route matcher. Applied `ui-ux-pro-max` design polish (21st.dev-inspired stat bar with dividers, accent stripes, section labels). |
| 2026-03-16 (cont.) | **Phase 4 complete + Phase 19 started**: Added score trajectory sparklines (custom SVG) to each golfer card showing cumulative score over rounds played. Added What-If Mode toggle UI with swap badges on golfer cards and info banner. Renamed Analytics → "Pool Analytics" in navbar + page title. **Mobile optimizations**: viewport-fit=cover + safe area insets, 16px min input font size (no iOS zoom), 48px touch targets in navbar/mobile menu, standings table hides Move column on mobile (shows inline), stat bar divides vertically on mobile, responsive padding/text sizing throughout, countdown scales down for small screens. |
| 2026-03-16 (cont.) | **Phase 7 progress**: Built watchlist feature — `useWatchlist()` hook with localStorage persistence, star icons on each player row in Research tab, watchlist filter toggle button with count badge. Built full My Picks page — tier-by-tier selection with sidebar lineup summary, progress bar, integrated scouting reports (same bull/bear case + stats from Research tab), watchlist integration, navigation between tiers, submit flow. Added custom tier support to pool creation wizard — "By Odds" vs "Custom Groups" mode toggle, custom group naming/description inputs, add/remove groups, validation. Updated Review step to show custom tier details. |
| 2026-03-16 (cont.) | **Pool creation wizard full redesign** (3 rounds): (1) Removed mode toggle — always defaults to odds-based tiers. Added "Players Per Tier" slider (equal distribution). Write-in catch-all tier (toggleable). Bonus Groups section with 8 pre-built template pills (International, Left-Handed, Past Champions, Amateurs, 35+ Year Olds, First-Timers, Fan Favorites, European Tour) — each pill shows auto-populated player count e.g. "🏆 Past Champions (7)". (2) Unified Group Preview grid showing all groups (tiers + bonus groups + write-in) with player counts; click any group to preview players with country flag, name, odds, and "moved" badge for overridden players. (3) Advanced Setup collapsible section — all groups with player pills; click a player → move-to dropdown to reassign them to any other group; "Reset to default" per player and "Reset all overrides" button. `groupOverrides: Record<string, string>` type tracks manual reassignments. `computeAssignments(config)` function (memoized) merges auto-categorization with overrides to produce final group assignments. Auto-categorization engine: International (non-US by country emoji), Past Champions (bestMastersFinish includes "Won"), Left-Handed (hardcoded list), 35+ Year Olds (hardcoded list), First-Timers (mastersAppearances ≤ 2), Fan Favorites (hardcoded list), European Tour (European country emojis). No player ever appears in two groups — bonus groups claim players first, remaining fill tiers. |
| 2026-03-16 (cont.) | **Phase 5 complete**: Full marketing landing page at `/` — 8 sections: Hero (green gradient, mock standings card, pulsing Live badge, CTAs), Social Proof strip (stats on masters-green bg), How It Works (4-step with numbered circles + connecting line), Features Grid (6 cards with hover accent bars), Live Pool Preview (mock standings with golfer tier chips), Research Preview (3 player cards), Founding Members (gold gradient section, free-for-life offer), Final CTA. Server component, all links wired, mobile-first, TypeScript clean. |
| 2026-03-17 | **Phase 6 complete**: Pre/Post lock app states. `src/lib/pool-state.ts` — `PoolState` enum + derivation from deadline, `picksVisible()`, `analyticsUnlocked()`. `StandingsPreview` now state-aware — pre-lock shows participant list + "Submitted" badges only (no picks/scores), post-lock shows full table. `StandingsShell` client wrapper manages demo mode. `DemoModeBanner` commissioner-only component with "Preview Post-Lock" button and amber "DEMO MODE" banner. Standings page shows pool state badge ("Picks Open" amber dot) in hero. |
| 2026-03-17 (cont.) | **Phase 17 partial + Phase 4b complete + Phase 19 wizard mobile**: (1) `supabase/migrations/001_initial.sql` — full 9-table schema (pools, pool_members, picks, golfers, scores, odds_snapshots, side_game_picks, notification_prefs, historical_results, badges) with RLS policies, updated_at triggers, indexes. Ready to run once real Supabase keys are set. (2) `src/lib/db/pools.ts`, `picks.ts`, `golfers.ts`, `scores.ts`, `index.ts` — typed query helpers for all tables. (3) API route `/api/pools` updated to also insert creator as admin pool_member. (4) Wizard mobile: sticky nav footer (back/next always above keyboard), `overflow-visible` on step container (fixes z-50 dropdown clipping in Advanced Setup), step counter pill on mobile ("2 / 5"), `pb-24` on page to avoid content hiding behind sticky bar. |
| 2026-03-17 (cont.) | **Phase 11 complete — Advanced Analytics Dashboard**: Analytics shell with 3-tab pill selector (Metrics/Projections/Simulator), commissioner demo mode, pool-state gating. Built `PickOwnershipChart`, `TierCoverage`, `RiskMatrix`, `BoldPicks`, `AnalyticsStatsBar`, `ProjectionsTable`, `WhatIfSimulator`. Mock analytics data in `src/data/mock-analytics.ts`. Risk Matrix went through 3 iterations of axis/label corrections — final state: X = score (right = ahead/under par), Y = avg ownership (top = consensus). Quadrants: ↗ Consensus & Ahead, ↖ Consensus & Behind, ↘ Contrarian & Ahead, ↙ Contrarian & Behind. What-If Simulator initially built inside `participant-picks.tsx` (standings), then moved to standalone `what-if-simulator.tsx` in analytics tab. Projections table collapsed to top 5 with expand/collapse. |
| 2026-03-17 (cont.) | **Phase 2 core complete — Roles & Protected Routes**: Created `src/lib/auth.ts` with `isPlatformAdmin` (env var allowlist), `getUserPoolRole` (Supabase query with placeholder fallback), `isPoolCommissioner`, `requireAuth`, `requirePlatformAdmin`. Updated middleware with `createRouteMatcher` — `/picks` + `/analytics` require sign-in; `/pool/*/commissioner` requires sign-in; `/admin/*` + `admin.` subdomain require `ADMIN_USER_IDS` membership with rewrite support. Renamed pool role `"admin"` → `"commissioner"` in migration SQL, `db/pools.ts` type, and `api/pools` route. Replaced `isCommissioner = !!userId` placeholder in standings page with real `isPlatformAdmin` check. |
| 2026-03-17 (cont.) | **Phase 15 + Phase 20 documented**: Fully spec'd Commissioner Dashboard (Phase 15) — 6 tabs: Overview, Picks Management (post-lock pick editing with audit trail), Member Management, Notifications (email composer + templates + scheduled sends), Customize (welcome message + participant tags/badges with pre-built + custom), Pool Settings. Added Phase 20 Admin Portal (admin.mastersmadness.com) — 8 pages: Dashboard, Users (impersonation, founding member grants, suspend/delete), Pools directory, Platform Notifications, Scoring & Data health, Feature Flags, Audit Log, Founding Members registry. Schema additions: `feature_flags`, `audit_log`, `founding_members`. |
| 2026-03-16 (cont.) | **Phase 19 + Research group filters**: Research page — table wrapped in overflow-x-auto with min-w-[560px] for mobile scroll. Added Tiers/Groups filter mode toggle — Groups mode shows 8 group tag pills (Champ, LIV, Lefty, Rookie, 35+, Fan Fav, Euro Tour, Intl). Watchlist button moved to search row. Rules page scoring visualizer — reduced mobile padding (px-2.5), smaller gap, text-xs player name on mobile, "Counting/Bench" label hidden on mobile. |
| 2026-03-16 (cont.) | **Wizard polish + bug fixes + bonus group tags + research deep-links**: (1) Fixed double-dropdown bug — rewrote `computeAssignments()` with clean two-pass algorithm using `claimedByBonus` set; first bonus group added wins when a player qualifies for multiple (e.g. Rory = International OR European Tour, not both). (2) Added 💰 LIV Tour bonus group template with `LIV_TOUR_PLAYERS` list (Koepka, Cameron Smith, DJ, Mickelson, Niemann, Rahm, DeChambeau, Hatton, Garcia, Reed). (3) Added `picksPerGroup: number` (1–3) to `PoolConfig` — new slider in Step 3 (Scoring Rules); total picks = `numGroups × picksPerGroup`; "best N of total" slider max updates dynamically; Review step shows it when > 1; Tier Config summary bar shows breakdown. (4) Sliders redesigned — track `h-2.5`, thumb `size-5 border-2 border-[#025928]`, indicator `bg-[#025928]`, track bg `bg-[#025928]/15` for green tint; applied globally via `slider.tsx`. (5) Progress bar — track changed from `bg-muted` → `bg-stone-200`, height `h-2` → `h-3` for better contrast. (6) Created `src/lib/player-groups.ts` — shared `getPlayerGroupTags(player)` utility returning typed `GroupTag[]` with name, emoji, and Tailwind color classes. Tags: 🏆 Champ, 💰 LIV, 🤚 Lefty, ⭐ Rookie, 👴 35+, 🎉 Fan Fav, 🇪🇺 Euro Tour, 🌍 Intl. (7) Group tags rendered as colored pills next to player names in Research table rows, Research hover cards, and My Picks player cards. (8) Golfer name deep-links from standings → Research tab: `GolferChips` (collapsed row) and golfer name in `GolferCard` (expanded row) are now `<Link href="/research?player=Name">` with `e.stopPropagation()`. Research page made async, reads `searchParams.player`, passes as `initialPlayer` to `PlayerTable`. `PlayerTable` accepts `initialPlayer` prop — pre-fills search, auto-expands that player's scouting row, shows full field. |

---

## How to Resume

1. Open `ROADMAP.md` — check Session Log for last session
2. Check first unchecked item in the current phase
3. See `DESIGN-SYSTEM.md` for design tokens and component patterns
4. Dev server: `npm run dev` in `/masters-madness`

**Current stop point:** Phase 2 ✅ core complete. Phase 11 ✅ COMPLETE. Analytics dashboard fully built with 3 tabs (Metrics/Projections/Simulator), commissioner demo mode, Risk Matrix with correct axes (right=Ahead, top=Consensus), What-If Simulator, collapsible Projections Table.

**Wizard state summary** (`create-pool-wizard.tsx` Step 2 — Tier Configuration):
- `numTiers` slider (3–12), `playersPerTier` slider (2–8) → equal distribution, no mode toggle
- `customGroups: CustomGroup[]` — bonus groups added from template pills or from scratch
- `includeWriteIn: boolean` — catch-all tier for remaining players
- `groupOverrides: Record<string, string>` — `playerName → groupKey` for manual reassignments
- `computeAssignments(config)` (memoized) → `GroupAssignment[]` for the entire field
- Group Preview grid (click to expand) + Advanced Setup collapsible with move-to dropdowns
- `TOTAL_FIELD_SIZE = 90` constant

**Research filter state:** `filterMode: "tiers" | "groups"`, `groupFilter: string | null`. Tiers mode uses T1–T9 pills, Groups mode uses 8 group tag pills from `GROUP_FILTER_OPTIONS`.

**Analytics tab state summary** (`analytics-shell.tsx`):
- `poolState: PoolState` + `isCommissioner: boolean` passed from server component
- `isDemo: boolean` — client-only toggle, commissioner-only
- `activeTab: "metrics" | "projections" | "simulator"` — pill selector
- `picksVisible(poolState, isDemo)` controls whether dashboard renders or shows locked state
- Cameron Young: bull = "It's his freaking year", bear = "There is no Bear Case. Hammer Cam Young."

**Next session priorities:**
1. **Phase 17**: Connect real Supabase keys — run migration, verify RLS — unblocks picks saving, email, payments
2. **Phase 9**: Email notifications (Resend + React Email) — pick confirmation, deadline reminder, welcome
3. **Phase 10**: Payments — commissioner Venmo/PayPal links UI + payment pending gold banner
4. **Phase 8**: Live scoring integration — real tournament score ingestion
5. **Phase 15**: Commissioner Dashboard — start with Tab 4 (Notifications) + Tab 5 (Customize/tags)
6. **Phase 20**: Admin Portal — Users + Pools pages; `ADMIN_USER_IDS` env var needs real Clerk user IDs

**Known pre-existing issue:** `npx next build` shows `[PageNotFoundError: Cannot find module for page: /rules]` — unrelated to recent changes, needs investigation.
