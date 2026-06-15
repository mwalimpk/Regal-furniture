import type { Product } from "@/data/products";

export type ProductCombinationInsight = {
  product: Product;
  score: number;
  total: number;
  reasons: string[];
  priceFitLabel: string;
};

const categoryFamily = (slug: string) => {
  if (slug.includes("office") || slug.includes("workspace")) return "workspace";
  if (slug.includes("chair")) return "seating";
  if (slug.includes("desk") || slug.includes("workstation")) return "desking";
  if (slug.includes("conference")) return "meeting";
  if (slug.includes("storage")) return "storage";
  if (slug.includes("sofa") || slug.includes("lounge")) return "lounge";
  return "accessory";
};

export const getCompatibleCategorySlugs = (_categorySlug: string) => [];

const getPriceFit = (basePrice: number, companionPrice: number) => {
  const total = Math.max(basePrice + companionPrice, 1);
  const companionShare = companionPrice / total;

  if (companionShare < 0.25) {
    return { score: 18, label: "Value add-on", reason: "Low-friction add-on price" };
  }

  if (companionShare <= 0.55) {
    return { score: 26, label: "Balanced total", reason: "Balanced bundle value" };
  }

  if (companionShare <= 0.72) {
    return { score: 16, label: "Premium match", reason: "Premium-tier companion" };
  }

  return { score: 8, label: "Suite upgrade", reason: "High-impact suite pairing" };
};

export const buildCombinationInsight = (baseProduct: Product, companion: Product): ProductCombinationInsight => {
  const compatibleSlugs = getCompatibleCategorySlugs(baseProduct.categorySlug);
  const reverseCompatibleSlugs = getCompatibleCategorySlugs(companion.categorySlug);
  const baseFamily = categoryFamily(baseProduct.categorySlug);
  const companionFamily = categoryFamily(companion.categorySlug);
  const reasons: string[] = [];
  let score = 0;

  if (compatibleSlugs.includes(companion.categorySlug)) {
    score += 64;
    reasons.push("Primary companion category");
  } else if (reverseCompatibleSlugs.includes(baseProduct.categorySlug)) {
    score += 54;
    reasons.push("Reverse-compatible pairing");
  } else if (baseProduct.categorySlug === companion.categorySlug) {
    score += 20;
    reasons.push("Same collection alternative");
  } else {
    score += 12;
    reasons.push("Cross-category merchandising option");
  }

  const priceFit = getPriceFit(Number(baseProduct.price || 0), Number(companion.price || 0));
  score += priceFit.score;
  reasons.push(priceFit.reason);

  if (
    (baseFamily === "seating" && companionFamily === "desking") ||
    (baseFamily === "desking" && companionFamily === "seating") ||
    (baseFamily === "workspace" && companionFamily === "storage")
  ) {
    score += 12;
    reasons.push("Complete workspace fit");
  }

  if (
    (baseFamily === "meeting" && companionFamily === "seating") ||
    (baseFamily === "seating" && companionFamily === "meeting") ||
    (baseFamily === "meeting" && companionFamily === "lounge") ||
    (baseFamily === "lounge" && companionFamily === "meeting")
  ) {
    score += 10;
    reasons.push("Meeting-room fit");
  }

  if (baseFamily !== companionFamily && companionFamily === "storage") {
    score += 8;
    reasons.push("Operational storage support");
  }

  if (Number(baseProduct.price || 0) + Number(companion.price || 0) >= 1500) {
    score += 6;
    reasons.push("Project-scale order value");
  }

  return {
    product: companion,
    score,
    total: Number(baseProduct.price || 0) + Number(companion.price || 0),
    reasons: Array.from(new Set(reasons)).slice(0, 3),
    priceFitLabel: priceFit.label,
  };
};

export const rankProductCombinations = (baseProduct: Product, candidates: Product[], limit = 8) =>
  candidates
    .filter((candidate) => candidate.id !== baseProduct.id)
    .map((candidate) => buildCombinationInsight(baseProduct, candidate))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.total - right.total;
    })
    .slice(0, limit);
