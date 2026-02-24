# FattyURL – Pages, APIs & Custom Domains

**FattyURL** is a URL shortener with analytics, custom domains, teams, webhooks, and optional password protection. It uses the Next.js App Router, Prisma, and NextAuth.

---

## Table of contents

1. [Pages](#pages)
2. [APIs](#apis)
3. [Custom domains – end-to-end flow](#custom-domains--end-to-end-flow)

---

## Pages

| Route | Purpose | How it works |
|-------|--------|---------------|
| **`/`** (Home) | Marketing landing + shorten link | Hero, features, comparison, CTA. `ShortenerForm` submits to server action `shortenUrl()`; optional custom slug; link counter from `/api/stats`. |
| **`/login`** | Sign in | Dev credentials (e.g. dev@fattyurl.com) or OAuth (GitHub, Google). NextAuth; redirect to `/dashboard`. |
| **`/dashboard`** | User links overview | Auth required. Lists user's links with search, sort (newest/oldest/top clicks), pagination. Stats: total links, total clicks, avg clicks/link. Uses Prisma + session. |
| **`/dashboard/links/[id]`** | Single link details | View short URL, destination, clicks; edit via `LinkEditor` (URL, slug, active, expiry); QR code via `QrPreview`. |
| **`/dashboard/links/[id]/analytics`** | Link analytics | Period (7d/30d/90d/all). Total clicks, unique visitors (by `ipHash`), top country/device; charts: clicks by date, countries, devices, browsers, referrers. |
| **`/dashboard/settings`** | User settings | Manage account/settings (e.g. API key, export). |
| **`/dashboard/team`** | Team management | Team workspace UI (backed by teams API). |
| **`/p/[shortCode]`** | Password gate for link | For password-protected links. Form POSTs to `/api/redirect/[shortCode]` with password; on success client redirects to returned `url`. |
| **`/docs`** | API docs | Static docs listing REST endpoints, auth, request/response examples. |
| **`/link-not-found`** | 404 for unknown short links | Shown when redirect lookup fails (missing/expired/inactive). CTA to create a link. |
| **`/migrate`** | Import from other shorteners | Hosts `MigrationWizard` to import links from other services into FattyURL. |
| **`/(marketing)/about`** | About | Marketing content. |
| **`/(marketing)/pricing`** | Pricing | Plans/pricing. |
| **`/(marketing)/terms`** | Terms of service | Legal. |
| **`/(marketing)/privacy`** | Privacy policy | Legal. |
| **`/(marketing)/contact`** | Contact | Contact info/form. |
| **`/not-found`** | Global 404 | Next.js not-found UI. |
| **`/opengraph-image`** | OG image | Dynamic Open Graph image for sharing. |

---

## APIs

### Redirect & password

| Method & Path | Purpose | How it works |
|---------------|--------|---------------|
| **GET `/[shortCode]`** (route handler) | Redirect by short code | Resolves `shortCode` (or custom slug) via Prisma; if not found/expired/inactive → redirect to `/link-not-found`; if password set → redirect to `/p/[shortCode]`; else 301 to `originalUrl`. Logs click async (UA, referer, geo, device, ipHash); rate-limited by IP. |
| **GET `/api/redirect/[shortCode]`** | Same redirect logic | Same as above: lookup, expiry, password check, redirect, click logging. |
| **POST `/api/redirect/[shortCode]`** | Password unlock | Body: `{ password }`. Validates against link's stored hash; optional bcrypt upgrade. Returns `{ url }` for client redirect. Rate-limited per shortCode. |

### Shorten & links (v1)

| Method & Path | Purpose | How it works |
|---------------|--------|---------------|
| **POST `/api/v1/shorten`** | Create short link | Body: `url`, optional `customSlug`, `title`. Validates/sanitizes URL; checks slug rules and reserved list; creates `Link` (anonymous or tied to API user). Returns short URL + shortCode. Rate limit: API tier (logged-in) or public by IP. |
| **GET `/api/v1/links`** | List my links | Auth (Bearer/session). Pagination + search. Returns links with click counts. |
| **GET `/api/v1/links/[id]`** | Get one link | Auth. Returns link details including click count, password flag, expiry. |
| **PATCH `/api/v1/links/[id]`** | Update link | Auth. Allowed: `originalUrl`, `title`, `isActive`, `password` (set/clear), `expiresAt`, `customSlug`. Validates URL/slug; hashes password. |
| **DELETE `/api/v1/links/[id]`** | Delete link | Auth. Deletes if owned by user. |
| **GET `/api/v1/links/[id]/clicks`** | Click log | Auth. Paginated click records; optional `from`/`to`. Returns clickedAt, referrer, country, city, device, browser, os. |

### Bulk

| Method & Path | Purpose | How it works |
|---------------|--------|---------------|
| **POST `/api/v1/bulk`** | Create many links | Auth. Body: `{ links: [{ url, customSlug?, title? }] }` (max 100). Creates each link; returns per-item success/shortUrl or error. Audit log for bulk create. |

### Domains

| Method & Path | Purpose | How it works |
|---------------|--------|---------------|
| **GET `/api/v1/domains`** | List my custom domains | Auth. Returns domains for user. |
| **POST `/api/v1/domains`** | Add custom domain | Auth. Body: `{ domain }`. Validates format; creates with random TXT verification token; returns `txtRecord` and instructions. |
| **DELETE `/api/v1/domains`** | Remove domain | Auth. Body: `{ id }`. Deletes if owned. |
| **POST `/api/v1/domains/[id]/verify`** | Verify domain | Auth. Resolves TXT for domain; if `txtRecord` found, marks verified. Audit log. |

### Teams

| Method & Path | Purpose | How it works |
|---------------|--------|---------------|
| **GET `/api/v1/teams`** | List my teams | Auth. Returns teams user is in, with role, member/link counts. |
| **POST `/api/v1/teams`** | Create team | Auth. Body: `name`, optional `slug`. Creates team with user as owner. |
| **GET `/api/v1/teams/[teamId]/members`** | List members | Auth; must be member. Returns members with user info and role. |
| **POST `/api/v1/teams/[teamId]/members`** | Add member | Auth; owner/admin. Body: `email`, optional `role` (admin/member). Adds by email. |
| **DELETE `/api/v1/teams/[teamId]/members`** | Remove member | Auth; owner/admin. Body: `userId`. Cannot remove owner. |

### Webhooks

| Method & Path | Purpose | How it works |
|---------------|--------|---------------|
| **GET `/api/v1/webhooks`** | List webhooks | Auth. Returns user's webhooks (url, events, active). |
| **POST `/api/v1/webhooks`** | Create webhook | Auth. Body: `url`, `events[]` (e.g. click, link.created/deleted/updated). Creates with HMAC secret; returns secret once. |
| **DELETE `/api/v1/webhooks`** | Delete webhook | Auth. Body: `{ id }`. |

### Auth & app

| Method & Path | Purpose | How it works |
|---------------|--------|---------------|
| **GET/POST `/api/auth/[...nextauth]`** | NextAuth | Handles sign-in, callbacks, session. |
| **GET `/api/health`** | Health check | DB ping; returns status, uptime, version. For monitoring. |
| **GET `/api/stats`** | Public stats | Rate-limited by IP. Returns `totalLinks`, `linksToday` for homepage counter. |
| **GET `/api/slug-check`** | Slug availability | Query `?slug=`. Rate-limited. Returns `{ available: boolean }` (used by shortener form). |
| **GET `/api/settings/export`** | Export links CSV | Session auth. Exports user's links as CSV (short URL, original, title, clicks, active, created). |
| **POST `/api/settings/regenerate-key`** | New API key | Session auth. Generates new key (`fu_` + CUID2), stores hash only; returns plain key once. |

---

## Custom domains – end-to-end flow

Custom domains let a user use their own domain (e.g. `links.example.com`) for short URLs instead of the default app domain (e.g. `fattyurl.com`). The app stores and verifies ownership via DNS; the same short codes can then be used on both the main domain and the user’s verified domain.

### 1. Data model (current)

- **CustomDomain**: `id`, `domain` (unique), `userId`, `verified`, `txtRecord`, `createdAt`.
- **Link** does not reference a domain; short URLs are built from `NEXT_PUBLIC_APP_URL` or, in a future step, from the user’s verified domain when generating “branded” URLs.
- Redirect logic looks up by **shortCode** (or customSlug) only; the host (main app vs custom domain) is not part of the lookup today.

### 2. User flow (step-by-step)

#### Step 1: Add a custom domain

- **Where**: Dashboard (future) or API today.
- **API**: `POST /api/v1/domains` with body `{ "domain": "links.example.com" }`.
- **Auth**: Required (Bearer token or session).
- **Validation**: Domain format, not a fattyurl.com subdomain, not already registered.
- **Response**:  
  - `id`, `domain`, `verified: false`  
  - `txtRecord`: one-time verification string, e.g. `fattyurl-verify-<random hex>`  
  - `instructions`: e.g. “Add a TXT record with value `...` to your DNS for links.example.com, then call the verify endpoint.”

#### Step 2: Add DNS TXT record

- User goes to their DNS provider (Cloudflare, Route53, etc.).
- For the **exact** domain they added (e.g. `links.example.com`), they create a **TXT** record with the value from `txtRecord`.
- They save and wait for DNS propagation (minutes to 48 hours depending on TTL and provider).

#### Step 3: Verify domain

- **API**: `POST /api/v1/domains/[id]/verify` (same auth).
- **Server**: Resolves TXT records for the domain (e.g. `dns.resolveTxt("links.example.com")`). If the stored `txtRecord` appears in the TXT values, the domain is marked **verified**.
- **Response**:  
  - Success: `{ verified: true, message: "Domain verified successfully!" }`  
  - Failure: `{ verified: false, message: "TXT record not found...", found: [...] }` so the user can debug.
- **Audit**: `domain.verify` is logged.

#### Step 4: Point domain at the app (for redirects to work on custom host)

- To have `https://links.example.com/abc123` actually perform redirects, the **domain must resolve to the same app** that runs FattyURL.
- **Option A (typical)**: User sets a **CNAME** for `links.example.com` to the app’s host (e.g. `cname.vercel-dns.com` or the app’s canonical host). The app is then reachable at `https://links.example.com` (SSL via provider or platform).
- **Option B**: User sets an **A** record to the app’s IP (less common for hosted apps).
- **Platform**: On Vercel, the user would add `links.example.com` as a domain in the project so the app receives requests for that host. Other hosts have similar “add domain” steps.

#### Step 5: Serving redirects on the custom domain

- **Current behavior**: Redirect routes (`GET /[shortCode]` and `GET /api/redirect/[shortCode]`) look up the link by `shortCode` (or customSlug) only; they do not check the request host. So **if** the request already reaches this app (because the custom domain points here), the same handler can serve the redirect.
- **Optional enhancement**: Middleware or host checks could restrict which hosts are allowed (e.g. main app host + verified custom domains) and return 404 for unknown hosts. Link resolution can stay as today (by shortCode only); no change to the Link model required for basic “same short codes on two domains” behavior.

#### Step 6: Using the custom domain in short URLs

- **Today**: Short URLs returned by the API and dashboard use `NEXT_PUBLIC_APP_URL` (e.g. `https://fattyurl.com/abc123`).
- **With custom domain**: When generating short URLs for a user who has a verified domain, the app could return (or show) `https://links.example.com/abc123` instead of or in addition to the default URL. That’s a presentation/configuration layer (e.g. “default domain” per user or per link); redirect logic stays the same.

#### Step 7: Remove a custom domain

- **API**: `DELETE /api/v1/domains` with body `{ "id": "<domainId>" }` (auth required).
- **Server**: Deletes the CustomDomain if it belongs to the user. Audit: `domain.remove`.
- **DNS**: User can remove the TXT (and CNAME) at their DNS provider whenever they want.

### 3. End-to-end summary (user journey)

1. User adds `links.example.com` via API (or future UI) → gets a unique TXT value.
2. User adds that TXT record at their DNS for `links.example.com`.
3. User calls verify → app checks DNS and marks the domain verified.
4. User adds `links.example.com` as a domain on the hosting platform (e.g. Vercel) and points DNS (CNAME) to the app so traffic hits FattyURL.
5. Any short link (e.g. `abc123`) that already exists now also works at `https://links.example.com/abc123` because the same redirect logic runs and resolves by shortCode.
6. (Optional) Dashboard/API can show or return branded short URLs using the user’s verified domain.
7. User can remove the domain via API; they may also remove DNS records and the domain from the host.

### 4. Security and constraints

- Only the domain **owner** (userId) can list, verify, or delete their domains.
- Verification is **proof-of-control** via DNS TXT; no one else can verify your domain without access to your DNS.
- The app rejects `*.fattyurl.com` so the main brand isn’t used as a “custom” domain.
- Domains are unique globally; one domain can’t be added by two users.

---

## High-level app flow

1. **Shorten (anonymous)**: Home form → server action `shortenUrl()` or `POST /api/v1/shorten` → Prisma `Link` (no user or with API user) → short URL shown.
2. **Shorten (logged in)**: Same with `userId`/API key so links appear in dashboard and in `GET /api/v1/links`.
3. **Redirect**: Request to `/{shortCode}` or `/api/redirect/[shortCode]` → lookup by shortCode/customSlug → if password, redirect to `/p/[shortCode]`; else 301 to `originalUrl`. Click recorded (IP hashed, geo, UA, device) without blocking response.
4. **Password-protected link**: User opens short link → redirected to `/p/[shortCode]` → submits password → `POST /api/redirect/[shortCode]` → server verifies → returns `{ url }` → client redirects.
5. **Auth**: NextAuth (credentials for dev, GitHub/Google OAuth); session for dashboard/settings; API key (Bearer) for v1 links/domains/teams/webhooks/bulk. Rate limits: public by IP, API/authenticated by user.
6. **Analytics**: Stored per click: referrer, country, city, device, browser, os, ipHash. Dashboard and `GET /api/v1/links/[id]/clicks` read from Prisma; analytics page uses grouped/raw queries for charts.
