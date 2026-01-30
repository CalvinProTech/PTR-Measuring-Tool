import type { PricingOutput, RoofFeatureAdjustments } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface PricingResultsProps {
  pricing: PricingOutput;
  sqFt: number;
  roofFeatures?: RoofFeatureAdjustments;
}

export function PricingResults({ pricing, sqFt, roofFeatures }: PricingResultsProps) {
  const hasAdjustments = pricing.roofFeatureAdjustments.totalAdjustments > 0;
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Pricing Estimate</h2>
        <p className="mt-1 text-sm text-gray-500">
          Based on {formatNumber(sqFt)} sq ft roof area
        </p>
      </div>

      <div className="p-6">
        {/* Main Pricing Options */}
        <div className="grid gap-4 sm:grid-cols-3">
          <PriceCard
            title="Tier 1 (Low)"
            price={pricing.priceCash}
            pricePerSqFt={pricing.pricePerSqFtCash}
            commission={pricing.commissionCash}
            highlight
          />
          <PriceCard
            title="Tier 2 (Middle)"
            price={pricing.price5Dealer}
            pricePerSqFt={pricing.pricePerSqFt5Dealer}
            commission={pricing.commission5Dealer}
          />
          <PriceCard
            title="Tier 3 (High)"
            price={pricing.price10Dealer}
            pricePerSqFt={pricing.pricePerSqFt10Dealer}
            commission={pricing.commission10Dealer}
          />
        </div>

        {/* Roof Feature Adjustments */}
        {hasAdjustments && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h3 className="text-sm font-medium text-amber-800">Roof Feature Adjustments</h3>
            <div className="mt-3 space-y-2">
              {pricing.roofFeatureAdjustments.solarPanelTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-amber-700">
                    Solar Panels ({roofFeatures?.solarPanelCount} units)
                  </span>
                  <span className="font-medium text-amber-900">
                    +{formatCurrency(pricing.roofFeatureAdjustments.solarPanelTotal)}
                  </span>
                </div>
              )}
              {pricing.roofFeatureAdjustments.skylightTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-amber-700">
                    Skylights ({roofFeatures?.skylightCount} units)
                  </span>
                  <span className="font-medium text-amber-900">
                    +{formatCurrency(pricing.roofFeatureAdjustments.skylightTotal)}
                  </span>
                </div>
              )}
              {pricing.roofFeatureAdjustments.satelliteTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-amber-700">
                    Satellite Dishes ({roofFeatures?.satelliteCount} units)
                  </span>
                  <span className="font-medium text-amber-900">
                    +{formatCurrency(pricing.roofFeatureAdjustments.satelliteTotal)}
                  </span>
                </div>
              )}
              <div className="mt-2 flex justify-between border-t border-amber-300 pt-2">
                <span className="font-medium text-amber-800">Total Adjustments</span>
                <span className="font-bold text-amber-900">
                  +{formatCurrency(pricing.roofFeatureAdjustments.totalAdjustments)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Grand Total with Adjustments */}
        {hasAdjustments && (
          <div className="mt-6 rounded-lg border-2 border-primary-300 bg-primary-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-primary-700">
                  Estimated Total (Tier 1 + Adjustments)
                </h3>
                <p className="mt-1 text-xs text-primary-600">
                  Base: {formatCurrency(pricing.priceCash)} + Adjustments:{" "}
                  {formatCurrency(pricing.roofFeatureAdjustments.totalAdjustments)}
                </p>
              </div>
              <p className="text-2xl font-bold text-primary-900">
                {formatCurrency(pricing.finalTotal)}
              </p>
            </div>
          </div>
        )}

        {/* Complete Wood Replacement Cost */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-medium text-gray-700">Complete Wood Replacement Cost</h3>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {formatCurrency((sqFt / 32) * 145)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Based on {formatNumber(sqFt)} sq ft / 32 × $145
          </p>
        </div>

      </div>
    </div>
  );
}

interface PriceCardProps {
  title: string;
  price: number;
  pricePerSqFt: number;
  commission: number;
  highlight?: boolean;
}

function PriceCard({
  title,
  price,
  pricePerSqFt,
  commission,
  highlight = false,
}: PriceCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        highlight
          ? "border-primary-200 bg-primary-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <h3
        className={`text-sm font-medium ${
          highlight ? "text-primary-700" : "text-gray-700"
        }`}
      >
        {title}
      </h3>
      <p
        className={`mt-2 text-2xl font-bold ${
          highlight ? "text-primary-900" : "text-gray-900"
        }`}
      >
        {formatCurrency(price)}
      </p>
      <dl className="mt-3 space-y-1 text-xs">
        <div className="flex justify-between">
          <dt className="text-gray-500">Per sq ft</dt>
          <dd className="font-medium text-gray-700">
            {formatCurrency(pricePerSqFt)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Commission</dt>
          <dd className="font-medium text-green-600">
            {formatCurrency(commission)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
