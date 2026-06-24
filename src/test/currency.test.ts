import { describe, expect, it } from "vitest";
import { convertCurrencyAmount } from "@/lib/currency";

describe("currency conversion", () => {
  it("adds the USD margin before converting USD to ZWG", () => {
    expect(convertCurrencyAmount({
      amount: 100,
      sourceCurrency: "USD",
      targetCurrency: "ZWG",
      rate: 27,
      marginUsd: 7,
    })).toBe(2889);
  });

  it("converts ZWG to USD and then adds the USD margin", () => {
    expect(convertCurrencyAmount({
      amount: 2700,
      sourceCurrency: "ZWG",
      targetCurrency: "USD",
      rate: 27,
      marginUsd: 7,
    })).toBe(107);
  });

  it("does not add a margin when no currency conversion occurs", () => {
    expect(convertCurrencyAmount({
      amount: 100,
      sourceCurrency: "USD",
      targetCurrency: "USD",
      rate: 27,
      marginUsd: 7,
    })).toBe(100);
  });
});
