import { useEffect, useMemo, useState } from "react";
import { Check, Plus, Save } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { buildCombinationInsight, rankProductCombinations } from "@/lib/productCombinations";
import { fetchApprovedStorefrontProducts } from "@/lib/storefrontProducts";

const ProductRecommendations = () => {
  const { toast } = useToast();
  const { convert, formatConverted } = useCurrency();
  const queryClient = useQueryClient();
  const [selectedProductId, setSelectedProductId] = useState("");
  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [recommendationSearchTerm, setRecommendationSearchTerm] = useState("");

  const { data: allProducts = [] } = useQuery({
    queryKey: ["storefront-products"],
    queryFn: fetchApprovedStorefrontProducts,
  });

  const selectedProduct = allProducts.find((product) => product.id === selectedProductId);

  useEffect(() => {
    if (!selectedProductId) return;

    const fetchSavedPairings = async () => {
      setLoading(true);
      setRecommendedIds([]);
      try {
        const { data, error } = await supabase
          .from("product_pairings")
          .select("recommended_ids")
          .eq("product_id", selectedProductId)
          .maybeSingle();

        if (data && !error) {
          setRecommendedIds(data.recommended_ids || []);
        } else {
          setRecommendedIds([]);
        }
      } catch (error) {
        console.error("Failed to load pairings", error);
        setRecommendedIds([]);
      }
      setLoading(false);
    };

    fetchSavedPairings();
  }, [selectedProductId]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return allProducts.filter((product) =>
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );
  }, [allProducts, searchTerm]);

  const suggestedInsights = useMemo(() => {
    if (!selectedProduct) return [];
    return rankProductCombinations(selectedProduct, allProducts, 8);
  }, [allProducts, selectedProduct]);

  const selectedInsights = useMemo(() => {
    if (!selectedProduct) return [];
    return recommendedIds
      .map((id) => allProducts.find((product) => product.id === id))
      .filter(Boolean)
      .map((product) => buildCombinationInsight(selectedProduct, product!));
  }, [allProducts, recommendedIds, selectedProduct]);

  const filteredRecommendationProducts = useMemo(() => {
    if (!selectedProduct) return [];
    const query = recommendationSearchTerm.trim().toLowerCase();
    return allProducts
      .filter((product) => product.id !== selectedProductId)
      .filter((product) =>
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      )
      .map((product) => buildCombinationInsight(selectedProduct, product))
      .sort((left, right) => {
        const leftSelected = recommendedIds.includes(left.product.id) ? 1 : 0;
        const rightSelected = recommendedIds.includes(right.product.id) ? 1 : 0;
        if (rightSelected !== leftSelected) return rightSelected - leftSelected;
        return right.score - left.score;
      });
  }, [allProducts, recommendationSearchTerm, recommendedIds, selectedProduct, selectedProductId]);

  const toggleRecommendation = (id: string) => {
    setRecommendedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const addSuggested = (id: string) => {
    setRecommendedIds((current) => current.includes(id) ? current : [...current, id]);
  };

  const handleSave = async () => {
    if (!selectedProductId) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("product_pairings")
        .upsert({
          product_id: selectedProductId,
          recommended_ids: recommendedIds,
        }, { onConflict: "product_id" });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["admin-pairing-products"] });
      toast({
        title: "Combinations saved",
        description: "The product page combination carousel has been updated.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Could not save product combinations.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Merchandising</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.04em] text-foreground">Product combinations</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Select buyer-facing companion products for each item, guided by category fit, price balance, and project value.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="admin-panel-soft px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Products</p>
            <p className="mt-2 font-medium text-foreground">{allProducts.length}</p>
          </div>
          <div className="admin-panel-soft px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Selected</p>
            <p className="mt-2 font-medium text-foreground">{recommendedIds.length}</p>
          </div>
          <div className="admin-panel-soft px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Suggestions</p>
            <p className="mt-2 font-medium text-foreground">{suggestedInsights.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.35fr)]">
        <div className="admin-panel flex h-[720px] flex-col p-5">
          <h2 className="mb-4 font-semibold text-foreground">1. Select product</h2>
          <input
            type="text"
            placeholder="Search by name or category..."
            className="mb-4 h-11 w-full border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <div className="flex-1 space-y-1 overflow-y-auto border border-grid/20 p-2">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => setSelectedProductId(product.id)}
                className={`flex w-full items-center gap-3 border p-3 text-left transition-colors ${selectedProductId === product.id ? "border-heritage bg-heritage/10 text-foreground" : "border-transparent hover:border-grid/20 hover:bg-muted"}`}
              >
                <img src={product.image} alt={product.name} className="h-11 w-11 bg-muted object-contain mix-blend-multiply dark:mix-blend-normal" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{product.category}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="admin-panel flex min-h-[720px] flex-col p-5">
          <h2 className="mb-4 font-semibold text-foreground">2. Build combinations</h2>

          {!selectedProduct ? (
            <div className="flex flex-1 items-center justify-center border border-dashed border-grid/30 px-6 text-center text-sm text-muted-foreground">
              Select a target product to see ranked combination suggestions.
            </div>
          ) : (
            <>
              <div className="admin-panel-soft mb-5 grid gap-4 p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="h-16 w-16 object-contain mix-blend-multiply dark:mix-blend-normal" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Editing combinations for</p>
                  <p className="mt-1 font-serif text-2xl text-foreground">{selectedProduct.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedProduct.category}</p>
                </div>
                <Button onClick={handleSave} disabled={loading} className="bg-heritage font-semibold text-primary-foreground hover:bg-heritage/90">
                  <Save className="h-4 w-4" />
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>

              <div className="mb-5 border border-grid/20 bg-background p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-label">Ranked suggestions</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Suggested companions are scored by product category, total price fit, and workspace context.
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedInsights.length} saved combination{selectedInsights.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {suggestedInsights.slice(0, 4).map((insight) => {
                    const isSelected = recommendedIds.includes(insight.product.id);
                    return (
                      <div key={insight.product.id} className="border border-grid/20 bg-card p-4">
                        <div className="flex gap-3">
                          <img src={insight.product.image} alt={insight.product.name} className="h-14 w-14 object-contain mix-blend-multiply dark:mix-blend-normal" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">{insight.product.name}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{insight.product.category}</p>
                            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-label">
                              Total with selected: {formatConverted(
                                convert(selectedProduct.price, selectedProduct.currency) +
                                convert(insight.product.price, insight.product.currency),
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {insight.reasons.map((reason) => (
                            <span key={reason} className="border border-grid/25 bg-background px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                              {reason}
                            </span>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant={isSelected ? "secondary" : "outline"}
                          className="mt-4 w-full"
                          onClick={() => isSelected ? toggleRecommendation(insight.product.id) : addSuggested(insight.product.id)}
                        >
                          {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          {isSelected ? "Selected" : "Add combination"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <input
                type="text"
                placeholder="Search all companion products..."
                className="mb-4 h-11 w-full border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
                value={recommendationSearchTerm}
                onChange={(event) => setRecommendationSearchTerm(event.target.value)}
              />

              <div className="flex-1 space-y-2 overflow-y-auto border border-grid/20 bg-muted p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Select products for the product-page combination carousel
                </p>

                {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : filteredRecommendationProducts.map((insight) => {
                  const isChecked = recommendedIds.includes(insight.product.id);
                  return (
                    <button
                      key={insight.product.id}
                      type="button"
                      onClick={() => toggleRecommendation(insight.product.id)}
                      className={`flex w-full cursor-pointer items-start gap-3 border bg-card p-3 text-left transition-opacity ${isChecked ? "border-heritage opacity-100" : "border-grid/20 opacity-70 hover:opacity-100"}`}
                    >
                      <div className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center border ${isChecked ? "border-heritage bg-heritage" : "border-grid/40"}`}>
                        {isChecked && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                      </div>
                      <img src={insight.product.image} alt={insight.product.name} className="h-12 w-12 shrink-0 object-contain mix-blend-multiply dark:mix-blend-normal" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className={`truncate text-sm ${isChecked ? "font-semibold text-foreground" : "text-foreground/80"}`}>{insight.product.name}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{insight.product.category}</p>
                          </div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-label">
                            Total {formatConverted(
                              convert(selectedProduct.price, selectedProduct.currency) +
                              convert(insight.product.price, insight.product.currency),
                            )}
                          </p>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="border border-grid/25 bg-background px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            Score {Math.round(insight.score)}
                          </span>
                          <span className="border border-grid/25 bg-background px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            {insight.priceFitLabel}
                          </span>
                          {insight.reasons.slice(0, 2).map((reason) => (
                            <span key={reason} className="border border-grid/25 bg-background px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
                {!loading && filteredRecommendationProducts.length === 0 && (
                  <p className="text-sm text-muted-foreground">No products match that search.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductRecommendations;
