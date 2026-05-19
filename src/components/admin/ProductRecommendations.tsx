import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { products } from "@/data/products";
import { greenProducts } from "@/data/greenProducts";

// Combine available catalog
const ALL_PRODUCTS = Array.from(new Map([...products, ...greenProducts].map(item => [item.id, item])).values());

const ProductRecommendations = () => {
  const { toast } = useToast();
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [recommendationSearchTerm, setRecommendationSearchTerm] = useState("");

  const selectedProduct = ALL_PRODUCTS.find(p => p.id === selectedProductId);

  // Fetch saved pairings when a product is selected
  useEffect(() => {
    if (!selectedProductId) return;
    
    const fetchSavedPairings = async () => {
      setLoading(true);
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
      } catch (e) {
        console.error("Failed to load pairings or table missing", e);
        setRecommendedIds([]);
      }
      setLoading(false);
    };

    fetchSavedPairings();
  }, [selectedProductId]);

  const toggleRecommendation = (id: string) => {
    setRecommendedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!selectedProductId) return;
    setLoading(true);
    
    try {
      // Upsert into Supabase
      const { error } = await supabase
        .from("product_pairings")
        .upsert({
          product_id: selectedProductId,
          recommended_ids: recommendedIds
        }, { onConflict: "product_id" });

      if (error) throw error;

      toast({
        title: "Pairings Saved",
        description: "The 'You May Also Like' section for this product has been updated."
      });
    } catch (e: any) {
      toast({
        title: "Save Failed",
        description: e.message || "Failed to save pairings. Make sure the SQL script has been run to create the product_pairings table.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const filteredProducts = ALL_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRecommendationProducts = ALL_PRODUCTS.filter(p => {
    const query = recommendationSearchTerm.toLowerCase();
    return (
      p.id !== selectedProductId &&
      (p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold font-serif text-gray-900">Product Pairing Engine</h2>
          <p className="text-sm text-gray-500 mt-1">Configure exactly which products appear in the "You May Also Like" section for any given item.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Col: Master Product Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[600px]">
          <h3 className="font-semibold text-gray-900 mb-4">1. Select Target Product</h3>
          <input 
            type="text" 
            placeholder="Search by name or category..." 
            className="w-full p-2 border border-gray-200 rounded-md mb-4 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="overflow-y-auto flex-1 border border-gray-100 rounded-md p-2 space-y-1">
            {filteredProducts.map(p => (
              <div 
                key={p.id}
                onClick={() => setSelectedProductId(p.id)}
                className={`p-3 rounded-md cursor-pointer flex gap-3 items-center transition-colors ${selectedProductId === p.id ? 'bg-red-50 border border-brand-red text-brand-red' : 'hover:bg-gray-50'}`}
              >
                <img src={p.image} className="w-10 h-10 object-contain mix-blend-multiply bg-gray-100 rounded" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  <p className="text-xs opacity-70 truncate">{p.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Companion Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[600px] relative">
          <h3 className="font-semibold text-gray-900 mb-4">2. Assign Recommendations</h3>
          
          {!selectedProduct ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Please select a target product first from the left panel.
            </div>
          ) : (
            <>
              <div className="bg-gray-50 p-4 rounded-md mb-4 flex items-center gap-4">
                 <img src={selectedProduct.image} className="w-14 h-14 mix-blend-multiply" />
                 <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Editing</span>
                    <p className="font-bold text-gray-900">{selectedProduct.name}</p>
                 </div>
              </div>

              <input
                type="text"
                placeholder="Search by name or category..."
                className="w-full p-2 border border-gray-200 rounded-md mb-4 text-sm"
                value={recommendationSearchTerm}
                onChange={(e) => setRecommendationSearchTerm(e.target.value)}
              />
            
              <div className="overflow-y-auto flex-1 border border-gray-100 rounded-md p-4 bg-gray-50 space-y-2 mb-4">
                <p className="text-xs text-gray-500 mb-3 font-semibold uppercase">Select items to display at bottom of page:</p>
                
                {loading ? <p className="text-sm text-gray-500">Loading...</p> : filteredRecommendationProducts.map(p => {
                  const isChecked = recommendedIds.includes(p.id);
                  return (
                    <div 
                      key={p.id}
                      onClick={() => toggleRecommendation(p.id)}
                      className={`p-3 bg-white rounded-md cursor-pointer flex gap-3 items-center border transition-all ${isChecked ? 'border-brand-red shadow-sm' : 'border-gray-100 opacity-60 hover:opacity-100'}`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isChecked ? 'bg-brand-red border-brand-red' : 'border-gray-300'}`}>
                        {isChecked && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <img src={p.image} className="w-10 h-10 object-contain mix-blend-multiply" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${isChecked ? 'font-semibold text-brand-red' : 'text-gray-700'}`}>{p.name}</p>
                        <p className="text-xs text-gray-500 truncate">{p.category}</p>
                      </div>
                    </div>
                  );
                })}
                {!loading && filteredRecommendationProducts.length === 0 && (
                  <p className="text-sm text-gray-500">No products match that search.</p>
                )}
              </div>

              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="w-full bg-brand-red hover:bg-red-800 text-white font-semibold shadow-lg"
              >
                {loading ? "Saving..." : `Save ${recommendedIds.length} Recommendations`}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductRecommendations;
