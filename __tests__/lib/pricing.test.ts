import { calculatePricing, DEFAULT_PRICING, validatePricingInput, BASE_COMMISSION_RATE } from "@/lib/pricing";

/**
 * Pricing Formula (ProTech Price Guide):
 *   Total Fee = Base Commission (30%) + Dealer Fee (per tier)
 *   Revenue = (sqFt × costPerSqFt + targetProfit) / (1 - totalFee)
 *   PricePerSqFt = Revenue / sqFt
 *
 * Example for 1000 sq ft at Tier 2 (10% dealer):
 *   Total Fee = 30% + 10% = 40%
 *   Revenue = (1000 × 5 + 2000) / 0.60 = $11,666.67
 */

describe("calculatePricing", () => {
  describe("with default values matching ProTech Price Guide", () => {
    it("should calculate correct Tier 2 price for 1000 sqft (matches Excel)", () => {
      const result = calculatePricing({ sqFt: 1000 });

      // Formula: (1000 * 5 + 2000) / (1 - 0.40) = 7000 / 0.60 = $11,666.67
      expect(result.price5Dealer).toBeCloseTo(11666.67, 0);
      expect(result.pricePerSqFt5Dealer).toBeCloseTo(11.67, 2);
    });

    it("should calculate correct Tier 2 price for 2000 sqft", () => {
      const result = calculatePricing({ sqFt: 2000 });

      // Formula: (2000 * 5 + 2000) / (1 - 0.40) = 12000 / 0.60 = $20,000
      expect(result.price5Dealer).toBeCloseTo(20000, 0);
      expect(result.pricePerSqFt5Dealer).toBeCloseTo(10, 2);
    });

    it("should calculate correct Tier 2 price for 5000 sqft (matches Excel)", () => {
      const result = calculatePricing({ sqFt: 5000 });

      // Formula: (5000 * 5 + 2000) / (1 - 0.40) = 27000 / 0.60 = $45,000
      expect(result.price5Dealer).toBeCloseTo(45000, 0);
      expect(result.pricePerSqFt5Dealer).toBeCloseTo(9, 2);
    });

    it("should calculate correct Tier 1 (Cash) price", () => {
      const result = calculatePricing({ sqFt: 1000 });

      // Tier 1: 30% base commission, 0% dealer fee = 30% total
      // Formula: (1000 * 5 + 2000) / (1 - 0.30) = 7000 / 0.70 = $10,000
      expect(result.priceCash).toBeCloseTo(10000, 0);
      expect(result.pricePerSqFtCash).toBeCloseTo(10, 2);
    });

    it("should calculate correct Tier 3 (15% dealer) price", () => {
      const result = calculatePricing({ sqFt: 1000 });

      // Tier 3: 30% base + 15% dealer = 45% total
      // Formula: (1000 * 5 + 2000) / (1 - 0.45) = 7000 / 0.55 = $12,727.27
      expect(result.price10Dealer).toBeCloseTo(12727.27, 0);
      expect(result.pricePerSqFt10Dealer).toBeCloseTo(12.73, 2);
    });

    it("should calculate base cost correctly", () => {
      const result = calculatePricing({ sqFt: 2000 });

      // Base cost: 2000 * 5.00 = 10,000
      expect(result.cost).toBe(10000);
    });

    it("should calculate correct agent commissions (10% of total)", () => {
      const result = calculatePricing({ sqFt: 1000 });

      // Agent commission is 10% of each tier price
      expect(result.commissionCash).toBeCloseTo(1000, 0);      // 10% of 10,000
      expect(result.commission5Dealer).toBeCloseTo(1166.67, 0); // 10% of 11,666.67
      expect(result.commission10Dealer).toBeCloseTo(1272.73, 0); // 10% of 12,727.27
    });

    it("should calculate 13% fee correctly", () => {
      const result = calculatePricing({ sqFt: 1000 });

      // Fee13 is 13% of Tier 1 (cash) price
      expect(result.fee13).toBeCloseTo(result.priceCash * 0.13, 2);
    });
  });

  describe("with custom parameters", () => {
    it("should use custom cost per sqft", () => {
      const result = calculatePricing({ sqFt: 1000, costPerSqFt: 6.0 });

      // Base cost: 1000 * 6.00 = 6000
      expect(result.cost).toBe(6000);

      // Tier 2: (6000 + 2000) / 0.60 = $13,333.33
      expect(result.price5Dealer).toBeCloseTo(13333.33, 0);
    });

    it("should use custom target profit", () => {
      const result = calculatePricing({ sqFt: 1000, targetProfit: 3000 });

      // Tier 2: (5000 + 3000) / 0.60 = $13,333.33
      expect(result.price5Dealer).toBeCloseTo(13333.33, 0);
    });

    it("should use custom dealer fees", () => {
      const result = calculatePricing({
        sqFt: 1000,
        tier1DealerFee: 0.05,  // 5% instead of 0%
        tier2DealerFee: 0.12,  // 12% instead of 10%
        tier3DealerFee: 0.20,  // 20% instead of 15%
      });

      // Tier 1: 30% + 5% = 35% total
      // (5000 + 2000) / 0.65 = $10,769.23
      expect(result.priceCash).toBeCloseTo(10769.23, 0);

      // Tier 2: 30% + 12% = 42% total
      // (5000 + 2000) / 0.58 = $12,068.97
      expect(result.price5Dealer).toBeCloseTo(12068.97, 0);

      // Tier 3: 30% + 20% = 50% total
      // (5000 + 2000) / 0.50 = $14,000
      expect(result.price10Dealer).toBeCloseTo(14000, 0);
    });
  });

  describe("with gutter add-on", () => {
    it("should not add gutter cost when not included", () => {
      const result = calculatePricing({
        sqFt: 2000,
        includeGutters: false,
        perimeterFt: 200,
      });

      expect(result.gutterTotal).toBe(0);
    });

    it("should calculate gutter total correctly", () => {
      const result = calculatePricing({
        sqFt: 2000,
        includeGutters: true,
        perimeterFt: 200,
        gutterPricePerFt: 15,
      });

      expect(result.gutterTotal).toBe(3000); // 200 * 15
    });

    it("should add gutters to final total (based on Tier 2)", () => {
      const result = calculatePricing({
        sqFt: 1000,
        includeGutters: true,
        perimeterFt: 100,
        gutterPricePerFt: 15,
      });

      // Tier 2 price + gutters
      expect(result.finalTotal).toBeCloseTo(result.price5Dealer + 1500, 0);
    });
  });

  describe("with roof feature adjustments", () => {
    it("should calculate solar panel adjustments", () => {
      const result = calculatePricing({
        sqFt: 1000,
        roofFeatures: {
          hasSolarPanels: true,
          solarPanelCount: 10,
          hasSkylights: false,
          skylightCount: 0,
          hasSatellites: false,
          satelliteCount: 0,
        },
      });

      // 10 panels * $150 = $1,500
      expect(result.roofFeatureAdjustments.solarPanelTotal).toBe(1500);
      expect(result.finalTotal).toBeCloseTo(result.price5Dealer + 1500, 0);
    });

    it("should calculate all feature adjustments", () => {
      const result = calculatePricing({
        sqFt: 1000,
        roofFeatures: {
          hasSolarPanels: true,
          solarPanelCount: 5,
          hasSkylights: true,
          skylightCount: 2,
          hasSatellites: true,
          satelliteCount: 1,
        },
      });

      // Solar: 5 * $150 = $750
      // Skylights: 2 * $200 = $400
      // Satellites: 1 * $75 = $75
      // Total adjustments: $1,225
      expect(result.roofFeatureAdjustments.solarPanelTotal).toBe(750);
      expect(result.roofFeatureAdjustments.skylightTotal).toBe(400);
      expect(result.roofFeatureAdjustments.satelliteTotal).toBe(75);
      expect(result.roofFeatureAdjustments.totalAdjustments).toBe(1225);
    });
  });

  describe("edge cases", () => {
    it("should handle small roof sizes", () => {
      const result = calculatePricing({ sqFt: 100 });

      // Tier 2: (100 * 5 + 2000) / 0.60 = 2500 / 0.60 = $4,166.67
      expect(result.price5Dealer).toBeCloseTo(4166.67, 0);
    });

    it("should handle large roof sizes", () => {
      const result = calculatePricing({ sqFt: 10000 });

      // Tier 2: (10000 * 5 + 2000) / 0.60 = 52000 / 0.60 = $86,666.67
      expect(result.price5Dealer).toBeCloseTo(86666.67, 0);
    });

    it("should calculate 18% and 23% fee options", () => {
      const result = calculatePricing({ sqFt: 1000 });

      // 18% dealer: 30% + 18% = 48% total
      // (7000) / 0.52 = $13,461.54
      expect(result.pricePerSqFt18Fee).toBeCloseTo(13.46, 2);

      // 23% dealer: 30% + 23% = 53% total
      // (7000) / 0.47 = $14,893.62
      expect(result.pricePerSqFt23Fee).toBeCloseTo(14.89, 2);
    });
  });
});

describe("DEFAULT_PRICING", () => {
  it("should have correct default values", () => {
    expect(DEFAULT_PRICING.costPerSqFt).toBe(5.0);
    expect(DEFAULT_PRICING.targetProfit).toBe(2000);
    expect(DEFAULT_PRICING.baseCommission).toBe(0.30);
    expect(DEFAULT_PRICING.gutterPricePerFt).toBe(15);
  });

  it("should have correct tier dealer fees", () => {
    expect(DEFAULT_PRICING.tier1DealerFee).toBe(0);
    expect(DEFAULT_PRICING.tier2DealerFee).toBe(0.1);
    expect(DEFAULT_PRICING.tier3DealerFee).toBe(0.15);
  });

  it("should have correct roof feature prices", () => {
    expect(DEFAULT_PRICING.solarPanelPricePerUnit).toBe(150);
    expect(DEFAULT_PRICING.skylightPricePerUnit).toBe(200);
    expect(DEFAULT_PRICING.satellitePricePerUnit).toBe(75);
  });
});

describe("BASE_COMMISSION_RATE", () => {
  it("should be 30%", () => {
    expect(BASE_COMMISSION_RATE).toBe(0.30);
  });
});

describe("validatePricingInput", () => {
  it("should throw error for zero square footage", () => {
    expect(() => validatePricingInput({ sqFt: 0 })).toThrow(
      "Square footage must be at least 1"
    );
  });

  it("should throw error for negative square footage", () => {
    expect(() => validatePricingInput({ sqFt: -100 })).toThrow(
      "Square footage must be at least 1"
    );
  });

  it("should throw error for negative cost per sq ft", () => {
    expect(() => validatePricingInput({ sqFt: 1000, costPerSqFt: -1 })).toThrow(
      "Cost per sq ft cannot be negative"
    );
  });

  it("should throw error for negative target profit", () => {
    expect(() => validatePricingInput({ sqFt: 1000, targetProfit: -500 })).toThrow(
      "Target profit cannot be negative"
    );
  });

  it("should throw error for dealer fee > 69%", () => {
    expect(() => validatePricingInput({ sqFt: 1000, tier1DealerFee: 0.70 })).toThrow(
      "tier1DealerFee must be between 0 and 69%"
    );
  });

  it("should throw error for negative dealer fee", () => {
    expect(() => validatePricingInput({ sqFt: 1000, tier1DealerFee: -0.1 })).toThrow(
      "tier1DealerFee must be between 0 and 69%"
    );
  });

  it("should throw error for negative perimeter", () => {
    expect(() => validatePricingInput({ sqFt: 1000, perimeterFt: -10 })).toThrow(
      "Perimeter cannot be negative"
    );
  });

  it("should pass for valid input", () => {
    expect(() => validatePricingInput({ sqFt: 1000 })).not.toThrow();
    expect(() => validatePricingInput({
      sqFt: 2000,
      costPerSqFt: 5,
      tier1DealerFee: 0.05,
      tier2DealerFee: 0.10,
      tier3DealerFee: 0.15,
    })).not.toThrow();
  });
});

describe("calculatePricing matches Excel price guide", () => {
  // Test against actual values from the ProTech Price Guide Excel
  const testCases = [
    { sqFt: 100, expectedTier2: 4166.67 },
    { sqFt: 500, expectedTier2: 7500 },
    { sqFt: 1000, expectedTier2: 11666.67 },
    { sqFt: 2000, expectedTier2: 20000 },
    { sqFt: 3000, expectedTier2: 28333.33 },
    { sqFt: 5000, expectedTier2: 45000 },
    { sqFt: 10000, expectedTier2: 86666.67 },
  ];

  testCases.forEach(({ sqFt, expectedTier2 }) => {
    it(`should match Excel for ${sqFt} sqft: $${expectedTier2.toLocaleString()}`, () => {
      const result = calculatePricing({ sqFt });
      expect(result.price5Dealer).toBeCloseTo(expectedTier2, 0);
    });
  });
});
