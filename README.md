# Srpska Zemlja — App

Real backend scaffold for the platform: Next.js (App Router) + Prisma + Postgres.
Companion to the technical spec — this is the code the spec described, ready
to deploy to Vercel.

## What's wired up

- **Data model** (`prisma/schema.prisma`) — Region → Unit (1 m² each) → Member
  → Reservation, matching the spec's schema exactly.
- **Seed script** (`prisma/seed.js`) — populates all 100 regions and
  1,000,000 units, with the same deterministic "already reserved" scatter
  used in the demo, so real data looks like what people already saw.
- **Pricing engine** (`lib/pricing.ts`) — single source of truth for the
  $1/m²/mo, $10/yr, and 3/5/10-year discount tiers. Import this anywhere
  price needs to be calculated or displayed — never hardcode a rate.
- **API routes:**
  - `GET /api/units?regionId=&blockIndex=` — availability for a block
  - `POST /api/reservations` — creates a reservation, locks units, checks
    for double-booking inside a DB transaction, auto-promotes to vojvoda
    at 1,000 m²
  - `GET/POST /api/members` — lookup/create by email
- **Pages:** `/` (placeholder home), `/reserve` (functional reservation
  flow hitting the real API), `/dashboard` (server-rendered from real
  Prisma data instead of the mock data in the earlier demo).

## Auth (Google, Meta, Apple)

Real SSO is wired in via NextAuth (`app/api/auth/[...nextauth]/route.ts`),
with a login page at `/login` and account management at `/account`. The
header (`app/components/Header.tsx`, shown on every page via `app/layout.tsx`)
carries the logo and switches between "Sign in" and "Account / My ground /
Sign out" based on session state.

**Setting up SSO** — each provider needs credentials from its own developer
console; nothing here can generate real ones for you:

1. **Google** — console.cloud.google.com → APIs & Services → Credentials →
   Create OAuth client ID (Web application). Add
   `https://your-domain.vercel.app/api/auth/callback/google` as an
   authorized redirect URI. Copy the client ID/secret into `GOOGLE_CLIENT_ID`
   / `GOOGLE_CLIENT_SECRET`.
2. **Meta** — developers.facebook.com → create an app → add "Facebook
   Login" product → Settings → add
   `https://your-domain.vercel.app/api/auth/callback/facebook` as a valid
   OAuth redirect URI. Copy the App ID/Secret into `FACEBOOK_CLIENT_ID` /
   `FACEBOOK_CLIENT_SECRET`.
3. **Apple** — developer.apple.com → Certificates, IDs & Profiles → register
   a Services ID (this is your `APPLE_CLIENT_ID`), enable "Sign in with
   Apple," add the same callback pattern
   (`.../api/auth/callback/apple`), then generate a private key and use it
   to sign a JWT — that signed JWT is your `APPLE_CLIENT_SECRET`, and it
   expires after at most 6 months, so this needs periodic regeneration
   (a small script, not a one-time value). Apple's setup is the most
   involved of the three — budget real time for it.
4. Set `NEXTAUTH_SECRET` (any random string — `openssl rand -base64 32`
   works) and `NEXTAUTH_URL` to your live domain in Vercel's environment
   variables too, not just locally.

Every successful sign-in upserts a `Member` row by email (see the `signIn`
callback in the NextAuth route), so a Google login and a later Apple login
with the same email address resolve to the same member and the same
reserved units.

## The real Serbia-shaped map

A separate artifact (published alongside this app) renders every 1 m² unit
inside Serbia's actual simplified border, projected from real coordinates,
with a virtualized grid that only renders what's on screen — this is what
makes "all 1,000,000 m²" navigable without freezing the browser. The same
boundary data lives here at `lib/serbia-boundary.json` (a simplified
polygon, ~130 points, in `[lng, lat]` pairs) so the same shape can be
ported into `/reserve` directly. That port isn't done yet — `/reserve`
still uses the simpler one-block-at-a-time picker from the original
scaffold. Recommended next step: replace its grid-rendering logic with the
canvas/projection approach from the map artifact, now backed by this
project's real `/api/units` and `/api/reservations` endpoints instead of
the artifact's synthetic taken/available data.

## What's intentionally left as a next step

- **Payments.** `POST /api/reservations` creates a `PENDING` reservation and
  marks units `HELD`, but nothing charges a card yet. Add a Stripe (or
  equivalent) checkout session after reservation creation, then a webhook
  that flips `PENDING → ACTIVE` and `HELD → RESERVED` on successful payment.
  See spec §5–6 for the escrow/custody consideration before wiring this up
  for real.
- **GPS bridge.** `Region.centroidLat/Lng` and `Unit.lat/lng` exist in the
  schema but are `null` until real survey data is available. See spec §4.
- **The full zoomable grid UI** from the demo artifact isn't ported into
  `/reserve` yet — that page has a minimal one-block-at-a-time picker to
  keep the wiring readable. Drop the demo's grid/zoom JS in once you're
  happy with the API shape.

## Deploying

1. Create a Postgres database (Vercel Postgres, Neon, or Supabase all work).
2. Copy `.env.example` to `.env` and set `DATABASE_URL`.
3. `npm install`
4. `npx prisma migrate dev --name init` (creates tables)
5. `npm run prisma:seed` (populates 1,000,000 units — takes a few minutes)
6. `vercel deploy`
7. Set `DATABASE_URL` in the Vercel project's environment variables too.

## Note

This hasn't been run/built in a live environment — no network access was
available while writing it. Expect to fix a small dependency-version or
import-path issue on first `npm install && npm run build`; the architecture
and logic are the real work here.
