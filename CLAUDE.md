# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Generate Prisma client and build Next.js
npm run lint         # Run ESLint
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode
```

### Database

```bash
npx prisma generate          # Generate Prisma client after schema changes
npx prisma migrate dev       # Create and apply migrations in development
npx prisma migrate deploy    # Apply migrations in production
npx prisma db pull           # Pull schema from existing database
```

## Architecture

### Tech Stack
- **Next.js 15** with App Router and Turbopack
- **Clerk** for authentication (wraps entire app via ClerkProvider in root layout)
- **Prisma** with PostgreSQL (Neon serverless) for database
- **Tailwind CSS** for styling
- **Vercel Blob** for file storage (training documents)

### Core Functionality
This is a roofing estimation tool that:
1. Takes an address input
2. Geocodes it via Google Geocoding API
3. Fetches roof measurements via Google Solar API (with quality fallback: HIGH → MEDIUM → LOW)
4. Calculates pricing using a tiered dealer fee system

### Pricing Formula
The pricing logic in `lib/pricing.ts` uses:
- Base commission: 30% (agent 10% + owner 10% + lead 10%)
- Dealer fee tiers: Tier 1 (0%), Tier 2 (10%), Tier 3 (15%)
- Formula: `Revenue = (sqFt × costPerSqFt + targetProfit) / (1 - totalFee)`

### Route Structure
- `/` - Landing page, redirects authenticated users to dashboard
- `/sign-in`, `/sign-up` - Clerk authentication pages
- `/dashboard` - Main estimation interface with address form
- `/dashboard/settings` - Admin pricing configuration (owner role only)
- `/dashboard/users` - User management (owner role only)
- `/dashboard/training` - Training document management

### API Routes
- `POST /api/geocode` - Address geocoding with Street View/satellite URLs
- `GET /api/roof-analysis` - Solar API roof measurements
- `GET/PUT /api/settings/pricing` - Pricing configuration CRUD
- `GET/POST /api/training` - Training document management
- `PUT /api/training/upload` - Vercel Blob file upload

### Key Types
All TypeScript types are centralized in `types/index.ts`:
- `PricingInput`/`PricingOutput` - Pricing calculation I/O
- `RoofData` - Roof measurements from Solar API
- `GeocodeResult` - Address geocoding response
- `UserRole` - "owner" | "agent" roles

### User Roles
- **owner**: Full access including settings and user management
- **agent**: Dashboard access only, cannot modify pricing settings

Roles are stored in Clerk user metadata and checked via `lib/auth.ts`.
