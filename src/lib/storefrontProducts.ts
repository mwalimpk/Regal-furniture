import placeholderImg from "@/assets/product-exec-desk.jpg";
import { categories, type Product } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";

type PropertyRow = {
  id: string;
  title: string;
  property_type: string;
  price: number;
  currency: string;
  images: string[] | null;
  description: string | null;
  long_description?: string | null;
};

export const categoryNameToSlug = (categoryName: string | null | undefined) => {
  const matched = categories.find((category) => category.name === categoryName);

  if (matched) return matched.slug;

  return (categoryName || "uncategorized")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const propertyToProduct = (property: PropertyRow): Product => ({
  id: property.id,
  name: property.title,
  category: property.property_type,
  categorySlug: categoryNameToSlug(property.property_type),
  price: Number(property.price || 0),
  currency: property.currency || "USD",
  image: property.images?.[0] || placeholderImg,
  images: property.images || undefined,
  description: property.description || "",
  longDescription: property.long_description || "",
});

export const fetchApprovedStorefrontProducts = async () => {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map(propertyToProduct);
};
