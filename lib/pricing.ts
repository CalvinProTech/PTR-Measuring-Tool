import type { PricingInput, PricingOutput } from "@/types";

/**
 * Default pricing configuration based on ProTech Pricing Guide
 */
export const DEFAULT_PRICING = {
  costPerSqFt: 4.5,
  targetProfit: 2000,
  commissionRate: 0.1,
  gutterPricePerFt: 15.0,
  tier1DealerFee: 0,      // Cash - no fee
  tier2DealerFee: 0.1,    // 10%
  tier3DealerFee: 0.15,   // 15%
  // Roof feature adjustment prices (per unit)
  solarPanelPricePerUnit: 150.0,
  skylightPricePerUnit: 200.0,
  satellitePricePerUnit: 75.0,
} as const;

/** Minimum valid square footage */
const MIN_SQFT = 1;

/** Maximum commission/fee rate (must be less than 1 to avoid division by zero) */
const MAX_RATE = 0.99;

/**
 * Validates pricing input and throws descriptive errors for invalid values.
 */
export function validatePricingInput(input: PricingInput): void {
  if (input.sqFt < MIN_SQFT) {
    throw new Error(`Square footage must be at least ${MIN_SQFT}. Received: ${input.sqFt}`);
  }

  if (input.costPerSqFt !== undefined && input.costPerSqFt < 0) {
    throw new Error(`Cost per sq ft cannot be negative. Received: ${input.costPerSqFt}`);
  }

  if (input.targetProfit !== undefined && input.targetProfit < 0) {
    throw new Error(`Target profit cannot be negative. Received: ${input.targetProfit}`);
  }

  if (input.commissionRate !== undefined && (input.commissionRate < 0 || input.commissionRate >= 1)) {
    throw new Error(`Commission rate must be between 0 and ${MAX_RATE}. Received: ${input.commissionRate}`);
  }

  const feeFields = [
    { name: "tier1DealerFee", value: input.tier1DealerFee },
    { name: "tier2DealerFee", value: input.tier2DealerFee },
    { name: "tier3DealerFee", value: input.tier3DealerFee },
  ];

  for (const { name, value } of feeFields) {
    if (value !== undefined && (value < 0 || value >= 1)) {
      throw new Error(`${name} must be between 0 and ${MAX_RATE}. Received: ${value}`);
    }
  }

  if (input.perimeterFt !== undefined && input.perimeterFt < 0) {
    throw new Error(`Perimeter cannot be negative. Received: ${input.perimeterFt}`);
  }

  if (input.gutterPricePerFt !== undefined && input.gutterPricePerFt < 0) {
    throw new Error(`Gutter price cannot be negative. Received: ${input.gutterPricePerFt}`);
  }

  // Validate roof feature adjustment prices
  if (input.solarPanelPricePerUnit !== undefined && input.solarPanelPricePerUnit < 0) {
    throw new Error(`Solar panel price cannot be negative. Received: ${input.solarPanelPricePerUnit}`);
  }
  if (input.skylightPricePerUnit !== undefined && input.skylightPricePerUnit < 0) {
    throw new Error(`Skylight price cannot be negative. Received: ${input.skylightPricePerUnit}`);
  }
  if (input.satellitePricePerUnit !== undefined && input.satellitePricePerUnit < 0) {
    throw new Error(`Satellite price cannot be negative. Received: ${input.satellitePricePerUnit}`);
  }

  // Validate roof feature counts
  if (input.roofFeatures) {
    if (input.roofFeatures.solarPanelCount < 0) {
      throw new Error(`Solar panel count cannot be negative`);
    }
    if (input.roofFeatures.skylightCount < 0) {
      throw new Error(`Skylight count cannot be negative`);
    }
    if (input.roofFeatures.satelliteCount < 0) {
      throw new Error(`Satellite count cannot be negative`);
    }
  }
}

/**
 * Calculate all pricing options based on roof square footage
 *
 * Formula:
 * - Base cost = sqFt * costPerSqFt
 * - Cash price per sqFt = (cost + profit) / sqFt / (1 - commissionRate)
 * - Dealer fee prices = cashPrice / (1 - dealerFee)
 *
 * @throws {Error} If input validation fails
 */
export function calculatePricing(input: PricingInput): PricingOutput {
  // Validate input before processing
  validatePricingInput(input);

  const {
    sqFt,
    costPerSqFt = DEFAULT_PRICING.costPerSqFt,
    targetProfit = DEFAULT_PRICING.targetProfit,
    commissionRate = DEFAULT_PRICING.commissionRate,
    includeGutters = false,
    perimeterFt = 0,
    gutterPricePerFt = DEFAULT_PRICING.gutterPricePerFt,
    tier1DealerFee = DEFAULT_PRICING.tier1DealerFee,
    tier2DealerFee = DEFAULT_PRICING.tier2DealerFee,
    tier3DealerFee = DEFAULT_PRICING.tier3DealerFee,
    roofFeatures,
    solarPanelPricePerUnit = DEFAULT_PRICING.solarPanelPricePerUnit,
    skylightPricePerUnit = DEFAULT_PRICING.skylightPricePerUnit,
    satellitePricePerUnit = DEFAULT_PRICING.satellitePricePerUnit,
  } = input;

  // Base cost
  const cost = sqFt * costPerSqFt;

  // Cash price per sq ft (includes profit and commission)
  // Formula: (cost + profit) / sqFt / (1 - commissionRate)
  const pricePerSqFtCash = (cost + targetProfit) / sqFt / (1 - commissionRate);

  // Tier pricing using configurable dealer fees
  // Tier 1 = tier1DealerFee (default: 0% - cash)
  // Tier 2 = tier2DealerFee (default: 10%)
  // Tier 3 = tier3DealerFee (default: 15%)
  const pricePerSqFtTier1 = tier1DealerFee > 0 ? pricePerSqFtCash / (1 - tier1DealerFee) : pricePerSqFtCash;
  const pricePerSqFt5Dealer = pricePerSqFtCash / (1 - tier2DealerFee);
  const pricePerSqFt10Dealer = pricePerSqFtCash / (1 - tier3DealerFee);
  const pricePerSqFt18Fee = pricePerSqFtCash / (1 - 0.18);
  const pricePerSqFt23Fee = pricePerSqFtCash / (1 - 0.23);

  // Total prices
  const priceCash = pricePerSqFtTier1 * sqFt;
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

  // Roof feature adjustments
  const solarPanelTotal = roofFeatures?.hasSolarPanels
    ? roofFeatures.solarPanelCount * solarPanelPricePerUnit
    : 0;
  const skylightTotal = roofFeatures?.hasSkylights
    ? roofFeatures.skylightCount * skylightPricePerUnit
    : 0;
  const satelliteTotal = roofFeatures?.hasSatellites
    ? roofFeatures.satelliteCount * satellitePricePerUnit
    : 0;
  const totalAdjustments = solarPanelTotal + skylightTotal + satelliteTotal;

  // Final total (using cash price as base + gutters + adjustments)
  const finalTotal = priceCash + gutterTotal + totalAdjustments;

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
    roofFeatureAdjustments: {
      solarPanelTotal,
      skylightTotal,
      satelliteTotal,
      totalAdjustments,
    },
    finalTotal,
  };
}
