import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { categories, products } from "@/data/products";
import { greenProducts } from "@/data/greenProducts";
import { mergeProducts, propertyToProduct } from "@/lib/storefrontProducts";
import { supabase } from "@/integrations/supabase/client";

const featuredCategoryImages: Record<string, { image: string; position?: string }> = {
  "executive-chairs": {
    image: "/images/products/green/BIG AND TALL HIGH BACK SWIVEL CHAIR.jpg",
    position: "center top",
  },
  "executive-desking": {
    image: "/images/products/green/CARINA L SHAPED DESK OAK.jpg",
    position: "center center",
  },
  "conference-tables": {
    image: "/images/products/green/ARCADIAN BOARDROOM TABLE.jpg",
    position: "center center",
  },
  "sofas-lounge": {
    image: "/images/products/green/CHESTERFIELD LEATHER COUCH 3 SEATER.png",
    position: "center center",
  },
  "storage-filing": {
    image: "/images/products/green/METAL 4 DRAWER FILING CABINET WTH BAR.jpg",
    position: "center center",
  },
};

const CategoryCards = () => {
  const { data: dbProducts } = useQuery({
    queryKey: ["storefront-products", "category-cards"],
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

  const liveProducts = mergeProducts(
    (dbProducts || []).map(propertyToProduct),
    [...products, ...greenProducts],
  );

  const featuredCategories = [
    "executive-chairs",
    "executive-desking",
    "conference-tables",
    "sofas-lounge",
    "storage-filing",
  ].map((slug, index) => {
    const category = categories.find((item) => item.slug === slug);
    const count = liveProducts.filter((product) => product.categorySlug === slug).length;
    const curated = featuredCategoryImages[slug];
    const fallbackImage = curated?.image || liveProducts.find((product) => product.categorySlug === slug)?.image || category?.image || "";
    return {
      name: category?.name || slug,
      items: `${count || 0} products`,
      slug,
      image: fallbackImage,
      imagePosition: curated?.position || "center center",
      description: category?.description || "",
      className: index < 3 ? "md:col-span-4" : "md:col-span-6",
    };
  });

  return (
    <section className="bg-[#f6f1e9] py-16 md:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm uppercase tracking-[0.28em] text-[#8d8272]">Collections</p>
            <h2 className="font-serif text-3xl leading-tight text-[#171a18] md:text-5xl">
              Browse by room, function, and furnishing intent.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-[#665f56]">
            We’ve tightened the browsing path so customers can move from a broad collection to a product page without feeling lost.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {featuredCategories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className={`group relative block overflow-hidden rounded-[28px] border border-[#e4d9ca] bg-[#1d241f] ${cat.className} min-h-[320px]`}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                style={{ objectPosition: cat.imagePosition }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,14,13,0.08),rgba(12,14,13,0.82))]" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                <div className="mb-5 flex items-center justify-between">
                  <span className="rounded-full border border-white/14 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/80">
                    {cat.items}
                  </span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7b1f34] text-white shadow-lg transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowRight size={18} />
                  </div>
                </div>
                <h3 className="max-w-sm font-serif text-2xl text-white">{cat.name}</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-white/70">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link to="/categories" className="inline-flex items-center gap-2 rounded-full border border-[#d7c8b5] px-5 py-3 text-sm font-semibold text-[#231f1c] transition-colors hover:bg-white">
            View the full catalog
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryCards;
