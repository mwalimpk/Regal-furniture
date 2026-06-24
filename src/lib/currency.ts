export type StoreCurrency = "USD" | "ZWG";

export const CURRENCY_SETTINGS_REFRESH_KEY = "regal-currency-settings-updated";

export type CurrencyRateSnapshot = {
  rate: number;
  marginUsd: number;
  marginEnabled: boolean;
  source: "live" | "live-cache" | "stale-cache" | "manual" | "fallback";
  updatedAt: string | null;
  autoUpdate: boolean;
};

export type CurrencySettings = {
  id: string;
  auto_update: boolean;
  profit_margin_enabled: boolean;
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

export const DEFAULT_CURRENCY_RATE: CurrencyRateSnapshot = {
  rate: 27,
  marginUsd: 0,
  marginEnabled: false,
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

export const resolveCurrencyRateSnapshot = (
  row: Partial<CurrencyRateSnapshot> = {},
  settings: Partial<CurrencySettings> | null = null,
): CurrencyRateSnapshot => {
  const rate = Number(row.rate);
  const marginEnabled =
    typeof row.marginEnabled === "boolean"
      ? row.marginEnabled
      : settings?.profit_margin_enabled === true;
  const marginValue = Number(row.marginUsd ?? settings?.profit_margin_usd ?? DEFAULT_CURRENCY_RATE.marginUsd);

  return {
    rate: Number.isFinite(rate) && rate > 0 ? rate : DEFAULT_CURRENCY_RATE.rate,
    marginUsd: marginEnabled && Number.isFinite(marginValue) ? Math.max(0, marginValue) : 0,
    marginEnabled,
    source: row.source || DEFAULT_CURRENCY_RATE.source,
    updatedAt: row.updatedAt || settings?.last_rate_updated_at || null,
    autoUpdate: row.autoUpdate !== false,
  };
};

export const convertCurrencyAmount = ({
  amount,
  sourceCurrency,
  targetCurrency,
  rate,
  marginUsd,
}: {
  amount: number;
  sourceCurrency: string;
  targetCurrency: StoreCurrency;
  rate: number;
  marginUsd: number;
}) => {
  const safeAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  const safeRate = Number.isFinite(Number(rate)) && Number(rate) > 0 ? Number(rate) : DEFAULT_CURRENCY_RATE.rate;
  const safeMargin = Math.max(0, Number.isFinite(Number(marginUsd)) ? Number(marginUsd) : 0);
  const source = normalizeStoreCurrency(sourceCurrency);
  const usdAmount = source === "USD" ? safeAmount : safeAmount / safeRate;
  const adjustedUsdAmount = usdAmount + safeMargin;

  if (targetCurrency === "USD") return adjustedUsdAmount;
  return adjustedUsdAmount * safeRate;
};
