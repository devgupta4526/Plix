# Plix "LinkHub" — Feature Spec

Adding a Linktree-style profile module to the existing Plix repo, living alongside the current Instagram DM automation product.

---

## 1. Where this fits in the repo

Plix today is a single-product SaaS: sign up with Clerk → connect Instagram → build automations. We're turning it into a **two-product platform** sharing one `User`, one auth system, one billing system:

```
Plix
├── Automations   (existing — Instagram DM/comment auto-reply)
└── LinkHub       (new — Linktree-style bio page)
```

Both products hang off the same `User`. A user can have automations, a LinkHub page, or both. This mirrors real multi-product tools (e.g. Beacons, later-stage Linktree) and gives you a natural upsell surface later ("connect your automations' Instagram to a link on your page").

No existing models change. Everything is additive.

---

## 2. Data model additions (Prisma)

```prisma
model User {
  // ...existing fields unchanged...
  profile      Profile?
}

model Profile {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  User          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        String    @unique @db.Uuid

  username      String    @unique          // public URL: plix.app/u/<username>
  displayName   String?
  bio           String?
  avatarUrl     String?
  themeId       String    @default("minimal-light")
  themeConfig   Json?                       // per-user overrides on top of the template (colors, font, button style)

  published     Boolean   @default(false)
  views         Int       @default(0)

  links         Link[]
  blocks        Block[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Link {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  Profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  profileId   String   @db.Uuid

  label       String
  url         String
  icon        String?               // lucide icon name or platform key (instagram, x, youtube, custom)
  position    Int      @default(0)  // drag-reorder
  active      Boolean  @default(true)
  clicks      Int      @default(0)

  createdAt   DateTime @default(now())
}

// Optional v1.5: non-link content blocks (embeds, text, image, product card)
model Block {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  Profile     Profile   @relation(fields: [profileId], references: [id], onDelete: Cascade)
  profileId   String    @db.Uuid

  type        BLOCKTYPE @default(TEXT)
  position    Int       @default(0)
  data        Json                    // shape depends on type

  createdAt   DateTime  @default(now())
}

model Template {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  slug          String   @unique       // "minimal-light", "gradient-wave", "terminal-dark"...
  name          String
  previewUrl    String?
  config        Json                   // default theme tokens: colors, font, button shape, background style
  isPremium     Boolean  @default(false)
  isPublic      Boolean  @default(true) // user-submitted templates, see §6
  createdBy     String?  @db.Uuid       // null = built-in template
  usageCount    Int      @default(0)

  createdAt     DateTime @default(now())
}

enum BLOCKTYPE {
  TEXT
  IMAGE
  EMBED
  PRODUCT
}
```

Notes:
- `Link.icon` maps to a small enum/lookup on the frontend so socials (Instagram, X, YouTube, TikTok, GitHub, etc.) get proper icons automatically, with a "custom link" fallback.
- `Profile.themeConfig` lets a user tweak a template (swap accent color) without forking it — `Template.config` is the base, `themeConfig` is the diff, merged at render time.
- `Template.createdBy` + `isPublic` is what enables "other users can follow this and integrate this" — see §6.

---

## 3. Routes / pages

Reusing the existing route groups:

```
src/app/
├── (protected)/dashboard/[slug]/
│   └── linkhub/
│       ├── page.tsx              # editor: links list, drag reorder, add/remove
│       ├── design/page.tsx       # theme picker + customize colors/fonts
│       ├── blocks/page.tsx       # (v1.5) add text/embed/product blocks
│       └── analytics/page.tsx    # views, per-link clicks, top referrers
│
├── (website)/
│   ├── u/[username]/page.tsx     # PUBLIC profile page — the actual "linktree"
│   └── templates/page.tsx        # PUBLIC gallery to browse/preview templates
│
└── (protected)/api/
    ├── profile/route.ts          # CRUD profile
    ├── links/route.ts            # CRUD + reorder links
    ├── templates/route.ts        # list/fetch templates, publish a custom one
    └── analytics/click/route.ts  # POST on public-page link click (increments Link.clicks)
```

`(website)` is already a route group for public/marketing pages in the repo, so `/u/[username]` and `/templates` slot in naturally without touching auth middleware.

**Public page (`/u/[username]`)** is server-rendered, no auth required, fetches `Profile` by username + its `Link`s + resolved `Template`, and renders using the template's component (see §4). This is the page people actually share — it needs to be fast (ISR or edge caching, since it'll get outside traffic, not just logged-in users).

---

## 4. Template system — how "templates" actually work

Two things to decide up front: **are templates styling-only, or full layout components?** Recommend a hybrid:

- **Tier 1 — Theme tokens (v1, do this first):** a template is just a JSON config — background (solid/gradient/image), button shape (pill/square/outline), font pairing, text color, accent color. One single `<PublicProfileRenderer>` component reads the config and renders links accordingly. This gets you 10+ visually distinct templates for almost no engineering cost, and lets user overrides (`themeConfig`) work trivially — it's just merging two JSON objects.

- **Tier 2 — Layout variants (v2, later):** a few templates change actual structure (avatar-centered vs. banner-style vs. grid-of-cards instead of stacked buttons). These need their own React component per layout, selected by `Template.slug`. Don't build this until Tier 1 has traction — it's where most of the engineering cost lives.

Start with ~6 Tier-1 built-in templates seeded in the DB: `minimal-light`, `minimal-dark`, `gradient-wave`, `terminal`, `pastel-cards`, `bold-neon`.

---

## 5. Editor UX

- Left: live preview of the public page (updates as you type — no save button needed for text/link edits, autosave with debounce).
- Right/below: 
  - Profile section: avatar upload, display name, bio (character-limited).
  - Links list: add link (label + URL, auto-detects platform for icon), drag-to-reorder (`position` field), toggle active/inactive without deleting, delete.
  - Design tab: template gallery grid → click to apply → color/font override controls appear below.
- "Publish" toggle: page is editable while `published = false` and only live at `/u/[username]` once true — lets users build before going live.
- Username availability check (debounced query against `Profile.username` unique constraint) during onboarding.

---

## 6. "So other users can follow this and integrate this app" — the two features you're describing

Worth splitting these into what they actually are, since they're different features:

**a) Template sharing/marketplace.** Any user's current design (Tier 1: just a JSON config) can be "published" as a public template with one click from their design tab. It shows up in `/templates` for others to preview and apply to their own page. `Template.usageCount` increments each time it's applied — gives creators a lightweight leaderboard/incentive. This is the natural viral loop: someone builds a nice-looking page → publishes their theme → others discover it via the gallery or via a "Used by X people · try this template" badge on public profile pages.

**b) "Follow"/social layer.** This is a bigger feature — it turns LinkHub from a static bio page into a mini social product (followers, maybe a feed of "who updated their links"). Recommend treating this as a v2/stretch feature rather than day-one scope: it needs its own `Follow` model, notification/email infra, and a reason for people to check back (which a static link page doesn't naturally give you). Suggest launching without it, watching whether people actually want to follow other *link pages* specifically, and adding it if there's signal — building follow/feed infra for a feature nobody uses is the classic way these builds stall out.

---

## 6.5 Product promotion + auto-DM

A common ask on Linktree-style pages: instead of just a link, someone wants to promote a **product** and have Instagram auto-send it via DM when people comment/ask about it. This is where LinkHub and the existing Automations engine plug into each other directly — no new automation logic needed, just a wizard that provisions the existing `Automation`/`Trigger`/`Keyword`/`Listener` records for you.

**New model:**

```prisma
model Product {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  Profile       Profile   @relation(fields: [profileId], references: [id], onDelete: Cascade)
  profileId     String    @db.Uuid

  name          String
  description   String?
  imageUrl      String?
  price         String?               // display string, e.g. "$29" / "₹999" — keep as string, no currency logic needed for v1
  promoUrl      String                // the actual product / affiliate link
  ctaLabel      String    @default("Get it")

  autoDmEnabled Boolean   @default(false)
  Automation    Automation? @relation(fields: [automationId], references: [id], onDelete: SetNull)
  automationId  String?   @unique @db.Uuid   // set when auto-DM wizard provisions an automation for this product

  position      Int       @default(0)
  active        Boolean   @default(true)
  clicks        Int       @default(0)

  createdAt     DateTime  @default(now())
}
```

Add the back-relation on the existing `Automation` model:
```prisma
model Automation {
  // ...existing fields unchanged...
  product   Product?
}
```

**How the wizard works** (`dashboard/[slug]/products/new`):
1. User fills in the product (name, image, price, promo link).
2. Toggles "Auto-DM this product." Two trigger modes, reusing what already exists in the schema:
   - **Comment-triggered**: pick an Instagram post, set a keyword (e.g. product name) — creates a `Trigger` + `Keyword` + `Listener` (type `MESSAGE`) whose `commentReply` is a generic "Sent you the link! 📩" and whose DM reply is the `promoUrl`.
   - **DM-triggered**: any DM containing the keyword gets an auto-reply with the product's `promoUrl` — same `Listener`, `listener: MESSAGE` path, no `Trigger` needed.
   - Optional: **Smart AI mode** (`listener: SMARTAI`, already in the schema) — instead of a canned reply, the AI listener is given the product name/description as context so it can answer follow-up questions naturally before sending the link.
3. Wizard creates the `Automation` row, links it via `Product.automationId`, and from then on editing the product's promo link or reply message updates the same underlying automation — user manages it from one place (the product card), not two.

**On the public LinkHub page:** products render as a "Shop" section (image, name, price, CTA button) above or below the links list. If `autoDmEnabled` is true, the CTA can either link out directly *or* show "Comment 'PRODUCTNAME' on my latest post to get this via DM" — configurable per product, since some creators want the comment-for-DM engagement play specifically (it's what drives comment volume for the Instagram algorithm) rather than just a click-out link.

**Analytics**: `Product.clicks` tracks direct CTA clicks the same way `Link.clicks` does; DM-driven conversions are already tracked by `Listener.dmCount` on the existing Automation model — no new tracking infra needed, just surface both numbers together on the product's analytics view.

Products don't require the auto-DM path at all — `autoDmEnabled: false` just gives you a plain product/shop card with an outbound link, no automation provisioned. The DM flow is opt-in on top of that.

---

## 7. Auth, billing, and reuse from the existing repo

- **Clerk**: already wired — `userId` from Clerk session maps straight to the existing `User.clerkId`. No new auth work.
- **Stripe**: reuse the existing `Subscription` model. Gate premium templates (`Template.isPremium`) and things like custom domains / removing "Made with Plix" branding / analytics history beyond 7 days behind the existing `PRO` plan — same pattern as gating automation features, just an added `if (subscription.plan === "PRO")` check in the templates and analytics routes.
- **Dashboard nav** (`src/components/global`, wherever the sidebar lives): add a top-level "LinkHub" item next to "Automations" so both products are visible from one dashboard — this is what makes it feel like one platform rather than a bolted-on side project.

---

## 8. Build order (recommended phases)

| Phase | Scope |
|---|---|
| **1. Data + editor core** | Prisma migration (`Profile`, `Link`, `Template` seeded), CRUD API routes, basic editor page (no drag-drop yet, just add/remove/edit links), one hardcoded template rendered on `/u/[username]` |
| **2. Design system** | Seed 6 Tier-1 templates, template picker UI, `themeConfig` override controls, live preview pane |
| **3. Polish + reorder** | Drag-to-reorder links, avatar upload (reuse whatever upload approach exists, or add S3/Vercel Blob), icon auto-detection, publish/unpublish toggle, username availability check |
| **4. Analytics** | Click tracking on public page → `Link.clicks`, `Profile.views`, simple analytics dashboard page |
| **5. Template marketplace** | Publish-as-template flow, `/templates` public gallery, usage count |
| **6. Product promotion + auto-DM** | `Product` model, product cards on public page ("Shop" section), auto-DM wizard that provisions `Automation`/`Trigger`/`Keyword`/`Listener` records, product-level analytics (clicks + `dmCount`) |
| **7 (stretch). Follow/social layer** | Only if there's real demand post-launch |

---

## 9. Open decisions before coding starts

- **Username namespace**: `plix.app/u/username` vs. giving LinkHub its own subdomain path structure. Path-based (`/u/`) is simpler and ships faster; revisit subdomains later if you want it to feel more "linktree-native."
- **Image hosting**: repo doesn't currently have an upload/storage integration — need to pick one (Vercel Blob, UploadThing, or S3) for avatars and any image blocks.
- **Public page rendering strategy**: ISR with revalidation on save, vs. fully dynamic. ISR is cheaper and fine since profile pages don't need to be real-time.

---

Ready to start on Phase 1 (Prisma migration + CRUD routes + first working public page) whenever you want the actual code.