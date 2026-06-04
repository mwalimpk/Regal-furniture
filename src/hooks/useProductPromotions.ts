import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";
import {
  getBestProductPromotionForProduct,
  normalizeProductPromotion,
} from "@/lib/productPromotions";

export const ACTIVE_PRODUCT_PROMOTIONS_QUERY_KEY = ["active-product-promotions"] as const;

export const useActiveProductPromotions = () =>
  useQuery({
    queryKey: ACTIVE_PRODUCT_PROMOTIONS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_promotions")
        .select("*")
        .eq("status", "active")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return ((data || []) as Array<Record<string, unknown>>).map(normalizeProductPromotion);
    },
  });

export const useProductPromotionForProduct = (product: Product | null | undefined) => {
  const { data: promotions = [], ...query } = useActiveProductPromotions();

  const promotion = useMemo(
    () => getBestProductPromotionForProduct(promotions, product),
    [product, promotions],
  );

  return { ...query, promotions, promotion };
};
