import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Star } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/utils/formatCurrency";
import { mergeProducts, propertyToProduct } from "@/lib/storefrontProducts";
import { supabase } from "@/integrations/supabase/client";
import { greenProducts } from "@/data/greenProducts";

const TABS = ["All", "Office Chairs", "Desks", "Conference Tables", "Lounge", "Storage", "Accessories"];

const BestSellingProducts = () => {
  const [activeTab, setActiveTab] = useState("All");
  const { currency } = useCurrency();

  const { data: dbProducts } = useQuery({
    queryKey: ["storefront-products", "best-selling"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const allProducts = mergeProducts(
    (dbProducts || []).map(propertyToProduct),
    greenProducts,
  );

  // Filter products by active tab category
  const filteredProducts = activeTab === "All" 
    ? allProducts.slice(0, 4) 
    : allProducts.filter(p => {
        if (activeTab === "Office Chairs") return p.category === "Executive Chairs" || p.category === "Managerial Chairs";
        if (activeTab === "Desks") return p.category.includes("Desking");
        if (activeTab === "Conference Tables") return p.category === "Conference Tables";
        if (activeTab === "Lounge") return p.category === "Sofas & Lounge";
        if (activeTab === "Storage") return p.category === "Storage & Filing";
        if (activeTab === "Accessories") return p.category === "Accessories";
        return true;
      }).slice(0, 4);

  // If a tab has no products mapped yet, fallback to all
  const displayProducts = filteredProducts.length > 0 ? filteredProducts : allProducts.slice(0, 4);

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm uppercase tracking-[0.28em] text-[#8d8272]">Featured Products</p>
            <h2 className="font-serif text-3xl leading-tight text-[#171a18] md:text-5xl">
              Best-sellers presented like a showroom, not a cluttered grid.
            </h2>
          </div>
          <div className="max-w-md">
            <p className="text-sm leading-7 text-[#665f56]">
              Cards are now more deliberate: cleaner image framing, calmer spacing, and a clearer price-to-action hierarchy.
            </p>
          </div>
        </div>

        <div className="mb-10 flex flex-wrap gap-3">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab 
                    ? "border-[#1c211E] bg-[#1c211E] text-white" 
                    : "border-[#ddd3c6] bg-[#fbf8f3] text-[#5b544b] hover:border-[#bca88a]"
                }`}
              >
                {tab}
              </button>
            ))}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {displayProducts.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`} className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[#ebe3d8] bg-[#fdfbf8] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(23,26,24,0.08)]">
              <div className="relative aspect-[4/3] overflow-hidden border-b border-[#efe6da] bg-[linear-gradient(180deg,#faf7f2_0%,#f3eee8_100%)] p-7">
                <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#7f7465]">
                  {product.category}
                </span>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105" 
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-serif text-2xl leading-tight text-[#171a18]">{product.name}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-[#6a6257] line-clamp-3">
                  {product.description}
                </p>
                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="font-serif text-3xl text-brand-red">
                        {formatCurrency(product.price, currency)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#7e7568]">
                      <Star className="w-3.5 h-3.5 fill-[#c7af83] text-[#c7af83]" />
                      <span className="font-medium">4.9</span>
                    </div>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7b1f34] text-white transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link to="/categories" className="flex items-center gap-2 rounded-full border border-[#d7c8b5] px-5 py-3 text-sm font-semibold tracking-wide text-[#211d1a] transition-colors hover:bg-[#fbf8f3]">
            View full catalog
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSellingProducts;
