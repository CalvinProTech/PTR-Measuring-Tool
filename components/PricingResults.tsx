import type { PricingOutput, RoofFeatureAdjustments } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface PricingResultsProps {
  pricing: PricingOutput;
  sqFt: number;
  roofFeatures?: RoofFeatureAdjustments;
}

export function PricingResults({ pricing, sqFt, roofFeatures }: PricingResultsProps) {
  const hasAdjustments = pricing.roofFeatureAdjustments.totalAdjustments > 0;
  const adjustments = pricing.roofFeatureAdjustments.totalAdjustments;

  // Calculate totals for each tier (base + adjustments)
  const tier1Total = pricing.priceCash + adjustments;
  const tier2Total = pricing.price5Dealer + adjustments;
  const tier3Total = pricing.price10Dealer + adjustments;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Pricing Estimate</h2>
        <p className="mt-1 text-sm text-gray-500">
          Based on {formatNumber(sqFt)} sq ft roof area
          {hasAdjustments && " (includes roof feature adjustments)"}
        </p>
      </div>

      <div className="p-6">
        {/* Main Pricing Options */}
        <div className="grid gap-4 sm:grid-cols-3">
          <PriceCard
            title="Tier 1 - Cash"
            price={pricing.priceCash}
            pricePerSqFt={pricing.pricePerSqFtCash}
            commission={pricing.commissionCash}
            adjustment={hasAdjustments ? adjustments : undefined}
            total={hasAdjustments ? tier1Total : undefined}
            highlight
          />
          <PriceCard
            title="Tier 2 - Standard"
            price={pricing.price5Dealer}
            pricePerSqFt={pricing.pricePerSqFt5Dealer}
            commission={pricing.commission5Dealer}
            adjustment={hasAdjustments ? adjustments : undefined}
            total={hasAdjustments ? tier2Total : undefined}
          />
          <PriceCard
            title="Tier 3 - Premium"
            price={pricing.price10Dealer}
            pricePerSqFt={pricing.pricePerSqFt10Dealer}
            commission={pricing.commission10Dealer}
            adjustment={hasAdjustments ? adjustments : undefined}
            total={hasAdjustments ? tier3Total : undefined}
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

        {/* Grand Total with Adjustments - All Tiers */}
        {hasAdjustments && (
          <div className="mt-6 rounded-lg border-2 border-primary-300 bg-primary-50 p-4">
            <h3 className="text-sm font-medium text-primary-700 mb-3">
              Estimated Totals (Base + Adjustments)
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-primary-100 p-3">
                <p className="text-xs text-primary-600">Tier 1 - Cash</p>
                <p className="text-lg font-bold text-primary-900">{formatCurrency(tier1Total)}</p>
              </div>
              <div className="rounded-md bg-white/50 p-3">
                <p className="text-xs text-primary-600">Tier 2 - Standard</p>
                <p className="text-lg font-bold text-primary-900">{formatCurrency(tier2Total)}</p>
              </div>
              <div className="rounded-md bg-white/50 p-3">
                <p className="text-xs text-primary-600">Tier 3 - Premium</p>
                <p className="text-lg font-bold text-primary-900">{formatCurrency(tier3Total)}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-primary-600 text-center">
              Adjustments: +{formatCurrency(adjustments)} added to each tier
            </p>
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
  subtitle?: string;
  price: number;
  pricePerSqFt: number;
  commission: number;
  adjustment?: number;
  total?: number;
  highlight?: boolean;
}

function PriceCard({
  title,
  subtitle,
  price,
  pricePerSqFt,
  commission,
  adjustment,
  total,
  highlight = false,
}: PriceCardProps) {
  const hasAdjustment = adjustment !== undefined && adjustment > 0;

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
      {subtitle && (
        <p className={`text-xs ${highlight ? "text-primary-500" : "text-gray-400"}`}>
          {subtitle}
        </p>
      )}
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
        {hasAdjustment && (
          <>
            <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
              <dt className="text-amber-600">+ Adjustments</dt>
              <dd className="font-medium text-amber-600">
                {formatCurrency(adjustment)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className={`font-medium ${highlight ? "text-primary-700" : "text-gray-700"}`}>
                Total
              </dt>
              <dd className={`font-bold ${highlight ? "text-primary-800" : "text-gray-900"}`}>
                {formatCurrency(total!)}
              </dd>
            </div>
          </>
        )}
      </dl>
    </div>
  );
}
