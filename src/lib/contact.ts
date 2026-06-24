export const SALES_WHATSAPP_NUMBERS = {
  Harare: "263780472180",
  Bulawayo: "263787781470",
} as const;

export type SalesBranch = keyof typeof SALES_WHATSAPP_NUMBERS;

export const SALES_WHATSAPP_NUMBER = SALES_WHATSAPP_NUMBERS.Harare;
export const SALES_EMAIL = "info@regalfurn.co.zw";

const BRANCHES: SalesBranch[] = ["Harare", "Bulawayo"];

const warehouseBranches = (warehouse?: string): SalesBranch[] => {
  const normalized = String(warehouse || "").trim().toLowerCase();

  if (
    normalized === "both"
    || (normalized.includes("harare") && (normalized.includes("bulawayo") || normalized.includes("bulwa")))
  ) {
    return BRANCHES;
  }

  if (normalized.includes("bulawayo") || normalized.includes("bulwa")) {
    return ["Bulawayo"];
  }

  return ["Harare"];
};

export const getOrderBranchOptions = (warehouses: Array<string | undefined>): SalesBranch[] => {
  if (!warehouses.length) return ["Harare"];

  let sharedBranches = [...BRANCHES];
  warehouses.forEach((warehouse) => {
    const availableBranches = warehouseBranches(warehouse);
    sharedBranches = sharedBranches.filter((branch) => availableBranches.includes(branch));
  });

  return sharedBranches.length ? sharedBranches : BRANCHES;
};

export const buildWhatsAppLink = (message: string, phoneNumber = SALES_WHATSAPP_NUMBER) =>
  `https://wa.me/${phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

export const buildWhatsAppCallLink = () =>
  `whatsapp://call?phone=${SALES_WHATSAPP_NUMBER}`;

export const buildEmailLink = (subject: string, body: string) =>
  `mailto:${SALES_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
