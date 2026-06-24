import type { ProductColorVariant } from "@/lib/productColorVariants";

export interface Product {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  featuredSlug?: string | null;
  price: number;
  currency: string;
  sku?: string;
  warehouse?: string;
  image: string;
  images?: string[];
  description: string;
  longDescription?: string;
  colorVariants?: ProductColorVariant[];
  institutionSlugs?: string[];
}
