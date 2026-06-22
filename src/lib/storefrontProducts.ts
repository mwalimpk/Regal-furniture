import placeholderImg from "@/assets/product-exec-desk.jpg";
import type { Product } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";
import { fetchProductCategories, slugifyCategory, type StorefrontCategory } from "@/lib/productCategories";
import { getProductImagesWithColorVariants, normalizeColorVariants } from "@/lib/productColorVariants";
import { normalizeInstitutionSlugs } from "@/lib/productInstitutions";

type PropertyRow = {
  id: string;
  title: string;
  property_type: string;
  featured_slug?: string | null;
  price: number;
  currency: string;
  location?: string | null;
  city?: string | null;
  images: string[] | null;
  description: string | null;
  long_description?: string | null;
  color_variants?: unknown;
  institution_slugs?: unknown;
};

export const categoryNameToSlug = (
  categoryName: string | null | undefined,
  categories: StorefrontCategory[] = [],
) => {
  const normalizedName = String(categoryName || "").trim().toLowerCase();
  const matched = categories.find((category) => category.name.trim().toLowerCase() === normalizedName);

  if (matched) return matched.slug;

  return slugifyCategory(categoryName || "uncategorized");
};

export const propertyToProduct = (property: PropertyRow, categories: StorefrontCategory[] = []): Product => {
  const colorVariants = normalizeColorVariants(property.color_variants);
  const images = getProductImagesWithColorVariants(property.images || [], colorVariants);

  return {
    id: property.id,
    name: property.title,
    category: property.property_type,
    categorySlug: categoryNameToSlug(property.property_type, categories),
    featuredSlug: property.featured_slug || null,
    price: Number(property.price || 0),
    currency: property.currency || "USD",
    sku: property.location || "",
    warehouse: property.city || "",
    image: images[0] || placeholderImg,
    images: images.length ? images : undefined,
    description: property.description || "",
    longDescription: property.long_description || "",
    colorVariants: colorVariants.length ? colorVariants : undefined,
    institutionSlugs: normalizeInstitutionSlugs(property.institution_slugs),
  };
};

export const fetchApprovedStorefrontProducts = async () => {
  const [{ data, error }, categories] = await Promise.all([
    supabase
      .from("properties")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false }),
    fetchProductCategories(),
  ]);

  if (error) throw error;

  return (data || []).map((property) => propertyToProduct(property as PropertyRow, categories));
};
