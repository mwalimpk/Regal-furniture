import { useQuery } from "@tanstack/react-query";
import { fetchProductCategories } from "@/lib/productCategories";

export const PRODUCT_CATEGORIES_QUERY_KEY = ["product-categories"];

export const useProductCategories = () => useQuery({
  queryKey: PRODUCT_CATEGORIES_QUERY_KEY,
  queryFn: fetchProductCategories,
});
