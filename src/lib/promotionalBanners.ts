export const PROMO_PLACEMENTS = [
  {
    key: "home-after-hero",
    label: "Home: after hero",
    page: "Homepage",
    reason: "Best for broad offers while the shopper is still orienting.",
  },
  {
    key: "home-before-products",
    label: "Home: before best sellers",
    page: "Homepage",
    reason: "Frames popular products with a timely incentive before browsing starts.",
  },
  {
    key: "home-before-newsletter",
    label: "Home: before newsletter",
    page: "Homepage",
    reason: "Captures shoppers who have already seen the range and need a final nudge.",
  },
  {
    key: "categories-before-grid",
    label: "Collections: before category grid",
    page: "Collections",
    reason: "Useful for storewide promotions before shoppers choose a collection.",
  },
  {
    key: "category-top",
    label: "Category: top of page",
    page: "Category pages",
    reason: "Targets collection-level intent before the product list appears.",
  },
  {
    key: "category-before-grid",
    label: "Category: before product grid",
    page: "Category pages",
    reason: "Appears after filters, when buying intent is clearer.",
  },
  {
    key: "product-after-summary",
    label: "Product: after buying summary",
    page: "Product pages",
    reason: "Supports add-to-cart or quote intent near pricing and specifications.",
  },
  {
    key: "product-before-recommendations",
    label: "Product: before recommendations",
    page: "Product pages",
    reason: "Works as a final offer before cross-sell browsing begins.",
  },
] as const;

export type PromoPlacementKey = (typeof PROMO_PLACEMENTS)[number]["key"];

export type PromotionalBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  category: string;
  background_image_url: string | null;
  cta_label: string | null;
  cta_href: string | null;
  placements: string[];
  status: "active" | "paused" | string;
  starts_at: string | null;
  ends_at: string | null;
  has_countdown: boolean;
  countdown_ends_at: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export const STOREWIDE_PROMO_CATEGORY = "Storewide";

const asStringArray = (value: unknown) => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
};

export const normalizePromotionalBanner = (row: Partial<PromotionalBanner> & Record<string, unknown>): PromotionalBanner => ({
  id: String(row.id || ""),
  title: String(row.title || ""),
  subtitle: row.subtitle ? String(row.subtitle) : null,
  category: String(row.category || STOREWIDE_PROMO_CATEGORY),
  background_image_url: row.background_image_url ? String(row.background_image_url) : null,
  cta_label: row.cta_label ? String(row.cta_label) : null,
  cta_href: row.cta_href ? String(row.cta_href) : null,
  placements: asStringArray(row.placements),
  status: String(row.status || "paused"),
  starts_at: row.starts_at ? String(row.starts_at) : null,
  ends_at: row.ends_at ? String(row.ends_at) : null,
  has_countdown: Boolean(row.has_countdown),
  countdown_ends_at: row.countdown_ends_at ? String(row.countdown_ends_at) : null,
  created_at: String(row.created_at || ""),
  updated_at: String(row.updated_at || row.created_at || ""),
  user_id: String(row.user_id || ""),
});

export const isBannerActive = (banner: PromotionalBanner, now = new Date()) => {
  if (banner.status !== "active") return false;

  const nowMs = now.getTime();
  if (banner.starts_at && new Date(banner.starts_at).getTime() > nowMs) return false;
  if (banner.ends_at && new Date(banner.ends_at).getTime() < nowMs) return false;

  return true;
};

export const bannerMatchesCategory = (banner: PromotionalBanner, pageCategory?: string | null) => {
  if (!pageCategory) return true;
  return banner.category === STOREWIDE_PROMO_CATEGORY || banner.category === pageCategory;
};

export const filterBannersForPlacement = (
  banners: PromotionalBanner[],
  placement: PromoPlacementKey,
  pageCategory?: string | null,
) =>
  banners
    .filter((banner) => isBannerActive(banner))
    .filter((banner) => banner.placements.includes(placement))
    .filter((banner) => bannerMatchesCategory(banner, pageCategory))
    .sort((left, right) => {
      const rightTime = new Date(right.updated_at || right.created_at || 0).getTime();
      const leftTime = new Date(left.updated_at || left.created_at || 0).getTime();
      return rightTime - leftTime;
    });
