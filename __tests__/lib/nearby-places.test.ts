import { calculateCombinedScore, isChainRestaurant } from "@/lib/google-apis";

describe("calculateCombinedScore - Bayesian Average", () => {
  // Bayesian Average: score = (v/(v+m)) * R + (m/(v+m)) * C
  // Where m=50 (minimum threshold), C=3.8 (prior average)

  it("should return the prior average (3.8) for a place with no reviews", () => {
    const score = calculateCombinedScore(5.0, 0);
    // With 0 reviews, score = 0*R + 1*C = 3.8 regardless of rating
    expect(score).toBeCloseTo(3.8, 1);
  });

  it("should pull low-review high-rating places toward the average", () => {
    // A 5-star place with only 10 reviews should be pulled toward 3.8
    const score = calculateCombinedScore(5.0, 10);
    // weight = 10/60 = 0.167, score = 0.167*5 + 0.833*3.8 ≈ 4.0
    expect(score).toBeGreaterThan(3.8);
    expect(score).toBeLessThan(4.5); // Pulled down from 5.0
  });

  it("should give high-review places scores close to their actual rating", () => {
    // A place with 1000 reviews should have score ≈ actual rating
    const score = calculateCombinedScore(4.5, 1000);
    // weight = 1000/1050 = 0.952, score ≈ 0.952*4.5 + 0.048*3.8 ≈ 4.47
    expect(score).toBeGreaterThan(4.4);
    expect(score).toBeLessThan(4.5);
  });

  it("should rank well-reviewed good places above poorly-reviewed great places", () => {
    // Popular local favorite: 4.3 rating, 800 reviews
    const popularScore = calculateCombinedScore(4.3, 800);
    // Niche spot: 4.9 rating, 15 reviews
    const nicheScore = calculateCombinedScore(4.9, 15);

    // The popular place should win (mass appeal)
    expect(popularScore).toBeGreaterThan(nicheScore);
  });

  it("should give higher scores to places with both high rating and reviews", () => {
    const lowScore = calculateCombinedScore(2.0, 10);    // ~3.5 (pulled up toward 3.8)
    const midScore = calculateCombinedScore(4.0, 200);   // ~3.97
    const highScore = calculateCombinedScore(4.8, 2000); // ~4.78

    expect(highScore).toBeGreaterThan(midScore);
    expect(midScore).toBeGreaterThan(lowScore);
  });

  it("should handle edge case of 1 review", () => {
    const score = calculateCombinedScore(5.0, 1);
    // weight = 1/51 ≈ 0.02, score ≈ 0.02*5 + 0.98*3.8 ≈ 3.82
    expect(score).toBeGreaterThan(3.8);
    expect(score).toBeLessThan(4.0);
  });

  it("should converge to actual rating as reviews increase", () => {
    const rating = 4.5;
    const score50 = calculateCombinedScore(rating, 50);    // 50% weight
    const score200 = calculateCombinedScore(rating, 200);  // 80% weight
    const score1000 = calculateCombinedScore(rating, 1000); // 95% weight

    // Scores should get progressively closer to the actual rating
    expect(Math.abs(score1000 - rating)).toBeLessThan(Math.abs(score200 - rating));
    expect(Math.abs(score200 - rating)).toBeLessThan(Math.abs(score50 - rating));
  });

  it("should give perfect 5.0 rating with many reviews the highest score", () => {
    const perfectScore = calculateCombinedScore(5.0, 10000);
    const goodScore = calculateCombinedScore(4.5, 5000);
    const okScore = calculateCombinedScore(4.0, 1000);

    expect(perfectScore).toBeGreaterThan(goodScore);
    expect(goodScore).toBeGreaterThan(okScore);
  });

  it("should pull low ratings up toward average when reviews are low", () => {
    // A 2-star place with few reviews gets pulled UP toward 3.8
    const score = calculateCombinedScore(2.0, 5);
    // weight = 5/55 ≈ 0.09, score ≈ 0.09*2 + 0.91*3.8 ≈ 3.64
    expect(score).toBeGreaterThan(3.0);
    expect(score).toBeLessThan(3.8);
  });
});

describe("isChainRestaurant", () => {
  it("should identify common chain restaurants", () => {
    expect(isChainRestaurant("McDonald's")).toBe(true);
    expect(isChainRestaurant("Burger King")).toBe(true);
    expect(isChainRestaurant("Starbucks Coffee")).toBe(true);
    expect(isChainRestaurant("Chipotle Mexican Grill")).toBe(true);
    expect(isChainRestaurant("Chick-fil-A")).toBe(true);
    expect(isChainRestaurant("Subway")).toBe(true);
    expect(isChainRestaurant("Taco Bell")).toBe(true);
    expect(isChainRestaurant("Wendy's")).toBe(true);
    expect(isChainRestaurant("Domino's Pizza")).toBe(true);
    expect(isChainRestaurant("Pizza Hut")).toBe(true);
  });

  it("should be case-insensitive", () => {
    expect(isChainRestaurant("MCDONALD'S")).toBe(true);
    expect(isChainRestaurant("starbucks")).toBe(true);
    expect(isChainRestaurant("ChIcK-FiL-a")).toBe(true);
  });

  it("should not flag local restaurants", () => {
    expect(isChainRestaurant("Joe's Diner")).toBe(false);
    expect(isChainRestaurant("Maria's Italian Kitchen")).toBe(false);
    expect(isChainRestaurant("The Local Pub")).toBe(false);
    expect(isChainRestaurant("Sushi Palace")).toBe(false);
    expect(isChainRestaurant("Dragon Garden")).toBe(false);
  });

  it("should identify chains with variations in name", () => {
    expect(isChainRestaurant("Chick Fil A")).toBe(true);
    expect(isChainRestaurant("In-N-Out Burger")).toBe(true);
    expect(isChainRestaurant("In N Out")).toBe(true);
    expect(isChainRestaurant("Carl's Jr.")).toBe(true);
    expect(isChainRestaurant("Carls Jr")).toBe(true);
  });
});
