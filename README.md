# ProTech Roofing Estimation App

A Next.js web application for ProTech Roofing LLC that uses Google's Geospatial and Solar APIs to calculate roof measurements and generate pricing estimates.

## Features

- **Authentication**: Secure sign-in/sign-up with Clerk
- **Address Lookup**: Google Geocoding API for address validation
- **Roof Analysis**: Google Solar API for roof measurements (area, pitch, facets)
- **Pricing Calculator**: Automatic pricing with cash, 5%, and 10% dealer fee options
- **Commission Tracking**: Built-in commission calculations

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **APIs**: Google Geocoding + Solar API
- **Testing**: Jest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- Clerk account (https://clerk.com)
- Google Cloud account with Geocoding and Solar APIs enabled

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/protech-roofing-app.git
   cd protech-roofing-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

4. Add your API keys to `.env.local`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   GOOGLE_MAPS_API_KEY=your-google-api-key
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Running Tests

```bash
npm test
```

## Deployment on Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL` = `/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL` = `/sign-up`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` = `/dashboard`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` = `/dashboard`
   - `GOOGLE_MAPS_API_KEY`
4. Deploy

## Project Structure

```
├── app/
│   ├── (auth)/           # Sign-in/sign-up pages
│   ├── dashboard/        # Protected dashboard
│   └── api/              # API routes
├── components/           # React components
├── lib/                  # Utilities and helpers
├── types/                # TypeScript types
└── __tests__/            # Test files
```

## License

Private - ProTech Roofing LLC
