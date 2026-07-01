export type StoreCurrency = "USD" | "ZWG";

export type CurrencyRateSnapshot = {
  rate: number;
  baseRate: number;
  rateAdjustmentZwg: number;
  source: "live" | "live-cache" | "stale-cache" | "manual" | "fallback";
  updatedAt: string | null;
  autoUpdate: boolean;
};

export type CurrencySettings = {
  id: string;
  auto_update: boolean;
  manual_rate: number;
  fallback_rate: number;
  profit_margin_usd: number;
  cache_hours: number;
  rate_source_url: string;
  last_live_rate: number | null;
  last_rate_updated_at: string | null;
  updated_at: string;
  user_id: string | null;
};

export const MIN_ZWG_RATE_ADJUSTMENT = 7;

export const DEFAULT_CURRENCY_RATE: CurrencyRateSnapshot = {
  rate: 27 + MIN_ZWG_RATE_ADJUSTMENT,
  baseRate: 27,
  rateAdjustmentZwg: MIN_ZWG_RATE_ADJUSTMENT,
  source: "fallback",
  updatedAt: null,
  autoUpdate: true,
};

export const normalizeStoreCurrency = (value: unknown): StoreCurrency =>
  String(value || "").toUpperCase() === "ZWG" || String(value || "").toUpperCase() === "ZWL"
    ? "ZWG"
    : "USD";

export const formatConvertedCurrency = (value: number, currency: StoreCurrency) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeValue);

  return currency === "USD" ? `$${formatted}` : `ZWG ${formatted}`;
};

export const convertCurrencyAmount = ({
  amount,
  sourceCurrency,
  targetCurrency,
  rate,
}: {
  amount: number;
  sourceCurrency: string;
  targetCurrency: StoreCurrency;
  rate: number;
}) => {
  const safeAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  const safeRate = Number.isFinite(Number(rate)) && Number(rate) > 0 ? Number(rate) : DEFAULT_CURRENCY_RATE.rate;
  const source = normalizeStoreCurrency(sourceCurrency);

  if (source === targetCurrency) return safeAmount;
  if (source === "USD") return safeAmount * safeRate;
  return safeAmount / safeRate;
};
