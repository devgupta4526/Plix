# Build Prompt: Plix LinkHub + Product Auto-DM

Paste this whole document into Claude Code (or your agentic coding tool of choice) after cloning the repo. It has full context — you shouldn't need to re-explain the project.

---

## 0. Setup

```bash
git clone -b develop https://github.com/devgupta4526/Plix.git
cd Plix
npm install
cp .env.example .env   # fill in DATABASE_URL, CLERK keys, etc. if not already set
npx prisma generate
```

Work on a new branch: `git checkout -b feature/linkhub`.

---

## 1. Project context (read this before touching code)

**Plix** is an existing Next.js 14 (App Router) SaaS. Today it does one thing: Instagram DM/comment automation — user connects an Instagram account, sets up keyword-triggered auto-replies and auto-DMs, tracks post/DM engagement.

**Stack already in place — use it, don't introduce alternatives:**
- Next.js 14, App Router, TypeScript
- Prisma + PostgreSQL
- Clerk for auth (`@clerk/nextjs`) — `userId` from Clerk session already maps to `User.clerkId`
- Tailwind CSS + shadcn/ui + Radix primitives (`src/components/ui`)
- TanStack Query (`@tanstack/react-query`) for client-side data fetching
- react-hook-form + zod for forms/validation
- Stripe for billing, already wired to a `Subscription` model
- lucide-react for icons, sonner for toasts

**Existing route structure:**
```
src/app/
├── (auth)/sign-in, sign-up          — Clerk auth pages
├── (protected)/dashboard/[slug]/    — logged-in dashboard, [slug] = workspace/user slug
│   ├── automation/                  — existing automation builder
│   ├── integrations/                — Instagram connection
│   └── settings/
├── (protected)/api/                 — webhook + payment API routes
└── (website)/                       — public marketing pages
```

**Existing Prisma models** (don't modify these — only add new models and back-relations):
`User`, `Subscription`, `Integrations`, `Automation`, `Dms`, `Post`, `Listener`, `Trigger`, `Keyword`.

Server actions live in `src/actions/{domain}/` (e.g. `src/actions/automation/`) — follow this pattern for new domains (`src/actions/profile/`, `src/actions/products/`).

**Code conventions to match:**
- Server actions (`"use server"`) for mutations, not API routes, unless it's a webhook or external callback (matches existing `src/actions/*` pattern).
- Zod schemas for all form input, colocated with the action or in `src/types/`.
- Components: server components by default, `"use client"` only where you need interactivity (forms, drag-and-drop, live preview).
- Use existing `src/lib` utilities (check `src/lib/utils.ts` for `cn()` etc.) rather than adding new helper libs.
- Reuse existing shadcn components in `src/components/ui` before adding new ones; only pull in a new Radix primitive if nothing existing covers it.

---

## 2. What you're building

Two connected features, built in this order:

**A. LinkHub** — a Linktree-style public bio page (`plix.app/u/[username]`) that users build from a dashboard editor: profile info, an ordered list of links, a template/theme picker, basic click analytics.

**B. Product promotion + auto-DM** — users add products (image, price, promo link) that render as a "Shop" section on their LinkHub page. Optionally, adding a product can auto-provision an existing-style Automation (`Trigger` + `Keyword` + `Listener`) so commenting/DMing a keyword gets an auto-DM with the product link — this reuses the automation engine that already exists in the repo, don't build a parallel system.

Full data model, route list, and feature rationale are in the accompanying spec doc (`plix-linkhub-spec.md`) — treat that as the source of truth for schema/behavior; this prompt is the execution plan.

---

## 3. Phase-by-phase instructions

Work through phases in order. After each phase, run `npx prisma studio` or hit the routes manually to confirm before moving on — don't stack unverified phases.

### Phase 1 — Schema + core CRUD

1. Add to `prisma/schema.prisma`:
   - `Profile` model (userId, username unique, displayName, bio, avatarUrl, themeId, themeConfig Json?, published, views)
   - `Link` model (profileId, label, url, icon, position, active, clicks)
   - `Template` model (slug unique, name, previewUrl, config Json, isPremium, isPublic, createdBy, usageCount)
   - Add `profile Profile?` back-relation on `User`
   - Run `npx prisma migrate dev --name add_linkhub_core`
2. Seed script (`prisma/seed.ts` or extend existing seed if present): insert 6 built-in `Template` rows with `createdBy: null` — `minimal-light`, `minimal-dark`, `gradient-wave`, `terminal`, `pastel-cards`, `bold-neon`. Each `config` JSON should define: `background` (solid/gradient value), `buttonStyle` (pill/square/outline), `fontFamily`, `textColor`, `accentColor`.
3. `src/actions/profile/` — server actions: `getOrCreateProfile()`, `updateProfile(data)`, `checkUsernameAvailable(username)`.
4. `src/actions/links/` — server actions: `createLink()`, `updateLink()`, `deleteLink()`, `reorderLinks(orderedIds: string[])`.
5. Dashboard page `src/app/(protected)/dashboard/[slug]/linkhub/page.tsx` — bare-bones first: list existing links, form to add a new one (label + URL, zod-validated), delete button. No drag-drop yet, no theming yet.
6. Public page `src/app/(website)/u/[username]/page.tsx` — server component, fetch `Profile` by username (404 if not found or `published: false`), render display name/bio/avatar and the links list as plain styled buttons (hardcode one look for now — theming comes in Phase 2). This route must work with **no auth** — verify by opening it in an incognito tab.

**Acceptance for Phase 1**: can create a profile, add/delete links from the dashboard, and see them live at `/u/<username>` in a separate unauthenticated browser session.

### Phase 2 — Templates + live preview

1. `src/actions/templates/` — `listTemplates()`, `applyTemplate(templateId)`, `updateThemeOverride(themeConfig)`.
2. Build a single `<PublicProfileRenderer>` component (`src/components/global/public-profile-renderer.tsx` or similar) that takes `Profile + Link[] + resolved template config (base config merged with themeConfig override)` and renders the page. This same component is used both on the real public page AND as the live preview in the editor — do not build two separate rendering paths.
3. Dashboard page `dashboard/[slug]/linkhub/design/page.tsx` — grid of template cards (use `previewUrl` if set, else render a tiny inline preview using the same renderer at small scale), click to apply. Below the grid: color pickers / font selector that write to `themeConfig` and update the live preview instantly (client state, debounced save).
4. Wire the editor page from Phase 1 to show `<PublicProfileRenderer>` live in a side panel as the user edits links/profile fields.

**Acceptance for Phase 2**: switching templates visibly changes the public page; overriding a color persists after refresh; live preview in the editor matches what's actually live.

### Phase 3 — Polish: reorder, avatar, publish toggle

1. Add drag-and-drop reordering to the links list (check if a DnD library is already a dependency before adding one — if not, `@dnd-kit/core` is the standard shadcn-compatible choice). On drop, call `reorderLinks()`.
2. Avatar upload: check whether the repo already has an upload integration (search for any existing image upload usage, e.g. around Instagram media). If none exists, add Vercel Blob (`@vercel/blob`) — it's the lowest-friction option for a Vercel-deployed Next.js app. Store the resulting URL in `Profile.avatarUrl`.
3. Auto-detect platform icon from URL host (instagram.com → Instagram icon, x.com/twitter.com → X icon, youtube.com → YouTube icon, github.com → GitHub icon, else generic link icon) — small lookup table, no external service needed.
4. `published` toggle on the profile editor — public page returns 404 while unpublished (already partially handled in Phase 1, just wire the UI toggle).
5. Username availability check on the profile setup form, debounced, using `checkUsernameAvailable()`.

**Acceptance for Phase 3**: reordering persists, avatar upload works end-to-end, unpublished profiles 404 publicly, username field shows real-time availability.

### Phase 4 — Analytics

1. `src/app/(protected)/api/analytics/click/route.ts` — POST endpoint, increments `Link.clicks` (and `Product.clicks` once Phase 6 exists). Called client-side (`navigator.sendBeacon` or fire-and-forget fetch) on link click from the public page, before the browser navigates away.
2. Increment `Profile.views` server-side on each public page load (careful: dedupe naive — simplest v1 is just increment on every load, refine later if needed).
3. `dashboard/[slug]/linkhub/analytics/page.tsx` — total views, per-link click counts sorted descending, simple bar chart using `recharts` (already a dependency).

**Acceptance for Phase 4**: clicking a link on the public page increments its count, visible on the analytics page after refresh.

### Phase 5 — Template marketplace

1. `src/actions/templates/publishTemplate()` — takes the current user's `themeConfig`, creates a new `Template` row with `createdBy: userId`, `isPublic: true`.
2. Public page `src/app/(website)/templates/page.tsx` — grid of all `isPublic: true` templates, using the same `<PublicProfileRenderer>` for tiny previews, sorted by `usageCount`. Click → apply-to-my-profile button (auth required; redirect to sign-in if not logged in, then apply).
3. Increment `usageCount` on `applyTemplate()`.

**Acceptance for Phase 5**: publishing a theme makes it show up at `/templates` for other accounts, and applying it from there works.

### Phase 6 — Product promotion + auto-DM

This is the phase that touches the *existing* automation models — read `src/actions/automation/` first to understand the current create-automation flow before writing this, so the provisioning code matches existing patterns rather than reinventing them.

1. Add `Product` model to schema (see spec doc §6.5 for exact fields) with `automationId String? @unique` relation to the existing `Automation` model. Migrate.
2. `src/actions/products/` — `createProduct()`, `updateProduct()`, `deleteProduct()`, `reorderProducts()`.
3. `dashboard/[slug]/products/page.tsx` — list/manage products, same card-list pattern as the links editor.
4. `dashboard/[slug]/products/new/page.tsx` — product form (name, description, image, price, promoUrl, ctaLabel). Below it, an "Enable Auto-DM" toggle that expands into:
   - Mode select: Comment-triggered / DM-triggered / Smart AI (reuses `LISTENERS` enum already in schema).
   - If comment-triggered: post picker (reuse whatever component the existing automation builder uses to pick an Instagram post) + keyword input.
   - If DM-triggered: just keyword input.
   - If Smart AI: a prompt/context textarea, pre-filled with the product name + description.
5. On submit with auto-DM enabled, the server action must, in one transaction: create the `Product`, create an `Automation` (name = product name), create the appropriate `Trigger`/`Keyword`/`Listener` rows matching what the existing automation creation flow does for the equivalent manual setup, then set `Product.automationId`. **Do not duplicate automation-execution logic** — the existing webhook/listener handler that processes incoming comments/DMs should work unmodified, since these are just normal `Automation` rows from its perspective.
6. Editing a product's `promoUrl` or enabling/disabling auto-DM after creation should update the linked `Automation`/`Listener` rows, not create duplicates — check for existing `automationId` before creating a new one.
7. Extend `<PublicProfileRenderer>` to render a "Shop" section from `Product[]` (image, name, price, CTA button) either above or below the links list. If a product has `autoDmEnabled` and a comment-triggered mode, the CTA text should be configurable to show "Comment '<keyword>' on my latest post 👇" instead of a direct link.
8. Extend the click-tracking endpoint from Phase 4 to also accept `productId` and increment `Product.clicks`.
9. Product analytics: on the product edit page, show `clicks` alongside the linked `Listener.dmCount`/`Listener.commentCount` (already tracked by the existing automation system) so the user sees direct-click vs. DM-conversion numbers together.

**Acceptance for Phase 6**: creating a product with auto-DM enabled produces a working automation indistinguishable (from the automation dashboard's perspective) from one created manually; the public page shows the product with the right CTA; editing the product updates the same automation rather than creating a second one.

### Phase 7 (stretch, do not start until 1–6 are solid)

Follow/social layer — new `Follow` model, notifications. Only build this if you actually have users asking for it. Flag it back rather than building speculatively.

---

## 4. Non-goals for this build

- Don't touch custom domains — path-based `/u/username` is the v1 URL scheme, full stop.
- Don't build multi-currency price logic for `Product.price` — it's a display string, not a number with currency conversion.
- Don't build a generic drag-and-drop page builder (arbitrary block positions, freeform layout) — links and products are two fixed, separately-ordered sections. Resist scope creep here.
- Don't refactor the existing Automation/Instagram webhook code while doing this — Phase 6 should be additive only.

## 5. Definition of done for the whole build

- `/u/<username>` loads with no auth, shows the right template, links, and shop section.
- Dashboard editor: profile, links (reorder/add/delete), templates (apply/customize/publish), products (create with optional auto-DM), analytics — all functional against a real Postgres DB via Prisma, no mocked data left in.
- A product created with comment-triggered auto-DM actually produces a working `Automation` that the existing Instagram webhook handler picks up and processes correctly — test this end-to-end against a real connected Instagram account if possible, or at minimum verify the DB rows match what a manually-created equivalent automation looks like.
- `npm run build` passes clean, no type errors.