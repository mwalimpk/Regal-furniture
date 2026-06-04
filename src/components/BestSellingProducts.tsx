import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import StorefrontProductTile from "@/components/StorefrontProductTile";
import { fetchApprovedStorefrontProducts } from "@/lib/storefrontProducts";

const TABS = [
  "All",
  "Executive Suites",
  "Office Suites",
  "Conference & Boardroom",
  "Reception & Lobby",
  "Home Office",
  "Accessories",
];

const BestSellingProducts = () => {
  const [activeTab, setActiveTab] = useState("All");

  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ["storefront-products"],
    queryFn: fetchApprovedStorefrontProducts,
  });

  const filteredProducts = activeTab === "All"
    ? allProducts.slice(0, 4)
    : allProducts.filter((product) => product.category === activeTab).slice(0, 4);

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

        {isLoading ? (
          <div className="mt-14 bg-card/60 px-6 py-14 text-center text-sm text-muted-foreground">
            Loading products...
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="mt-14 bg-card/60 px-6 py-14 text-center">
            <h3 className="font-serif text-2xl text-foreground">No featured products yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Add approved products in the admin catalog to populate this section.</p>
          </div>
        ) : (
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
        )}

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
