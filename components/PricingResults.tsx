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

  const tier1Total = pricing.priceCash + adjustments;
  const tier2Total = pricing.price5Dealer + adjustments;
  const tier3Total = pricing.price10Dealer + adjustments;

  return (
    <div className="card overflow-hidden">
      <div className="section-header">
        <h2 className="section-title">Pricing Estimate</h2>
        <p className="section-subtitle">
          Based on {formatNumber(sqFt)} sq ft roof area
          {hasAdjustments && " (includes roof feature adjustments)"}
        </p>
      </div>

      <div className="p-6">
        {/* Main Pricing Options */}
        <div className="grid gap-5 sm:grid-cols-3">
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
          <div className="mt-6 rounded-xl bg-gradient-to-r from-amber-50 to-amber-50/50 border border-amber-200/60 p-4">
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
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-primary-50 via-primary-100/50 to-white border-2 border-primary-200 p-4">
            <h3 className="text-sm font-medium text-primary-700 mb-3">
              Estimated Totals (Base + Adjustments)
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-primary-100 p-3">
                <p className="text-xs text-primary-600">Tier 1 - Cash</p>
                <p className="font-display text-lg font-bold text-primary-900">{formatCurrency(tier1Total)}</p>
              </div>
              <div className="rounded-lg bg-white/50 p-3">
                <p className="text-xs text-primary-600">Tier 2 - Standard</p>
                <p className="font-display text-lg font-bold text-primary-900">{formatCurrency(tier2Total)}</p>
              </div>
              <div className="rounded-lg bg-white/50 p-3">
                <p className="text-xs text-primary-600">Tier 3 - Premium</p>
                <p className="font-display text-lg font-bold text-primary-900">{formatCurrency(tier3Total)}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-primary-600 text-center">
              Adjustments: +{formatCurrency(adjustments)} added to each tier
            </p>
          </div>
        )}

        {/* Complete Wood Replacement Cost */}
        <div className="mt-6 rounded-2xl bg-neutral-900 text-white p-5">
          <h3 className="text-sm font-medium text-neutral-300">Complete Wood Replacement Cost</h3>
          <p className="mt-2 font-display text-2xl font-bold text-white">
            {formatCurrency((sqFt / 32) * 145)}
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Based on {formatNumber(sqFt)} sq ft / 32 x $145
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

  if (highlight) {
    return (
      <div className="relative rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-5 text-white shadow-lg shadow-primary-600/20">
        <div className="absolute top-3 right-3">
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
            Best Value
          </span>
        </div>
        <h3 className="text-sm font-medium text-primary-100">{title}</h3>
        {subtitle && <p className="text-xs text-primary-200">{subtitle}</p>}
        <p className="mt-2 font-display text-2xl font-bold text-white">
          {formatCurrency(price)}
        </p>
        <dl className="mt-3 space-y-1 text-xs">
          <div className="flex justify-between">
            <dt className="text-primary-200">Per sq ft</dt>
            <dd className="font-medium text-white">{formatCurrency(pricePerSqFt)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-primary-200">Commission</dt>
            <dd className="font-medium text-emerald-300">{formatCurrency(commission)}</dd>
          </div>
          {hasAdjustment && (
            <>
              <div className="flex justify-between border-t border-white/20 pt-1 mt-1">
                <dt className="text-amber-200">+ Adjustments</dt>
                <dd className="font-medium text-amber-200">{formatCurrency(adjustment)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-white">Total</dt>
                <dd className="font-bold text-white">{formatCurrency(total!)}</dd>
              </div>
            </>
          )}
        </dl>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-neutral-200 p-5">
      <h3 className="text-sm font-medium text-neutral-700">{title}</h3>
      {subtitle && <p className="text-xs text-neutral-400">{subtitle}</p>}
      <p className="mt-2 font-display text-2xl font-bold text-neutral-900">
        {formatCurrency(price)}
      </p>
      <dl className="mt-3 space-y-1 text-xs">
        <div className="flex justify-between">
          <dt className="text-neutral-500">Per sq ft</dt>
          <dd className="font-medium text-neutral-700">{formatCurrency(pricePerSqFt)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-500">Commission</dt>
          <dd className="font-medium text-green-600">{formatCurrency(commission)}</dd>
        </div>
        {hasAdjustment && (
          <>
            <div className="flex justify-between border-t border-neutral-200 pt-1 mt-1">
              <dt className="text-amber-600">+ Adjustments</dt>
              <dd className="font-medium text-amber-600">{formatCurrency(adjustment)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-neutral-700">Total</dt>
              <dd className="font-bold text-neutral-900">{formatCurrency(total!)}</dd>
            </div>
          </>
        )}
      </dl>
    </div>
  );
}
