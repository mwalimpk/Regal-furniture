import { createContext, useContext, useState, ReactNode } from "react";

type Currency = "USD" | "ZWG";

const ZWG_RATE = 27; // approximate ZWG per USD

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  convert: (usdPrice: number) => number;
  format: (usdPrice: number) => string;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  setCurrency: () => {},
  convert: (p) => p,
  format: (p) => `$${p}`,
  symbol: "$",
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>("USD");

  const convert = (usdPrice: number) =>
    currency === "USD" ? usdPrice : Math.round(usdPrice * ZWG_RATE);

  const symbol = currency === "USD" ? "$" : "ZWG ";

  const format = (usdPrice: number) => {
    const value = convert(usdPrice);
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
    }
    return `ZWG ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, format, symbol }}>
      {children}
    </CurrencyContext.Provider>
  );
};
