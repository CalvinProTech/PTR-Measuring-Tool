import { z } from "zod";

/**
 * Address input validation schema
 */
export const addressSchema = z.object({
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must be less than 200 characters"),
});

export type AddressInput = z.infer<typeof addressSchema>;

/**
 * Geocode API response validation
 */
export const geocodeResultSchema = z.object({
  formattedAddress: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
});

/**
 * Roof analysis parameters validation
 */
export const roofAnalysisParamsSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

/**
 * Roof feature adjustments validation (agent inputs)
 */
export const roofFeatureAdjustmentsSchema = z.object({
  hasSolarPanels: z.boolean(),
  solarPanelCount: z.number().int().min(0).max(100),
  hasSkylights: z.boolean(),
  skylightCount: z.number().int().min(0).max(50),
  hasSatellites: z.boolean(),
  satelliteCount: z.number().int().min(0).max(20),
});

export type RoofFeatureAdjustmentsInput = z.infer<typeof roofFeatureAdjustmentsSchema>;

/**
 * Pricing input validation
 */
export const pricingInputSchema = z.object({
  sqFt: z.number().positive("Square footage must be positive"),
  costPerSqFt: z.number().positive().optional(),
  targetProfit: z.number().nonnegative().optional(),
  commissionRate: z.number().min(0).max(1).optional(),
  includeGutters: z.boolean().optional(),
  perimeterFt: z.number().nonnegative().optional(),
  gutterPricePerFt: z.number().positive().optional(),
  roofFeatures: roofFeatureAdjustmentsSchema.optional(),
  solarPanelPricePerUnit: z.number().nonnegative().optional(),
  skylightPricePerUnit: z.number().nonnegative().optional(),
  satellitePricePerUnit: z.number().nonnegative().optional(),
});
