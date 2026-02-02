# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # Run ESLint
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
```

## Tech Stack

- **Framework:** Next.js 15 (App Router) with React 19
- **Language:** TypeScript 5.7
- **Auth:** Clerk (@clerk/nextjs)
- **Database:** PostgreSQL (Neon) with Prisma 5
- **Styling:** Tailwind CSS
- **Validation:** Zod
- **Testing:** Jest + React Testing Library

## Architecture Overview

This is a roofing estimation app that integrates Google Solar API, Google Maps/Geocoding, and Rentcast property valuation.

### User Roles

Roles are stored in Clerk user public metadata (`{ "role": "owner" }` or `{ "role": "agent" }`).

- **Owner**: Full access - can search addresses and configure pricing settings
- **Agent**: Can search addresses and view all results, but cannot access settings

Role assignment is done manually via Clerk Dashboard → Users → Select user → Public metadata.

### Route Groups & Protection

- `app/(auth)/` - Clerk sign-in/sign-up pages (public)
- `app/dashboard/` - Protected main estimation interface
- `app/dashboard/training/` - Training materials (all authenticated users)
- `app/dashboard/settings/` - Pricing settings (owner only)
- `middleware.ts` - Clerk auth protecting all routes except landing, auth, and API webhooks

### Training Materials (`public/training/`)

Training documents are stored in the public folder and viewable at `/dashboard/training`. Both owners and agents have access.

- Office documents (.docx, .xlsx, .pptx) use Microsoft Office Online Viewer for in-browser viewing
- Images display directly
- Audio files use HTML5 audio player
- All documents can be downloaded

To add new training documents, place them in `public/training/` and update the `trainingDocuments` array in `app/dashboard/training/page.tsx`.

### API Routes (`app/api/`)

All API routes follow the pattern: `{ success: boolean; data?: T; error?: string }`

- `/api/geocode` (POST) - Validates address via Google Geocoding, returns lat/lng and image URLs
- `/api/roof-analysis` (GET) - Fetches roof data from Google Solar API (area, pitch, segments)
- `/api/property-value` (GET) - Rentcast property valuation (rate-limited: 50 req/month)
- `/api/settings/pricing` (GET/PUT) - Pricing configuration (PUT is owner only)

### Core Libraries (`lib/`)

- `google-apis.ts` - Google Maps & Solar API integrations
- `pricing.ts` - Pricing calculation engine with configurable 3-tier pricing
- `rate-limiter.ts` - In-memory rate limiting for Rentcast API
- `validations.ts` - Zod schemas for input validation
- `db.ts` - Prisma client singleton
- `auth.ts` - Role checking utilities (`getUserRole()`, `isOwner()`)

### Data Flow

```
Address Input → Geocode API → (parallel) Roof Analysis + Property Value → Client-side Pricing Calculation → Results Display
```

### Pricing Formula

```typescript
pricePerSqFtCash = (cost + profit) / sqFt / (1 - commissionRate)
dealerPrice = cashPrice / (1 - dealerFee)
```

Defaults in `lib/pricing.ts`: cost per sq ft ($4.50), target profit ($2,000), commission (10%), gutter price ($15/ft), tier fees (0%, 10%, 15%).

Pricing settings are stored in the database (`PricingSettings` table) and can be configured by owners via `/dashboard/settings`.

### Database Schema (`prisma/schema.prisma`)

- `PricingSettings` - Stores configurable pricing parameters (cost per sq ft, profit, commission, tier dealer fees)

## Environment Variables

Required in `.env.local` (and `.env` for Prisma CLI):
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` - Clerk auth
- `GOOGLE_MAPS_API_KEY` - For geocoding and Solar API
- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `RENTCAST_API_KEY` - Optional, for property valuation

## Types

All TypeScript interfaces are centralized in `types/index.ts`.
