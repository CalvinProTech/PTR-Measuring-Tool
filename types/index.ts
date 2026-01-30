// User Role Types
export type UserRole = "owner" | "agent";

export interface UserData {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  role: UserRole;
  createdAt: number;
  lastSignInAt: number | null;
}

export interface UsersResponse {
  success: boolean;
  data?: UserData[];
  error?: string;
}

// Pricing Settings Types
export interface PricingSettingsData {
  id: string;
  costPerSqFt: number;
  targetProfit: number;
  commissionRate: number;
  gutterPricePerFt: number;
  tier1DealerFee: number;
  tier2DealerFee: number;
  tier3DealerFee: number;
  updatedAt: Date;
  updatedBy: string | null;
}

export interface PricingSettingsResponse {
  success: boolean;
  data?: PricingSettingsData;
  error?: string;
}

// Roof Analysis Types
export interface RoofSegment {
  areaMeters2: number;
  pitchDegrees: number;
  azimuthDegrees: number;
}

export interface RoofData {
  roofAreaSqFt: number;
  roofFacets: number;
  predominantPitch: string;
  ridgesHipsFt: number;
  valleysFt: number;
  rakesFt: number;
  eavesFt: number;
  perimeterFt: number;
}

export interface GeocodeResult {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  zipCode: string;
  streetViewUrl: string;
  aerialViewUrl: string;
}

// Pricing Types
export interface PricingInput {
  sqFt: number;
  costPerSqFt?: number;
  targetProfit?: number;
  commissionRate?: number;
  includeGutters?: boolean;
  perimeterFt?: number;
  gutterPricePerFt?: number;
  tier1DealerFee?: number;
  tier2DealerFee?: number;
  tier3DealerFee?: number;
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

// Property Value Types
export interface PropertyValue {
  price: number;
  priceRangeLow: number;
  priceRangeHigh: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  yearBuilt?: number;
  propertyType?: string;
}

// API Response Types
export interface RoofAnalysisResponse {
  success: boolean;
  data?: RoofData;
  error?: string;
}

export interface GeocodeResponse {
  success: boolean;
  data?: GeocodeResult;
  error?: string;
}

export interface PropertyValueResponse {
  success: boolean;
  data?: PropertyValue;
  error?: string;
}

// Combined Estimate Type
export interface EstimateData {
  address: GeocodeResult;
  roof: RoofData;
  pricing: PricingOutput;
  propertyValue?: PropertyValue;
}
