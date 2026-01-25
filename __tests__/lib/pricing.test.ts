import { calculatePricing, DEFAULT_PRICING } from "@/lib/pricing";

describe("calculatePricing", () => {
  describe("with default values", () => {
    it("should calculate correct cash price for a standard roof", () => {
      const result = calculatePricing({ sqFt: 2000 });

      // Base cost: 2000 * 4.50 = 9000
      // Cash price formula: (9000 + 2000) / 2000 / (1 - 0.10) = 6.11 per sqft
      // Total cash: 6.11 * 2000 = 12,222.22
      expect(result.cost).toBe(9000);
      expect(result.pricePerSqFtCash).toBeCloseTo(6.111, 2);
      expect(result.priceCash).toBeCloseTo(12222.22, 2);
    });

    it("should calculate correct dealer fee prices", () => {
      const result = calculatePricing({ sqFt: 2000 });

      // 5% dealer: cashPrice / (1 - 0.05)
      expect(result.pricePerSqFt5Dealer).toBeCloseTo(6.433, 2);
      expect(result.price5Dealer).toBeCloseTo(12865.5, 0);

      // 10% dealer: cashPrice / (1 - 0.10)
      expect(result.pricePerSqFt10Dealer).toBeCloseTo(6.79, 2);
      expect(result.price10Dealer).toBeCloseTo(13580.25, 0);
    });

    it("should calculate correct commissions", () => {
      const result = calculatePricing({ sqFt: 2000 });

      // Commission is 10% of total price
      expect(result.commissionCash).toBeCloseTo(1222.22, 2);
      expect(result.commission5Dealer).toBeCloseTo(1286.55, 0);
      expect(result.commission10Dealer).toBeCloseTo(1358.02, 0);
    });

    it("should calculate 13% fee correctly", () => {
      const result = calculatePricing({ sqFt: 2000 });

      // Fee13 is 13% of cash price
      expect(result.fee13).toBeCloseTo(result.priceCash * 0.13, 2);
    });
  });

  describe("with custom parameters", () => {
    it("should use custom cost per sqft", () => {
      const result = calculatePricing({ sqFt: 1000, costPerSqFt: 5.0 });

      // Base cost: 1000 * 5.00 = 5000
      expect(result.cost).toBe(5000);
    });

    it("should use custom target profit", () => {
      const result = calculatePricing({ sqFt: 1000, targetProfit: 3000 });

      // With higher profit, price should be higher
      const defaultResult = calculatePricing({ sqFt: 1000 });
      expect(result.priceCash).toBeGreaterThan(defaultResult.priceCash);
    });

    it("should use custom commission rate", () => {
      const result = calculatePricing({ sqFt: 1000, commissionRate: 0.15 });

      // With higher commission rate, price should be higher
      const defaultResult = calculatePricing({ sqFt: 1000 });
      expect(result.priceCash).toBeGreaterThan(defaultResult.priceCash);
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
      expect(result.finalTotal).toBe(result.priceCash);
    });

    it("should calculate gutter total correctly", () => {
      const result = calculatePricing({
        sqFt: 2000,
        includeGutters: true,
        perimeterFt: 200,
        gutterPricePerFt: 15,
      });

      expect(result.gutterTotal).toBe(3000); // 200 * 15
      expect(result.finalTotal).toBe(result.priceCash + 3000);
    });

    it("should use custom gutter price per foot", () => {
      const result = calculatePricing({
        sqFt: 2000,
        includeGutters: true,
        perimeterFt: 100,
        gutterPricePerFt: 20,
      });

      expect(result.gutterTotal).toBe(2000); // 100 * 20
    });
  });

  describe("with example from spec", () => {
    it("should match spec example for 3957 sqft roof", () => {
      const result = calculatePricing({ sqFt: 3957 });

      // From spec: cost = 3957 * 4.50 = $17,806.50
      expect(result.cost).toBeCloseTo(17806.5, 1);

      // Profit should be default $2000
      expect(result.profit).toBe(2000);
    });
  });

  describe("edge cases", () => {
    it("should handle small roof sizes", () => {
      const result = calculatePricing({ sqFt: 500 });

      expect(result.cost).toBe(2250);
      expect(result.priceCash).toBeGreaterThan(0);
    });

    it("should handle large roof sizes", () => {
      const result = calculatePricing({ sqFt: 10000 });

      expect(result.cost).toBe(45000);
      expect(result.priceCash).toBeGreaterThan(result.cost);
    });

    it("should calculate 18% and 23% fee options", () => {
      const result = calculatePricing({ sqFt: 2000 });

      // 18% fee should be higher than 10%
      expect(result.pricePerSqFt18Fee).toBeGreaterThan(
        result.pricePerSqFt10Dealer
      );

      // 23% fee should be highest
      expect(result.pricePerSqFt23Fee).toBeGreaterThan(
        result.pricePerSqFt18Fee
      );
    });
  });
});

describe("DEFAULT_PRICING", () => {
  it("should have correct default values from spec", () => {
    expect(DEFAULT_PRICING.costPerSqFt).toBe(4.5);
    expect(DEFAULT_PRICING.targetProfit).toBe(2000);
    expect(DEFAULT_PRICING.commissionRate).toBe(0.1);
    expect(DEFAULT_PRICING.gutterPricePerFt).toBe(15);
  });
});
