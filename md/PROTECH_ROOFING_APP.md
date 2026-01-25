# ProTech Roofing Estimation Web Application

## Project Overview

A Next.js web application for ProTech Roofing LLC that uses Google's Geospatial and Solar APIs to calculate roof measurements, generate pricing estimates, and produce professional PDF reports similar to GAF QuickMeasure reports.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Database**: PostgreSQL (Neon - serverless)
- **Authentication**: NextAuth.js (or Clerk for simpler setup)
- **APIs**: Google Maps Platform (Geocoding, Solar API)
- **PDF Generation**: React-PDF or @react-pdf/renderer
- **Deployment**: Vercel
- **ORM**: Prisma

## Core Features

### 1. Authentication System
- User registration and login
- Protected routes
- Session management
- Role-based access (Admin, Sales Rep)

### 2. Address Search & Roof Analysis
- Address input with Google Geocoding validation
- Google Solar API integration for roof data:
  - Roof area (sq ft)
  - Roof pitch/slope
  - Number of roof segments
  - Building insights
- Satellite imagery display of the property

### 3. Pricing Calculator

#### Pricing Formula (from ProTech Pricing Guide)

**Assumptions:**
```
Target Profit per Deal: $2,000
Cost per Sq Ft: $4.50
Commission Rate: 10%
```

**Price Calculation Formulas:**

```typescript
// Base calculation
const cost = sqFt * costPerSqFt;  // e.g., 3957 * 4.50 = $17,806.50

// Cash Price per Sq Ft
const pricePerSqFtCash = (cost + targetProfit) / sqFt / (1 - commissionRate);
// Formula: (Sq Ft * $4.50 + $2000) / Sq Ft / (1 - 0.10)

// Price with Dealer Fees
const pricePerSqFt5Dealer = pricePerSqFtCash / (1 - 0.05);  // 5% dealer fee
const pricePerSqFt10Dealer = pricePerSqFtCash / (1 - 0.10); // 10% dealer fee
const pricePerSqFt18Fee = pricePerSqFtCash / (1 - 0.18);    // 18% fee
const pricePerSqFt23Fee = pricePerSqFtCash / (1 - 0.23);    // 23% fee

// Total Prices
const priceCash = pricePerSqFtCash * sqFt;
const price5Dealer = pricePerSqFt5Dealer * sqFt;
const price10Dealer = pricePerSqFt10Dealer * sqFt;

// Commission Calculations
const commissionCash = priceCash * commissionRate;
const commission5Dealer = price5Dealer * commissionRate;
const commission10Dealer = price10Dealer * commissionRate;

// Fee (13% of Cash Price)
const fee13 = priceCash * 0.13;
```

#### Gutter Add-on Pricing
- Based on total perimeter in linear feet
- Configurable price per linear foot
- Optional add-on to final quote

### 4. Report Generation (PDF)

Generate professional reports similar to GAF QuickMeasure including:

**Page 1 - Overview:**
- Property address
- Date prepared
- Company name (ProTech Roofing LLC)
- Roof diagram (top view)
- Key measurements:
  - Roof Area (sq ft)
  - Roof Facets count
  - Predominant Pitch (e.g., 5/12)
  - Ridges/Hips (ft)
  - Valleys (ft)
  - Rakes (ft)
  - Eaves (ft)

**Page 2 - Satellite View:**
- Top-down aerial/satellite image

**Page 3 - Pricing Summary:**
- Cash price
- Financing options (5%, 10% dealer fee)
- Commission breakdown
- Gutter add-on (if applicable)
- Total estimate

**Page 4 - Materials Estimate:**
- Shingle bundles needed (with waste factor)
- Starter strips
- Ridge caps
- Underlayment
- Drip edge
- Other materials

### 5. Historical Data & Dashboard
- Date picker to filter saved estimates
- Search by address
- View/download past reports
- Analytics dashboard:
  - Total estimates generated
  - Average deal size
  - Conversion tracking (if implemented)

### 6. Database Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String    // hashed
  role          Role      @default(SALES_REP)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  estimates     Estimate[]
}

enum Role {
  ADMIN
  SALES_REP
}

model Estimate {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  
  // Address Info
  address           String
  city              String
  state             String
  zipCode           String
  latitude          Float
  longitude         Float
  
  // Roof Measurements
  roofAreaSqFt      Float
  roofFacets        Int
  predominantPitch  String   // e.g., "5/12"
  ridgesHipsFt      Float
  valleysFt         Float
  rakesFt           Float
  eavesFt           Float
  perimeterFt       Float    // Total perimeter for gutters
  
  // Pricing
  costPerSqFt       Float    @default(4.50)
  targetProfit      Float    @default(2000)
  commissionRate    Float    @default(0.10)
  
  priceCash         Float
  price5Dealer      Float
  price10Dealer     Float
  commissionCash    Float
  
  // Gutter Add-on
  includeGutters    Boolean  @default(false)
  gutterPricePerFt  Float?
  gutterTotal       Float?
  
  // Final Total
  finalTotal        Float
  
  // Metadata
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  reportGenerated   Boolean  @default(false)
  reportUrl         String?
}

model Settings {
  id                String   @id @default(cuid())
  costPerSqFt       Float    @default(4.50)
  targetProfit      Float    @default(2000)
  commissionRate    Float    @default(0.10)
  gutterPricePerFt  Float    @default(15.00)
  updatedAt         DateTime @updatedAt
}
```

## Project Structure

```
protech-roofing/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard home
│   │   ├── estimates/
│   │   │   ├── page.tsx                # List all estimates
│   │   │   ├── new/
│   │   │   │   └── page.tsx            # New estimate form
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # View estimate
│   │   │       └── report/
│   │   │           └── page.tsx        # PDF report view
│   │   ├── history/
│   │   │   └── page.tsx                # Historical data with date picker
│   │   └── settings/
│   │       └── page.tsx                # Pricing settings (admin)
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── estimates/
│   │   │   ├── route.ts                # GET all, POST new
│   │   │   └── [id]/
│   │   │       └── route.ts            # GET, PUT, DELETE single
│   │   ├── roof-analysis/
│   │   │   └── route.ts                # Google Solar API integration
│   │   ├── geocode/
│   │   │   └── route.ts                # Google Geocoding API
│   │   └── report/
│   │       └── [id]/
│   │           └── route.ts            # Generate PDF
│   ├── layout.tsx
│   └── page.tsx                        # Landing/redirect
├── components/
│   ├── ui/                             # shadcn/ui components
│   ├── forms/
│   │   ├── AddressForm.tsx
│   │   ├── PricingForm.tsx
│   │   └── GutterForm.tsx
│   ├── estimates/
│   │   ├── EstimateCard.tsx
│   │   ├── EstimateList.tsx
│   │   └── EstimateSummary.tsx
│   ├── maps/
│   │   ├── PropertyMap.tsx
│   │   └── RoofVisualization.tsx
│   ├── reports/
│   │   └── PDFReport.tsx
│   └── dashboard/
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── StatsCards.tsx
├── lib/
│   ├── prisma.ts                       # Prisma client
│   ├── auth.ts                         # NextAuth config
│   ├── google-apis.ts                  # Google API helpers
│   ├── pricing.ts                      # Pricing calculation functions
│   ├── utils.ts                        # Utility functions
│   └── validations.ts                  # Zod schemas
├── hooks/
│   ├── useEstimates.ts
│   └── useRoofAnalysis.ts
├── types/
│   └── index.ts                        # TypeScript types
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── logo.png
├── .env.local                          # Environment variables
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Environment Variables

```env
# .env.local

# Database (Neon)
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/protech?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google APIs
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
GOOGLE_SOLAR_API_KEY="your-google-solar-api-key"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Google Solar API Integration

### Required APIs to Enable
1. Google Maps JavaScript API
2. Geocoding API
3. Solar API (requires special access - may need to apply)

### Solar API Endpoints

```typescript
// lib/google-apis.ts

const SOLAR_API_BASE = 'https://solar.googleapis.com/v1';

export async function getBuildingInsights(lat: number, lng: number) {
  const response = await fetch(
    `${SOLAR_API_BASE}/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&requiredQuality=HIGH&key=${process.env.GOOGLE_SOLAR_API_KEY}`
  );
  return response.json();
}

// Response includes:
// - roofSegmentStats (area, pitch, azimuth for each segment)
// - wholeRoofStats (total area, panels count)
// - imageryDate
// - imageryQuality
```

### Alternative: EagleView or Similar Services
If Google Solar API doesn't provide all needed measurements, consider:
- EagleView API
- GAF QuickMeasure API
- Roofr API

## Pricing Calculation Module

```typescript
// lib/pricing.ts

export interface PricingInput {
  sqFt: number;
  costPerSqFt?: number;
  targetProfit?: number;
  commissionRate?: number;
  includeGutters?: boolean;
  perimeterFt?: number;
  gutterPricePerFt?: number;
}

export interface PricingOutput {
  cost: number;
  pricePerSqFtCash: number;
  pricePerSqFt5Dealer: number;
  pricePerSqFt10Dealer: number;
  pricePerSqFt18Fee: number;
  pricePerSqFt23Fee: number;
  priceCash: number;
  price5Dealer: number;
  price10Dealer: number;
  commissionCash: number;
  commission5Dealer: number;
  commission10Dealer: number;
  fee13: number;
  profit: number;
  gutterTotal: number;
  finalTotal: number;
}

export function calculatePricing(input: PricingInput): PricingOutput {
  const {
    sqFt,
    costPerSqFt = 4.50,
    targetProfit = 2000,
    commissionRate = 0.10,
    includeGutters = false,
    perimeterFt = 0,
    gutterPricePerFt = 15.00
  } = input;

  // Base cost
  const cost = sqFt * costPerSqFt;

  // Cash price per sq ft (includes profit and commission)
  // Formula derived from: price = (cost + profit) / (1 - commissionRate)
  const pricePerSqFtCash = (cost + targetProfit) / sqFt / (1 - commissionRate);

  // Dealer fee variations
  const pricePerSqFt5Dealer = pricePerSqFtCash / (1 - 0.05);
  const pricePerSqFt10Dealer = pricePerSqFtCash / (1 - 0.10);
  const pricePerSqFt18Fee = pricePerSqFtCash / (1 - 0.18);
  const pricePerSqFt23Fee = pricePerSqFtCash / (1 - 0.23);

  // Total prices
  const priceCash = pricePerSqFtCash * sqFt;
  const price5Dealer = pricePerSqFt5Dealer * sqFt;
  const price10Dealer = pricePerSqFt10Dealer * sqFt;

  // Commissions
  const commissionCash = priceCash * commissionRate;
  const commission5Dealer = price5Dealer * commissionRate;
  const commission10Dealer = price10Dealer * commissionRate;

  // Fee (13%)
  const fee13 = priceCash * 0.13;

  // Gutter calculation
  const gutterTotal = includeGutters ? perimeterFt * gutterPricePerFt : 0;

  // Final total (using cash price as base)
  const finalTotal = priceCash + gutterTotal;

  return {
    cost,
    pricePerSqFtCash,
    pricePerSqFt5Dealer,
    pricePerSqFt10Dealer,
    pricePerSqFt18Fee,
    pricePerSqFt23Fee,
    priceCash,
    price5Dealer,
    price10Dealer,
    commissionCash,
    commission5Dealer,
    commission10Dealer,
    fee13,
    profit: targetProfit,
    gutterTotal,
    finalTotal
  };
}

// Utility to get price for specific sq ft from the pricing table
export function getPricingTier(sqFt: number): PricingOutput {
  // Round to nearest 100 for table lookup, or use exact calculation
  return calculatePricing({ sqFt });
}
```

## Materials Estimation

```typescript
// lib/materials.ts

export interface MaterialsEstimate {
  shingleBundles: number;       // 3 bundles = ~1 square (100 sq ft)
  starterBundles: number;       // Based on eaves length
  ridgeCapBundles: number;      // Based on ridges + hips
  underlaymentRolls: number;    // 10 sq roll coverage
  leakBarrierRolls: number;     // For valleys
  dripEdgePieces: number;       // 10ft pieces
  nailBoxes: number;
  ventilation: number;          // Ridge vent linear feet
}

export function calculateMaterials(
  roofAreaSqFt: number,
  eavesFt: number,
  rakesFt: number,
  ridgesHipsFt: number,
  valleysFt: number,
  wasteFactor: number = 0.15  // 15% suggested waste
): MaterialsEstimate {
  const adjustedArea = roofAreaSqFt * (1 + wasteFactor);
  const squares = adjustedArea / 100;

  return {
    shingleBundles: Math.ceil(squares * 3),           // 3 bundles per square
    starterBundles: Math.ceil(eavesFt / 80),          // ~80 ft per bundle
    ridgeCapBundles: Math.ceil(ridgesHipsFt / 20),    // ~20 ft per bundle
    underlaymentRolls: Math.ceil(squares / 10),       // 10 sq per roll
    leakBarrierRolls: Math.ceil(valleysFt / 66),      // ~66 ft per roll (2 sq)
    dripEdgePieces: Math.ceil((eavesFt + rakesFt) / 10), // 10 ft pieces
    nailBoxes: Math.ceil(squares / 13),               // ~13 squares per box
    ventilation: Math.ceil(ridgesHipsFt * 0.5)        // Estimate
  };
}
```

## PDF Report Generation

```typescript
// Using @react-pdf/renderer

// components/reports/PDFReport.tsx
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  // ... more styles
});

export function RoofReport({ estimate }: { estimate: Estimate }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Overview Page */}
        <View style={styles.header}>
          <Text>ProTech Roofing LLC</Text>
          <Text>{new Date().toLocaleDateString()}</Text>
        </View>
        <Text style={styles.address}>{estimate.address}</Text>
        {/* Measurements table */}
        {/* Roof diagram placeholder */}
      </Page>
      
      <Page size="LETTER" style={styles.page}>
        {/* Pricing Summary */}
      </Page>
      
      <Page size="LETTER" style={styles.page}>
        {/* Materials List */}
      </Page>
    </Document>
  );
}
```

## API Routes

### POST /api/estimates
```typescript
// app/api/estimates/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculatePricing } from '@/lib/pricing';
import { getServerSession } from 'next-auth';

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const pricing = calculatePricing({
    sqFt: body.roofAreaSqFt,
    includeGutters: body.includeGutters,
    perimeterFt: body.perimeterFt,
  });

  const estimate = await prisma.estimate.create({
    data: {
      userId: session.user.id,
      ...body,
      ...pricing,
    },
  });

  return NextResponse.json(estimate);
}
```

### GET /api/roof-analysis
```typescript
// app/api/roof-analysis/route.ts
import { NextResponse } from 'next/server';
import { getBuildingInsights } from '@/lib/google-apis';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');

  try {
    const insights = await getBuildingInsights(lat, lng);
    
    // Extract relevant data
    const roofData = {
      roofAreaSqFt: insights.solarPotential?.wholeRoofStats?.areaMeters2 * 10.764 || 0,
      roofFacets: insights.solarPotential?.roofSegmentStats?.length || 0,
      // Calculate predominant pitch from segments
      // ... more processing
    };

    return NextResponse.json(roofData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch roof data' }, { status: 500 });
  }
}
```

## Key Implementation Notes

### 1. Google Solar API Limitations
- May not be available in all regions
- Quality varies by location
- Consider fallback to manual entry

### 2. Pitch Calculation
The Google Solar API provides roof segment data. Calculate predominant pitch:
```typescript
function calculatePredominantPitch(segments: RoofSegment[]): string {
  // Find segment with largest area
  const largest = segments.reduce((prev, curr) => 
    curr.areaMeters2 > prev.areaMeters2 ? curr : prev
  );
  
  // Convert pitch angle to ratio (e.g., 22.6° ≈ 5/12)
  const pitchAngle = largest.pitchDegrees;
  const rise = Math.round(Math.tan(pitchAngle * Math.PI / 180) * 12);
  return `${rise}/12`;
}
```

### 3. Perimeter Calculation for Gutters
Sum of all eaves (horizontal edges at roof perimeter):
```typescript
const perimeterFt = estimate.eavesFt; // Gutters go on eaves
```

### 4. Error Handling
- Validate addresses before API calls
- Handle API rate limits gracefully
- Provide manual entry fallback

### 5. Security Best Practices
- Hash passwords with bcrypt
- Use environment variables for all secrets
- Implement rate limiting
- Validate all inputs with Zod
- Use prepared statements (Prisma handles this)

## Deployment Checklist

1. **Neon Database Setup**
   - Create database in Neon console
   - Copy connection string
   - Run `npx prisma migrate deploy`

2. **Vercel Deployment**
   - Connect GitHub repository
   - Add environment variables
   - Enable automatic deployments

3. **Google Cloud Console**
   - Enable required APIs
   - Set up API key restrictions
   - Configure billing alerts

4. **Post-Deployment**
   - Test all API endpoints
   - Verify PDF generation
   - Check authentication flow
   - Test on mobile devices

## Future Enhancements

- [ ] Customer portal for viewing estimates
- [ ] Email estimate to customer
- [ ] Integration with CRM (Salesforce, HubSpot)
- [ ] Automated follow-up reminders
- [ ] Photo upload for manual assessment
- [ ] Drone imagery integration
- [ ] Multi-language support
- [ ] Mobile app (React Native)
