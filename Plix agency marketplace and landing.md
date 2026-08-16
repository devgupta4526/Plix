# Plix — Agency Marketplace + Landing Page

Everything for the new work: the influencer↔brand marketplace and the public agency landing page. One document — spec first, build prompt at the end. Builds on top of the earlier LinkHub/product work already in the repo.

---

## Part 1: Influencer ↔ Brand Marketplace

This makes Plix a three-product platform:

```
Plix
├── Automations   (Instagram DM/comment automation)
├── LinkHub       (bio page + product/shop + auto-DM)
└── Marketplace   (new — connects influencers and brands, agency-mediated)
```

**Scope call**: based on *"we will reach out to brands on their behalf and vice versa"* — this is **agency-mediated**, not a self-serve instant-matching marketplace. Brands submit requirements, influencers build profiles, your team reviews/matches/reaches out manually. This is deliberately less engineering than a real-time matching algorithm, and it matches how these deals actually close — relationship-driven, not self-checkout. A fully automated match system can be v2 if volume ever demands it.

### 1.1 Data model

```prisma
model BrandRequest {
  id                  String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyName         String
  contactName         String
  contactEmail        String
  contactPhone        String?
  industry             String?
  budgetRange          String?          // display string, e.g. "$1k–5k"
  campaignGoals        String?          // free text: awareness / sales / app installs / launch...
  targetAudience       String?          // free text or structured Json later
  deliverables          String[]        // ["Reels", "Posts", "UGC", "Stories"]
  nicheNeeded           String[]        // ["Fashion", "Tech", "Fitness"]
  timeline              String?
  status                REQUESTSTATUS   @default(NEW)
  internalNotes         String?         // agency-only, never shown publicly
  createdAt             DateTime @default(now())
}

enum REQUESTSTATUS {
  NEW
  REVIEWING
  MATCHED
  IN_PROGRESS
  COMPLETED
  CLOSED
}

model InfluencerProfile {
  id                    String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  User                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId                String   @unique @db.Uuid

  niche                 String[]           // ["Fashion", "Tech"]
  platforms             Json               // [{ platform: "instagram", handle: "@x", followers: 12000 }, ...]
  avgEngagementRate     Float?
  audienceSummary       String?            // free text: age/gender/geo skew
  rateCard              Json?              // { reel: 500, post: 300, story: 150 }
  bio                   String?
  status                INFLUENCERSTATUS   @default(PENDING_REVIEW)

  createdAt             DateTime @default(now())
}

enum INFLUENCERSTATUS {
  PENDING_REVIEW   // submitted, agency hasn't approved yet
  APPROVED         // visible to agency for matching, not yet in an active campaign
  ACTIVE           // currently in at least one campaign
}

model Campaign {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  BrandRequest    BrandRequest @relation(fields: [brandRequestId], references: [id])
  brandRequestId  String   @db.Uuid

  title           String
  briefSummary    String?
  status          CAMPAIGNSTATUS @default(OPEN)
  matches         CampaignInfluencer[]

  createdAt       DateTime @default(now())
}

enum CAMPAIGNSTATUS {
  OPEN
  MATCHING
  ACTIVE
  COMPLETED
}

model CampaignInfluencer {
  id                    String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  Campaign              Campaign @relation(fields: [campaignId], references: [id])
  campaignId            String   @db.Uuid
  InfluencerProfile     InfluencerProfile @relation(fields: [influencerProfileId], references: [id])
  influencerProfileId   String   @db.Uuid

  status                MATCHSTATUS @default(PROPOSED)
  agreedRate            String?
  deliverables          String?

  createdAt             DateTime @default(now())
}

enum MATCHSTATUS {
  PROPOSED
  ACCEPTED
  DECLINED
  DELIVERED
  PAID
}
```

Add to the existing `User` model: `influencerProfile InfluencerProfile?` and `isAdmin Boolean @default(false)` — `isAdmin` is your (and any future team member's) flag for seeing the internal CRM dashboards. No full RBAC needed for one or two agency operators.

### 1.2 Routes

```
(website)/
├── for-brands/page.tsx        — pitch page + "Submit a campaign brief" form → creates BrandRequest, no login required
├── for-influencers/page.tsx   — pitch page + "Apply as a creator" CTA → Clerk sign-up → build InfluencerProfile
└── work/page.tsx               — public gallery (Part 2)

(protected)/dashboard/[slug]/
├── creator-profile/page.tsx    — influencer builds/edits their marketplace profile, sees campaign invites, accept/decline
└── agency/                     — isAdmin-only, redirect if not admin
    ├── brand-requests/page.tsx    — CRM list of incoming BrandRequests, status pipeline, internal notes
    ├── influencers/page.tsx       — review/approve pending InfluencerProfiles, browse by niche for matching
    └── campaigns/[id]/page.tsx    — create Campaign from a BrandRequest, propose influencer matches, track status
```

### 1.3 Flow

1. Brand fills out the public form on `/for-brands` → `BrandRequest` created, status `NEW`. Email notification to agency.
2. Influencer signs up, fills out `creator-profile` → `InfluencerProfile` created, status `PENDING_REVIEW`.
3. Agency reviews new influencer profiles in `agency/influencers`, flips to `APPROVED`.
4. Agency reviews a `BrandRequest`, creates a `Campaign` from it, browses approved influencers filtered by niche, proposes matches (`CampaignInfluencer`, status `PROPOSED`).
5. Influencer sees the proposal in their dashboard, accepts/declines.
6. Agency handles the actual brand-influencer introduction manually (email/call) — the product organizes the pipeline, it doesn't replace that relationship step in v1.

---

## Part 2: Landing Page

### 2.1 Positioning

The site does three jobs for two audiences: convince **brands** the agency can run their ads/content/social and that the influencer network is vetted; convince **influencers** to apply because the agency gets them deals they wouldn't land alone; and above all, feel **premium** — that's what separates this from another AI-SaaS template and makes brands trust it with real budget.

### 2.2 Visual direction — not the purple-gradient AI-slop look

The generic dark-navy/purple-gradient/glowing-blob/Inter-font look reads as cheap now precisely because every AI tool uses it. Going the opposite direction:

**"Ink & Ember"** (recommended):
- **Base**: near-black charcoal (`#0E0E10`) — warmer than pure black.
- **Text/light surfaces**: warm ivory/cream (`#F5F1E8`) — not pure white, avoids clinical feel.
- **Primary accent**: burnt terracotta/amber (`#C4622D`, hotter `#FF6B35` for CTAs) — warm, confident, unusual for tech, reads as "premium creative agency."
- **Secondary accent (sparingly)**: muted sage/olive (`#8A9A5B`) — tags, category chips, small UI details only.
- **Typography**: high-contrast editorial serif for headlines (Fraunces / Canela / GT Sectra-style) + clean grotesk for body (Inter / General Sans / Neue Montreal). Serif headline + grotesk body is the single biggest lever for "classy" vs. "SaaS template."

This palette reads as a design/creative agency, not an AI tool — the right instinct since the pitch is about creative + human relationships, not raw software.

*Alternative direction*, if you want more energy than editorial: near-black base + single electric lime/chartreuse accent (`#D4FF4F`) — punchier, more "we make scroll-stopping content," less boutique. Ink & Ember is the safer premium bet; worth a quick gut check between the two before committing.

### 2.3 Motion/tech approach

- **GSAP + ScrollTrigger** — section reveals, pinned sections (e.g. "How it works" steps scrub in while pinned), number count-ups.
- **Lenis** — smooth-scroll, syncs natively with GSAP ScrollTrigger; single biggest lever for a site feeling premium since it changes scroll physics.
- **React Three Fiber + drei** — one hero-level 3D element, not scattered around the page. Recommend an abstract generative form (e.g. thin extruded "cards"/ribbons suggesting content flow) in the terracotta/ivory palette — not another glass orb. Restrained, art-directed, well-lit reads as premium; busy shaders don't.
- **Framer Motion** — micro-interactions: magnetic CTA buttons, hover states, hero text stagger on load.
- **Performance/accessibility guardrails** (don't skip):
  - Lazy-load the Three.js canvas (`next/dynamic`, `ssr: false`).
  - Respect `prefers-reduced-motion` — static fallback, no scroll-jacking.
  - Skip the 3D canvas on mobile/low-end devices — static art-directed image instead. A laggy "premium" 3D site on phones is the opposite of premium.
  - Keep Lighthouse performance in mind — brands will judge you by how this page loads.

### 2.4 Sections

1. **Hero** — big serif headline, one-line subhead, two CTAs ("Work with us" / "Join as a creator"), 3D backdrop element (not blocking text).
2. **What we do** — 3–4 service pillars, scroll-revealed cards: ad creation, content/post production, social profile management, influencer matching.
3. **The Network** — sells the marketplace product itself; rotating/3D phone mockup of the creator-profile or matching UI, stat callouts (real numbers only, once you have them).
4. **Work / Gallery** — the proof, see §2.5.
5. **How it works** — tab/toggle: "For Brands" vs. "For Creators," pinned scroll section works well here.
6. **Social proof** — client logo marquee + 2–3 real testimonial quotes with a photo, not a generic 5-card carousel.
7. **Stats bar** — animated count-up on scroll-into-view. Placeholder-label until real data exists — don't fabricate metrics.
8. **CTA/contact** — two clear paths (brand form / creator application) or a booking embed.
9. **Footer** — same typography system as the rest of the page.

### 2.5 Gallery / portfolio model

```prisma
model PortfolioItem {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title         String
  clientName    String
  category      PORTFOLIO_CATEGORY
  mediaUrl      String              // image or video
  thumbnailUrl  String?
  description   String?
  externalLink  String?             // link to the live ad/post if public
  metrics       Json?               // { reach: "2.3M", engagement: "8.4%" } — only if real numbers exist
  featured      Boolean  @default(false)
  position      Int      @default(0)

  createdAt     DateTime @default(now())
}

enum PORTFOLIO_CATEGORY {
  AD
  SOCIAL_POST
  CAMPAIGN
  REEL
  BRAND_PROFILE
}
```

**UI**: masonry/filterable grid on `/work`, category filter chips (sage accent), hover-to-play video, click opens lightbox with `description`/`metrics`. Admin page (`agency/portfolio`) to add/reorder — same drag-reorder pattern as `Link`/`Product`. Only show `metrics` when real — a fabricated stat is worse than none; brands evaluating an agency check this.

### 2.6 Additional recommended features, ranked by actual impact

1. **Case studies, not just gallery tiles** (high value) — full pages for your 2–3 best items: brief, approach, creative, result. This is what actually convinces a brand to trust you with budget, far more than a pretty grid.
2. **Interactive campaign estimator** (high value, doubles as lead magnet) — brand picks goals/deliverables/niche, gets rough scope + "request exact quote" CTA, feeds straight into `BrandRequest`.
3. **Segmented intake form** (do regardless) — branch the brief form by goal/budget/timeline rather than one flat form — better CRM data, feels more considered to the brand.
4. **Creator spotlight** (medium) — a few featured `InfluencerProfile`s on the public site (with consent) — builds brand trust the network is real, gives influencers a reason to apply.
5. **Press/"as seen on" bar** (medium, only if true) — skip entirely if you don't have real mentions yet.
6. **Custom cursor + magnetic buttons** (nice-to-have polish) — cheap with Framer Motion, reinforces premium feel site-wide.
7. **Newsletter signup** (low priority, skip for v1) — only worth it if you'll actually publish regularly.

Build 1–3 before launch; the rest are post-launch polish.

---

## Part 3: Build Prompt

Paste into Claude Code (or your agentic tool) in the Plix repo, after the LinkHub/product work is merged. Same conventions as before: server actions in `src/actions/{domain}/`, shadcn/ui, zod, TanStack Query.

```bash
git checkout -b feature/agency-marketplace
```

### Phase 1 — Marketplace schema + admin flag
Add `BrandRequest`, `InfluencerProfile`, `Campaign`, `CampaignInfluencer` + enums (§1.1) to `prisma/schema.prisma`. Add `influencerProfile` relation and `isAdmin Boolean @default(false)` to `User`. Migrate (`npx prisma migrate dev --name add_marketplace`). Manually flip your own `User.isAdmin` to `true`. Add a `requireAdmin()` guard helper for `agency/*` routes.
**Acceptance**: migration applied, your account passes the guard, a second account doesn't.

### Phase 2 — Brand intake
`src/actions/marketplace/createBrandRequest()` (public, zod-validated, no auth). Build `/for-brands` as a **segmented/branching form** (step: goal → budget/timeline → deliverables/niche → contact), react-hook-form + zod per-step validation. On submit: create `BrandRequest` (`NEW`), send notification (check for existing email setup first; add Resend only if nothing exists). Real success state, not a dead redirect.
**Acceptance**: submitting creates a `BrandRequest` row and, if wired, a notification.

### Phase 3 — Influencer profile + application
`getOrCreateInfluencerProfile()`, `updateInfluencerProfile()`. `/for-influencers` pitch + CTA → Clerk sign-up → profile builder. `creator-profile` page: niche multi-select, repeatable platform/handle/follower fields, rate card, bio, status badge (read-only). Below it: list of `CampaignInfluencer` proposals with accept/decline.
**Acceptance**: profile saves as `PENDING_REVIEW`; proposals show with working accept/decline.

### Phase 4 — Agency CRM dashboard
All under `agency/*`, `requireAdmin()`-gated.
- `brand-requests/page.tsx` — filterable list, click-through to brief + internal notes (autosave) + "Create Campaign."
- `influencers/page.tsx` — filterable by niche/status, approve action for `PENDING_REVIEW`.
- `campaigns/[id]/page.tsx` — from a `BrandRequest`: brief, filterable approved-influencer list, "Propose" → `CampaignInfluencer` (`PROPOSED`), match list with manual status updates.
**Acceptance**: full flow works — new `BrandRequest` → `Campaign` → propose 2–3 matches → influencer sees and accepts → status reflects on both sides.

### Phase 5 — Portfolio/gallery model
Add `PortfolioItem` + `PORTFOLIO_CATEGORY` (§2.5), migrate. CRUD actions + `reorderPortfolioItems()`. Admin page (`agency/portfolio`) with drag-reorder, reusing the `Link`/`Product` pattern. Media upload reuses the LinkHub avatar upload setup.
**Acceptance**: admin can add an item with an image, ready to render publicly.

### Phase 6 — Landing page build
Read §2 in full before starting — don't build against default Tailwind colors and re-theme later.
1. Set "Ink & Ember" as Tailwind theme extensions; load the serif/grotesk pairing via `next/font`.
2. Install what's missing: `gsap`, `@gsap/react`, `lenis`, `three`, `@react-three/fiber`, `@react-three/drei`, `framer-motion`.
3. Wrap the landing layout with Lenis, synced to GSAP's ticker.
4. Build section components under `src/components/landing/`: `Hero.tsx` (3D element lazy-loaded, `ssr:false`, with reduced-motion + mobile fallback), `Services.tsx`, `NetworkPitch.tsx`, `Gallery.tsx` (pulls real `PortfolioItem`s, filter + lightbox), `HowItWorks.tsx` (pinned ScrollTrigger, tab toggle), `SocialProof.tsx`, `Stats.tsx`, `ContactCTA.tsx`.
5. Assemble in `(website)/page.tsx` — check whether this replaces an existing homepage or is net-new.
6. Case study pages: `(website)/work/[slug]/page.tsx` — extend `PortfolioItem` with `fullWriteup` and `resultsSummary` if the current fields are too thin.
7. Campaign estimator: client component, local state, ends by creating a pre-filled `BrandRequest` via the Phase 2 action.
**Acceptance**: fast load (check Lighthouse), 3D hero respects reduced-motion/mobile, gallery renders real data, estimator produces a real `BrandRequest`, palette visibly matches §2.2 — no default indigo/purple anywhere.

### Non-goals
- No fully automated instant-matching algorithm — matching stays admin-driven.
- No payments/escrow flow — `PAID` status is manual tracking, not a real payment system.
- No public self-serve browse page for brands to pick influencers directly — contradicts the agency-mediated model.
- Don't reskin the existing Automations/LinkHub dashboard to match the new palette in this pass — public site only, scope the dashboard restyle separately if wanted.

### Definition of done
- `/for-brands` and `/for-influencers` work end-to-end, real DB rows.
- Admin can run the full brand-request → campaign → matched-influencer flow.
- Landing page reflects Ink & Ember (not default dark-SaaS/purple), working 3D hero with real fallbacks, gallery/case-study/estimator sections live with real data.
- `npm run build` clean, no type errors, Lighthouse performance not tanked by the animation work (check throttled mobile, not just desktop).