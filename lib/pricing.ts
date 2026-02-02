import type { PricingInput, PricingOutput } from "@/types";

/**
 * Default pricing configuration based on ProTech Price Guide
 *
 * Pricing Formula:
 *   Total Fee = Base Commission (30%) + Dealer Fee (per tier)
 *   Revenue = (sqFt × costPerSqFt + targetProfit) / (1 - totalFee)
 *   PricePerSqFt = Revenue / sqFt
 *
 * Base Commission breakdown (fixed at 30%):
 *   - Agent: 10%
 *   - Owner: 10%
 *   - Lead: 10%
 */
export const DEFAULT_PRICING = {
  costPerSqFt: 5.0,       // Base cost per sq ft
  targetProfit: 2000,     // Target profit (main adjustment knob)
  baseCommission: 0.30,   // Fixed 30% (agent 10% + owner 10% + lead 10%)
  gutterPricePerFt: 15.0,
  tier1DealerFee: 0,      // Cash - no dealer fee, total = 30%
  tier2DealerFee: 0.1,    // 10% dealer fee, total = 40%
  tier3DealerFee: 0.15,   // 15% dealer fee, total = 45%
  // Roof feature adjustment prices (per unit)
  solarPanelPricePerUnit: 150.0,
  skylightPricePerUnit: 200.0,
  satellitePricePerUnit: 75.0,
} as const;

/** Base commission rate (fixed at 30%) */
export const BASE_COMMISSION_RATE = 0.30;

/** Minimum valid square footage */
const MIN_SQFT = 1;

/** Maximum dealer fee rate (must be less than 70% to keep total under 100%) */
const MAX_DEALER_FEE = 0.69;

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

  const feeFields = [
    { name: "tier1DealerFee", value: input.tier1DealerFee },
    { name: "tier2DealerFee", value: input.tier2DealerFee },
    { name: "tier3DealerFee", value: input.tier3DealerFee },
  ];

  for (const { name, value } of feeFields) {
    if (value !== undefined && (value < 0 || value > MAX_DEALER_FEE)) {
      throw new Error(`${name} must be between 0 and ${MAX_DEALER_FEE * 100}%. Received: ${value}`);
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
 * New Formula (based on ProTech Price Guide):
 *   Total Fee = Base Commission (30%) + Dealer Fee (per tier)
 *   Revenue = (sqFt × costPerSqFt + targetProfit) / (1 - totalFee)
 *   PricePerSqFt = Revenue / sqFt
 *
 * Example for 1000 sq ft at Tier 2 (10% dealer):
 *   Total Fee = 30% + 10% = 40%
 *   Revenue = (1000 × 5 + 2000) / 0.60 = $11,666.67
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

  // Base cost (materials + labor)
  const cost = sqFt * costPerSqFt;

  // Calculate total fees for each tier (base commission + dealer fee)
  const totalFeeTier1 = BASE_COMMISSION_RATE + tier1DealerFee;  // 30% + 0% = 30%
  const totalFeeTier2 = BASE_COMMISSION_RATE + tier2DealerFee;  // 30% + 10% = 40%
  const totalFeeTier3 = BASE_COMMISSION_RATE + tier3DealerFee;  // 30% + 15% = 45%

  // Calculate revenue for each tier
  // Formula: Revenue = (cost + profit) / (1 - totalFee)
  const revenueTier1 = (cost + targetProfit) / (1 - totalFeeTier1);
  const revenueTier2 = (cost + targetProfit) / (1 - totalFeeTier2);
  const revenueTier3 = (cost + targetProfit) / (1 - totalFeeTier3);

  // Price per sq ft for each tier
  const pricePerSqFtCash = revenueTier1 / sqFt;      // Tier 1 (Cash/0% dealer)
  const pricePerSqFt5Dealer = revenueTier2 / sqFt;   // Tier 2 (10% dealer)
  const pricePerSqFt10Dealer = revenueTier3 / sqFt;  // Tier 3 (15% dealer)

  // Additional fee tiers (18% and 23% dealer fees)
  const totalFee18 = BASE_COMMISSION_RATE + 0.18;  // 48%
  const totalFee23 = BASE_COMMISSION_RATE + 0.23;  // 53%
  const pricePerSqFt18Fee = (cost + targetProfit) / (1 - totalFee18) / sqFt;
  const pricePerSqFt23Fee = (cost + targetProfit) / (1 - totalFee23) / sqFt;

  // Total prices (same as revenue for each tier)
  const priceCash = revenueTier1;
  const price5Dealer = revenueTier2;
  const price10Dealer = revenueTier3;

  // Commission calculations (10% of total price for agent commission display)
  const agentCommissionRate = 0.10;
  const commissionCash = priceCash * agentCommissionRate;
  const commission5Dealer = price5Dealer * agentCommissionRate;
  const commission10Dealer = price10Dealer * agentCommissionRate;

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

  // Final total (using Tier 2 price as base + gutters + adjustments)
  const finalTotal = price5Dealer + gutterTotal + totalAdjustments;

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
