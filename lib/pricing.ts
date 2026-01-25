import type { PricingInput, PricingOutput } from "@/types";

/**
 * Default pricing configuration based on ProTech Pricing Guide
 */
export const DEFAULT_PRICING = {
  costPerSqFt: 4.5,
  targetProfit: 2000,
  commissionRate: 0.1,
  gutterPricePerFt: 15.0,
} as const;

/**
 * Calculate all pricing options based on roof square footage
 *
 * Formula:
 * - Base cost = sqFt * costPerSqFt
 * - Cash price per sqFt = (cost + profit) / sqFt / (1 - commissionRate)
 * - Dealer fee prices = cashPrice / (1 - dealerFee)
 */
export function calculatePricing(input: PricingInput): PricingOutput {
  const {
    sqFt,
    costPerSqFt = DEFAULT_PRICING.costPerSqFt,
    targetProfit = DEFAULT_PRICING.targetProfit,
    commissionRate = DEFAULT_PRICING.commissionRate,
    includeGutters = false,
    perimeterFt = 0,
    gutterPricePerFt = DEFAULT_PRICING.gutterPricePerFt,
  } = input;

  // Base cost
  const cost = sqFt * costPerSqFt;

  // Cash price per sq ft (includes profit and commission)
  // Formula: (cost + profit) / sqFt / (1 - commissionRate)
  const pricePerSqFtCash = (cost + targetProfit) / sqFt / (1 - commissionRate);

  // Dealer fee variations
  const pricePerSqFt5Dealer = pricePerSqFtCash / (1 - 0.05);
  const pricePerSqFt10Dealer = pricePerSqFtCash / (1 - 0.1);
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
    finalTotal,
  };
}
