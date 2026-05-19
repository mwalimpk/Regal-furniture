type Currency = "USD" | "ZWG";

const ZWG_RATE = 27;

export const formatCurrency = (usdPrice: number, currency: Currency) => {
  const value = currency === "USD" ? usdPrice : Math.round(usdPrice * ZWG_RATE);

  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }

  return `ZWG ${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value)}`;
};
