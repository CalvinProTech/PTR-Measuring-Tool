import type { PricingOutput } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface PricingResultsProps {
  pricing: PricingOutput;
  sqFt: number;
}

export function PricingResults({ pricing, sqFt }: PricingResultsProps) {
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
            title="Cash Price"
            price={pricing.priceCash}
            pricePerSqFt={pricing.pricePerSqFtCash}
            commission={pricing.commissionCash}
            highlight
          />
          <PriceCard
            title="5% Dealer Fee"
            price={pricing.price5Dealer}
            pricePerSqFt={pricing.pricePerSqFt5Dealer}
            commission={pricing.commission5Dealer}
          />
          <PriceCard
            title="10% Dealer Fee"
            price={pricing.price10Dealer}
            pricePerSqFt={pricing.pricePerSqFt10Dealer}
            commission={pricing.commission10Dealer}
          />
        </div>

        {/* Cost Breakdown */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-medium text-gray-700">Cost Breakdown</h3>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-gray-500">Base Cost</dt>
              <dd className="font-medium text-gray-900">
                {formatCurrency(pricing.cost)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Target Profit</dt>
              <dd className="font-medium text-gray-900">
                {formatCurrency(pricing.profit)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">13% Fee</dt>
              <dd className="font-medium text-gray-900">
                {formatCurrency(pricing.fee13)}
              </dd>
            </div>
            {pricing.gutterTotal > 0 && (
              <div>
                <dt className="text-gray-500">Gutter Add-on</dt>
                <dd className="font-medium text-gray-900">
                  {formatCurrency(pricing.gutterTotal)}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Additional Fee Options */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700">
            Additional Financing Options
          </h3>
          <div className="mt-3 flex flex-wrap gap-4">
            <div className="rounded-md bg-gray-100 px-3 py-2">
              <span className="text-xs text-gray-500">18% Fee: </span>
              <span className="font-medium text-gray-900">
                {formatCurrency(pricing.pricePerSqFt18Fee * sqFt)}
              </span>
            </div>
            <div className="rounded-md bg-gray-100 px-3 py-2">
              <span className="text-xs text-gray-500">23% Fee: </span>
              <span className="font-medium text-gray-900">
                {formatCurrency(pricing.pricePerSqFt23Fee * sqFt)}
              </span>
            </div>
          </div>
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
