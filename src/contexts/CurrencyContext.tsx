import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  CURRENCY_SETTINGS_REFRESH_KEY,
  DEFAULT_CURRENCY_RATE,
  convertCurrencyAmount,
  formatConvertedCurrency,
  normalizeStoreCurrency,
  resolveCurrencyRateSnapshot,
  type CurrencyRateSnapshot,
  type CurrencySettings,
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
  marginUsd: number;
  marginEnabled: boolean;
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
  marginUsd: DEFAULT_CURRENCY_RATE.marginUsd,
  marginEnabled: DEFAULT_CURRENCY_RATE.marginEnabled,
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
      const [rateResponse, settingsResponse] = await Promise.all([
        supabase.functions.invoke("currency-rate", { body: {} }),
        supabase.from("currency_settings").select("*").eq("id", "storefront").maybeSingle(),
      ]);

      if (rateResponse.error) throw new Error(rateResponse.error.message);
      if (settingsResponse.error) throw new Error(settingsResponse.error.message);

      return resolveCurrencyRateSnapshot(
        (rateResponse.data || {}) as Partial<CurrencyRateSnapshot>,
        (settingsResponse.data || null) as Partial<CurrencySettings> | null,
      );
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchInterval: 60 * 60 * 1000,
  });

  useEffect(() => {
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    void refetch();
  }, [currency, refetch]);

  useEffect(() => {
    const refreshPricing = () => {
      void refetch();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === CURRENCY_SETTINGS_REFRESH_KEY) refreshPricing();
    };

    window.addEventListener("storage", handleStorage);

    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CURRENCY_SETTINGS_REFRESH_KEY) : null;
    channel?.addEventListener("message", refreshPricing);

    return () => {
      window.removeEventListener("storage", handleStorage);
      channel?.removeEventListener("message", refreshPricing);
      channel?.close();
    };
  }, [refetch]);

  const value = useMemo<CurrencyContextType>(() => {
    const setCurrency = (nextCurrency: StoreCurrency) => setCurrencyState(nextCurrency);

    const convert = (amount: number, sourceCurrency = "USD") => {
      return convertCurrencyAmount({
        amount,
        sourceCurrency,
        targetCurrency: currency,
        rate: rateSnapshot.rate,
        marginUsd: rateSnapshot.marginUsd,
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
      marginUsd: rateSnapshot.marginUsd,
      marginEnabled: rateSnapshot.marginEnabled,
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
