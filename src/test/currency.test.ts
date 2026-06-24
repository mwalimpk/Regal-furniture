import { describe, expect, it } from "vitest";
import { convertCurrencyAmount, resolveCurrencyRateSnapshot } from "@/lib/currency";

describe("currency conversion", () => {
  it("does not adjust prices when the inflation margin is inactive", () => {
    expect(convertCurrencyAmount({
      amount: 100,
      sourceCurrency: "USD",
      targetCurrency: "USD",
      rate: 27,
      marginUsd: 0,
    })).toBe(100);

    expect(convertCurrencyAmount({
      amount: 100,
      sourceCurrency: "USD",
      targetCurrency: "ZWG",
      rate: 27,
      marginUsd: 0,
    })).toBe(2700);
  });

  it("adds the active margin to the USD price", () => {
    expect(convertCurrencyAmount({
      amount: 100,
      sourceCurrency: "USD",
      targetCurrency: "USD",
      rate: 27,
      marginUsd: 7,
    })).toBe(107);
  });

  it("adds the active USD margin before converting USD to ZWG", () => {
    expect(convertCurrencyAmount({
      amount: 100,
      sourceCurrency: "USD",
      targetCurrency: "ZWG",
      rate: 27,
      marginUsd: 7,
    })).toBe(2889);
  });

  it("normalizes ZWG to USD before applying the active margin", () => {
    expect(convertCurrencyAmount({
      amount: 2700,
      sourceCurrency: "ZWG",
      targetCurrency: "USD",
      rate: 27,
      marginUsd: 7,
    })).toBe(107);
  });

  it("converts the adjusted USD base price back to ZWG", () => {
    expect(convertCurrencyAmount({
      amount: 2700,
      sourceCurrency: "ZWG",
      targetCurrency: "ZWG",
      rate: 27,
      marginUsd: 7,
    })).toBe(2889);
  });

  it("uses saved settings when the rate endpoint does not include the activation flag", () => {
    const snapshot = resolveCurrencyRateSnapshot(
      {
        rate: 27,
        marginUsd: 7,
        source: "live-cache",
        updatedAt: "2026-06-24T14:41:50.638Z",
        autoUpdate: true,
      },
      {
        profit_margin_enabled: true,
        profit_margin_usd: 7,
      },
    );

    expect(snapshot.marginEnabled).toBe(true);
    expect(snapshot.marginUsd).toBe(7);
    expect(convertCurrencyAmount({
      amount: 100,
      sourceCurrency: "USD",
      targetCurrency: "USD",
      rate: snapshot.rate,
      marginUsd: snapshot.marginUsd,
    })).toBe(107);
  });

  it("ignores a saved margin amount when the saved activation flag is off", () => {
    const snapshot = resolveCurrencyRateSnapshot(
      {
        rate: 27,
        marginUsd: 7,
        source: "live-cache",
        updatedAt: "2026-06-24T14:41:50.638Z",
        autoUpdate: true,
      },
      {
        profit_margin_enabled: false,
        profit_margin_usd: 7,
      },
    );

    expect(snapshot.marginEnabled).toBe(false);
    expect(snapshot.marginUsd).toBe(0);
  });
});
