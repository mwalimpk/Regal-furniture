import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_CURRENCY_RATE,
  MIN_ZWG_RATE_ADJUSTMENT,
  convertCurrencyAmount,
  formatConvertedCurrency,
  normalizeStoreCurrency,
  type CurrencyRateSnapshot,
  type StoreCurrency,
} from "@/lib/currency";

const CURRENCY_STORAGE_KEY = "regal-storefront-currency";

interface CurrencyContextType {
  currency: StoreCurrency;
  setCurrency: (currency: StoreCurrency) => void;
  convert: (amount: number, sourceCurrency?: string) => number;
  format: (amount: number, sourceCurrency?: string) => string;
  formatConverted: (amount: number) => string;
  rate: number;
  rateAdjustmentZwg: number;
  rateSource: CurrencyRateSnapshot["source"];
  rateUpdatedAt: string | null;
  isLoadingRate: boolean;
  refreshRate: () => void;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  setCurrency: () => {},
  convert: (amount) => amount,
  format: (amount) => formatConvertedCurrency(amount, "USD"),
  formatConverted: (amount) => formatConvertedCurrency(amount, "USD"),
  rate: DEFAULT_CURRENCY_RATE.rate,
  rateAdjustmentZwg: DEFAULT_CURRENCY_RATE.rateAdjustmentZwg,
  rateSource: DEFAULT_CURRENCY_RATE.source,
  rateUpdatedAt: null,
  isLoadingRate: false,
  refreshRate: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<StoreCurrency>(() => {
    if (typeof window === "undefined") return "USD";
    return normalizeStoreCurrency(window.localStorage.getItem(CURRENCY_STORAGE_KEY));
  });

  const {
    data: rateSnapshot = DEFAULT_CURRENCY_RATE,
    isLoading: isLoadingRate,
    refetch,
  } = useQuery({
    queryKey: ["currency-rate"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("currency-rate", { body: {} });
      if (error) throw new Error(error.message);
      const row = (data || {}) as Partial<CurrencyRateSnapshot>;
      const legacyRow = row as Partial<CurrencyRateSnapshot> & { marginUsd?: number };
      const rate = Number(row.rate);
      const baseRate = Number(row.baseRate);
      const adjustment = Number(row.rateAdjustmentZwg ?? legacyRow.marginUsd);
      const safeAdjustment = Number.isFinite(adjustment) ? Math.max(MIN_ZWG_RATE_ADJUSTMENT, adjustment) : DEFAULT_CURRENCY_RATE.rateAdjustmentZwg;
      const providedRate = Number.isFinite(rate) && rate > 0 ? rate : DEFAULT_CURRENCY_RATE.rate;
      const hasBaseRate = Number.isFinite(baseRate) && baseRate > 0;
      const isLegacyPayload = row.rateAdjustmentZwg === undefined && legacyRow.marginUsd !== undefined;
      const safeBaseRate = hasBaseRate ? baseRate : isLegacyPayload ? providedRate : Math.max(0.000001, providedRate - safeAdjustment);
      return {
        rate: hasBaseRate || isLegacyPayload ? safeBaseRate + safeAdjustment : providedRate,
        baseRate: safeBaseRate,
        rateAdjustmentZwg: safeAdjustment,
        source: row.source || DEFAULT_CURRENCY_RATE.source,
        updatedAt: row.updatedAt || null,
        autoUpdate: row.autoUpdate !== false,
      } satisfies CurrencyRateSnapshot;
    },
    staleTime: 30 * 60 * 1000,
    refetchInterval: 60 * 60 * 1000,
  });

  useEffect(() => {
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    void refetch();
  }, [currency, refetch]);

  const value = useMemo<CurrencyContextType>(() => {
    const setCurrency = (nextCurrency: StoreCurrency) => setCurrencyState(nextCurrency);

    const convert = (amount: number, sourceCurrency = "USD") => {
      return convertCurrencyAmount({
        amount,
        sourceCurrency,
        targetCurrency: currency,
        rate: rateSnapshot.rate,
      });
    };

    const format = (amount: number, sourceCurrency = "USD") =>
      formatConvertedCurrency(convert(amount, sourceCurrency), currency);

    return {
      currency,
      setCurrency,
      convert,
      format,
      formatConverted: (amount) => formatConvertedCurrency(amount, currency),
      rate: rateSnapshot.rate,
      rateAdjustmentZwg: rateSnapshot.rateAdjustmentZwg,
      rateSource: rateSnapshot.source,
      rateUpdatedAt: rateSnapshot.updatedAt,
      isLoadingRate,
      refreshRate: () => {
        void refetch();
      },
    };
  }, [currency, isLoadingRate, rateSnapshot, refetch]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};
