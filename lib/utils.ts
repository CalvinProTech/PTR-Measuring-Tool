import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as USD currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number with commas and optional decimal places
 */
export function formatNumber(
  value: number,
  decimals: number = 0
): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Convert square meters to square feet
 */
export function sqMetersToSqFeet(meters: number): number {
  return meters * 10.7639;
}

/**
 * Convert meters to feet
 */
export function metersToFeet(meters: number): number {
  return meters * 3.28084;
}

/**
 * Convert pitch angle in degrees to ratio (e.g., 22.6° -> "5/12")
 */
export function pitchDegreesToRatio(degrees: number): string {
  const rise = Math.round(Math.tan((degrees * Math.PI) / 180) * 12);
  return `${rise}/12`;
}
