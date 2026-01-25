import {
  cn,
  formatCurrency,
  formatNumber,
  sqMetersToSqFeet,
  metersToFeet,
  pitchDegreesToRatio,
} from "@/lib/utils";

describe("cn", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("should merge conflicting Tailwind classes", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });
});

describe("formatCurrency", () => {
  it("should format positive numbers as USD", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });

  it("should format whole numbers with cents", () => {
    expect(formatCurrency(1000)).toBe("$1,000.00");
  });

  it("should format zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("should format large numbers with commas", () => {
    expect(formatCurrency(1234567.89)).toBe("$1,234,567.89");
  });
});

describe("formatNumber", () => {
  it("should format numbers with commas", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });

  it("should format with specified decimal places", () => {
    expect(formatNumber(1234.5678, 2)).toBe("1,234.57");
  });

  it("should format zero decimals by default", () => {
    expect(formatNumber(1234.9)).toBe("1,235");
  });
});

describe("sqMetersToSqFeet", () => {
  it("should convert square meters to square feet", () => {
    // 1 sq meter = 10.7639 sq feet
    expect(sqMetersToSqFeet(1)).toBeCloseTo(10.7639, 2);
    expect(sqMetersToSqFeet(100)).toBeCloseTo(1076.39, 1);
  });

  it("should handle zero", () => {
    expect(sqMetersToSqFeet(0)).toBe(0);
  });
});

describe("metersToFeet", () => {
  it("should convert meters to feet", () => {
    // 1 meter = 3.28084 feet
    expect(metersToFeet(1)).toBeCloseTo(3.28084, 2);
    expect(metersToFeet(10)).toBeCloseTo(32.8084, 2);
  });

  it("should handle zero", () => {
    expect(metersToFeet(0)).toBe(0);
  });
});

describe("pitchDegreesToRatio", () => {
  it("should convert common pitch angles to ratios", () => {
    // 4/12 pitch is about 18.43 degrees
    expect(pitchDegreesToRatio(18.43)).toBe("4/12");

    // 5/12 pitch is about 22.62 degrees
    expect(pitchDegreesToRatio(22.62)).toBe("5/12");

    // 6/12 pitch is about 26.57 degrees
    expect(pitchDegreesToRatio(26.57)).toBe("6/12");
  });

  it("should handle flat roofs", () => {
    expect(pitchDegreesToRatio(0)).toBe("0/12");
  });

  it("should handle steep pitches", () => {
    // 12/12 pitch is 45 degrees
    expect(pitchDegreesToRatio(45)).toBe("12/12");
  });
});
