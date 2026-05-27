import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import StorefrontProductTile from "@/components/StorefrontProductTile";
import { mergeProducts, propertyToProduct } from "@/lib/storefrontProducts";
import { supabase } from "@/integrations/supabase/client";
import { greenProducts } from "@/data/greenProducts";

const TABS = ["All", "Office Chairs", "Desks", "Conference Tables", "Lounge", "Storage", "Accessories"];

const BestSellingProducts = () => {
  const [activeTab, setActiveTab] = useState("All");

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

  const filteredProducts = activeTab === "All"
    ? allProducts.slice(0, 4)
    : allProducts.filter((product) => {
      if (activeTab === "Office Chairs") return product.category === "Executive Chairs" || product.category === "Managerial Chairs";
      if (activeTab === "Desks") return product.category.includes("Desking");
      if (activeTab === "Conference Tables") return product.category === "Conference Tables";
      if (activeTab === "Lounge") return product.category === "Sofas & Lounge";
      if (activeTab === "Storage") return product.category === "Storage & Filing";
      if (activeTab === "Accessories") return product.category === "Accessories";
      return true;
    }).slice(0, 4);

  const displayProducts = filteredProducts.length > 0 ? filteredProducts : allProducts.slice(0, 4);

  return (
    <section className="border-t border-grid/50 bg-background py-20 md:py-24">
      <div className="container mx-auto px-10">
        <div className="grid gap-8 lg:grid-cols-[0.45fr_0.55fr] lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.28em] text-label">Featured Products</p>
            <h2 className="font-serif text-3xl leading-tight text-foreground md:text-5xl">
              Best-sellers arranged with the clarity of a curated showroom.
            </h2>
          </div>

          <div className="space-y-5 lg:text-right">
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground lg:ml-auto">
              We’ve stripped back the heavy frames and let the products lead, with cleaner staging,
              calmer spacing, and a price line that’s easier to scan.
            </p>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors ${
                    activeTab === tab
                      ? "bg-heritage text-primary-foreground"
                      : "bg-secondary/55 text-label hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
          {displayProducts.map((product) => (
            <StorefrontProductTile
              key={product.id}
              product={product}
              relatedProducts={allProducts}
              compact
              showDescription={false}
              showRating
              imagePanelClassName="product-media-panel"
            />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 border-b border-grid pb-2 font-mono text-[11px] uppercase tracking-[0.24em] text-foreground transition-colors hover:border-interactive hover:text-interactive"
          >
            View full catalog
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSellingProducts;
