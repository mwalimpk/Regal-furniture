import { useQuery } from "@tanstack/react-query";
import { fetchProductInstitutions } from "@/lib/productInstitutions";

export const PRODUCT_INSTITUTIONS_QUERY_KEY = ["product-institutions"];

export const useProductInstitutions = () => useQuery({
  queryKey: PRODUCT_INSTITUTIONS_QUERY_KEY,
  queryFn: fetchProductInstitutions,
});
