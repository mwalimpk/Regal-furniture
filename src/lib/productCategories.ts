import { supabase } from "@/integrations/supabase/client";

export type ProductCategoryRow = {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  features: unknown;
  created_at: string;
  updated_at: string;
  user_id?: string | null;
};

export type CategoryFeaturedItem = {
  id: string;
  name: string;
  slug: string;
  image_url: string;
};

export type StorefrontCategory = {
  id: string;
  name: string;
  slug: string;
  url: string;
  image: string;
  image_url: string;
  featured: CategoryFeaturedItem[];
  features: string[];
  description: string;
  created_at: string;
  updated_at: string;
};

export const slugifyCategory = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const categoryUrl = (slug: string) => `/category/${slug}`;
export const categoryFeaturedUrl = (categorySlug: string, featuredSlug: string) => `/category/${categorySlug}/${featuredSlug}`;

const stableFeaturedId = (name: string, index: number) => `featured-${slugifyCategory(name) || index}`;

export const normalizeFeaturedList = (value: unknown, fallbackImage = ""): CategoryFeaturedItem[] => {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        if (item && typeof item === "object") {
          const row = item as Record<string, unknown>;
          const name = String(row.name || row.title || "").trim();
          const slug = slugifyCategory(String(row.slug || name || row.id || ""));
          if (!name) return null;
          const imageUrl = String(row.image_url || row.image || fallbackImage || "").trim();
          return {
            id: String(row.id || stableFeaturedId(name || imageUrl, index)),
            name,
            slug,
            image_url: imageUrl,
          };
        }

        const name = String(item || "").trim();
        if (!name) return null;
        return {
          id: stableFeaturedId(name, index),
          name,
          slug: slugifyCategory(name),
          image_url: fallbackImage,
        };
      })
      .filter(Boolean) as CategoryFeaturedItem[];
  }

  return String(value || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((name, index) => ({
      id: stableFeaturedId(name, index),
      name,
      slug: slugifyCategory(name),
      image_url: fallbackImage,
    }));
};

export const normalizeFeatureList = (value: unknown, fallbackImage = "") =>
  normalizeFeaturedList(value, fallbackImage).map((item) => item.name).filter(Boolean);

const featuredDescription = (featured: CategoryFeaturedItem[]) => {
  const names = featured.map((item) => item.name).filter(Boolean);
  if (!names.length) return "Explore curated furniture for focused, practical, and polished spaces.";
  return `Featured furniture includes ${names.join(", ")}.`;
};

export const normalizeProductCategory = (row: Record<string, unknown>): StorefrontCategory => {
  const name = String(row.name || "");
  const slug = String(row.slug || slugifyCategory(name));
  const image = String(row.image_url || "");
  const featured = normalizeFeaturedList(row.features, image);
  const features = featured.map((item) => item.name).filter(Boolean);

  return {
    id: String(row.id || slug),
    name,
    slug,
    url: categoryUrl(slug),
    image,
    image_url: image,
    featured,
    features,
    description: featuredDescription(featured),
    created_at: String(row.created_at || ""),
    updated_at: String(row.updated_at || row.created_at || ""),
  };
};

export const fetchProductCategories = async () => {
  const { data, error } = await supabase
    .from("product_categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;

  return ((data || []) as Array<Record<string, unknown>>).map(normalizeProductCategory);
};
