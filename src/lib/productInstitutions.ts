import { supabase } from "@/integrations/supabase/client";

export type ProductInstitution = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
};

export const normalizeInstitutionSlugs = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map((item) => String(item || "").trim()).filter(Boolean)));
};

export const normalizeProductInstitution = (row: Record<string, unknown>): ProductInstitution => ({
  id: String(row.id || ""),
  name: String(row.name || ""),
  slug: String(row.slug || ""),
  description: String(row.description || ""),
  imageUrl: String(row.image_url || ""),
  displayOrder: Number(row.display_order || 0),
});

export const fetchProductInstitutions = async () => {
  const { data, error } = await supabase
    .from("product_institutions")
    .select("*")
    .eq("status", "active")
    .order("display_order", { ascending: true });

  if (error) throw error;
  return ((data || []) as Array<Record<string, unknown>>).map(normalizeProductInstitution);
};
