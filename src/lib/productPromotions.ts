import type { Product } from "@/data/products";

export type ProductPromotionScope = "single_product" | "selected_products" | "categories";

export type ProductPromotionCategoryTarget = {
  category: string;
  product_ids: string[];
};

export type ProductPromotion = {
  id: string;
  title: string;
  description: string | null;
  promotion_type: ProductPromotionScope;
  discount_type: "percentage" | "fixed" | "custom";
  discount_value: number | null;
  offer_label: string | null;
  product_ids: string[];
  category_targets: ProductPromotionCategoryTarget[];
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
};

const isPromotionScope = (value: unknown): value is ProductPromotionScope =>
  value === "single_product" || value === "selected_products" || value === "categories";

const asStringArray = (value: unknown) => (Array.isArray(value) ? value.map(String).filter(Boolean) : []);

export const normalizeProductPromotion = (row: Partial<ProductPromotion> & Record<string, unknown>): ProductPromotion => {
  const categoryTargets = Array.isArray(row.category_targets)
    ? row.category_targets
        .map((target) => {
          if (!target || typeof target !== "object") return null;
          const typedTarget = target as Record<string, unknown>;
          return {
            category: String(typedTarget.category || ""),
            product_ids: asStringArray(typedTarget.product_ids),
          };
        })
        .filter((target): target is ProductPromotionCategoryTarget => Boolean(target?.category))
    : [];

  const promotionType = isPromotionScope(row.promotion_type) ? row.promotion_type : "single_product";
  const discountType = row.discount_type === "fixed" || row.discount_type === "custom" ? row.discount_type : "percentage";
  const rawDiscountValue = row.discount_value === null || row.discount_value === undefined ? null : Number(row.discount_value);

  return {
    id: String(row.id || ""),
    title: String(row.title || ""),
    description: row.description ? String(row.description) : null,
    promotion_type: promotionType,
    discount_type: discountType,
    discount_value: rawDiscountValue !== null && Number.isFinite(rawDiscountValue) ? rawDiscountValue : null,
    offer_label: row.offer_label ? String(row.offer_label) : null,
    product_ids: asStringArray(row.product_ids),
    category_targets: categoryTargets,
    status: String(row.status || "active"),
    starts_at: row.starts_at ? String(row.starts_at) : null,
    ends_at: row.ends_at ? String(row.ends_at) : null,
    created_at: String(row.created_at || ""),
    updated_at: String(row.updated_at || ""),
    user_id: String(row.user_id || ""),
  };
};

export const productPromotionScopeLabel = (scope: ProductPromotionScope) => {
  switch (scope) {
    case "single_product":
      return "Single product";
    case "selected_products":
      return "Selected products";
    case "categories":
      return "Whole categories";
    default:
      return "Product promotion";
  }
};

export const isProductPromotionActive = (promotion: ProductPromotion, now = new Date()) => {
  if (promotion.status !== "active") return false;
  const startsAt = promotion.starts_at ? new Date(promotion.starts_at) : null;
  const endsAt = promotion.ends_at ? new Date(promotion.ends_at) : null;
  if (startsAt && startsAt > now) return false;
  if (endsAt && endsAt < now) return false;
  return true;
};

const comparable = (value: string | null | undefined) => (value || "").trim().toLowerCase();

const promotionUpdatedTime = (promotion: ProductPromotion) =>
  new Date(promotion.updated_at || promotion.created_at || 0).getTime() || 0;

export const productPromotionAppliesToProduct = (promotion: ProductPromotion, product: Product) => {
  if (promotion.product_ids.includes(product.id)) return true;

  if (promotion.promotion_type === "categories") {
    return promotion.category_targets.some((target) => comparable(target.category) === comparable(product.category));
  }

  return promotion.category_targets.some((target) => target.product_ids.includes(product.id));
};

export const getProductPromotionDisplayLabel = (promotion: ProductPromotion) => {
  if (promotion.offer_label) return promotion.offer_label;
  if (promotion.discount_type === "custom") return promotion.title || "Special offer";
  if (promotion.discount_type === "percentage") return `${promotion.discount_value || 0}% off`;
  return `${promotion.discount_value || 0} off`;
};

export const getProductPromotionPrice = (price: number, promotion: ProductPromotion) => {
  if (promotion.discount_type === "percentage" && promotion.discount_value) {
    return Math.max(0, Number((price * (1 - promotion.discount_value / 100)).toFixed(2)));
  }

  if (promotion.discount_type === "fixed" && promotion.discount_value) {
    return Math.max(0, Number((price - promotion.discount_value).toFixed(2)));
  }

  return null;
};

export const getProductPromotionSavings = (price: number, promotion: ProductPromotion) => {
  const promotionalPrice = getProductPromotionPrice(price, promotion);
  return promotionalPrice === null ? 0 : Math.max(0, price - promotionalPrice);
};

export const getBestProductPromotionForProduct = (
  promotions: ProductPromotion[],
  product: Product | null | undefined,
  now = new Date(),
) => {
  if (!product) return null;

  return promotions
    .filter((promotion) => isProductPromotionActive(promotion, now))
    .filter((promotion) => productPromotionAppliesToProduct(promotion, product))
    .sort((left, right) => {
      const savingsDifference = getProductPromotionSavings(product.price, right) - getProductPromotionSavings(product.price, left);
      if (savingsDifference !== 0) return savingsDifference;
      return promotionUpdatedTime(right) - promotionUpdatedTime(left);
    })[0] || null;
};
