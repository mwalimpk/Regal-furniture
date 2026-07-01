import { describe, expect, it } from "vitest";
import { convertCurrencyAmount } from "@/lib/currency";

describe("currency conversion", () => {
  it("converts USD to ZWG using the adjusted exchange rate only", () => {
    expect(convertCurrencyAmount({
      amount: 100,
      sourceCurrency: "USD",
      targetCurrency: "ZWG",
      rate: 34,
    })).toBe(3400);
  });

  it("converts ZWG to USD without adding any USD margin", () => {
    expect(convertCurrencyAmount({
      amount: 3400,
      sourceCurrency: "ZWG",
      targetCurrency: "USD",
      rate: 34,
    })).toBe(100);
  });

  it("does not touch the amount when no currency conversion occurs", () => {
    expect(convertCurrencyAmount({
      amount: 100,
      sourceCurrency: "USD",
      targetCurrency: "USD",
      rate: 34,
    })).toBe(100);
  });
});
