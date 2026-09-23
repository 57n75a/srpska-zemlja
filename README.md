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

## What's intentionally left as a next step

- **Auth.** `/dashboard` and `/reserve` use a hardcoded demo email / manual
  email field. Swap in NextAuth, Clerk, or Vercel's own auth once you pick
  one — the API routes already expect a `memberId`, so this is a thin layer
  on top.
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
