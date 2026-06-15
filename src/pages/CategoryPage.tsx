import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProductCategories } from "@/hooks/useProductCategories";
import { categoryFeaturedUrl } from "@/lib/productCategories";
import { fetchApprovedStorefrontProducts } from "@/lib/storefrontProducts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import PromotionalBannerSlot from "@/components/PromotionalBannerSlot";
import StorefrontProductTile from "@/components/StorefrontProductTile";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: categories = [], isLoading: loadingCategories } = useProductCategories();
  const category = categories.find((item) => item.slug === slug);

  const {
    data: allProducts = [],
    error: productsError,
    isLoading: loadingProducts,
  } = useQuery({
    queryKey: ["storefront-products"],
    queryFn: fetchApprovedStorefrontProducts,
    enabled: !loadingCategories && !!category,
  });

  const categoryProducts = allProducts.filter((product) => product.categorySlug === slug);
  const hasFeaturedSubcategories = Boolean(category?.featured.length);

  if (loadingCategories) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="py-20 pt-[112px] text-center lg:pt-[180px]">
          <p className="text-muted-foreground">Loading category...</p>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="py-20 pt-[112px] text-center lg:pt-[180px]">
          <h1 className="mb-4 font-serif text-2xl font-bold text-foreground">Category not found</h1>
          <Link to="/categories">
            <Button variant="outline">Browse All Categories</Button>
          </Link>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <div className="pt-[96px] lg:pt-[172px]">
        <div className="border-b border-grid/40 bg-background/92 backdrop-blur">
          <div className="container mx-auto px-10 py-4">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <Link to="/" className="transition-colors hover:text-foreground">Home</Link>
              <span>/</span>
              <Link to="/categories" className="transition-colors hover:text-foreground">Categories</Link>
              <span>/</span>
              <span className="text-foreground">{category.name}</span>
            </div>
          </div>
        </div>

        <PromotionalBannerSlot placement="category-top" pageCategory={category.name} />

        <div className="container mx-auto px-10 py-8 md:py-12">
          <div className="grid gap-6 lg:h-[680px] lg:grid-cols-12">
            <div className="product-media-panel flex flex-col justify-between p-7 md:p-10 lg:col-span-5 lg:h-full lg:min-h-0">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-label">
                  Collection Overview
                </p>
                <h1 className="mt-4 font-serif text-4xl leading-tight text-foreground md:text-5xl">
                  {category.name}
                </h1>
                <p className="mt-5 max-w-xl text-sm leading-8 text-muted-foreground md:text-base">
                  {category.description}
                </p>
              </div>

              <div className="mt-8 grid gap-5 border-t border-grid/30 pt-6 sm:grid-cols-2">
                <div>
                  <p className="font-serif text-3xl text-foreground">{category.featured.length}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-label">Featured</p>
                </div>
                <div>
                  <p className="font-serif text-3xl text-foreground">{categoryProducts.length}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-label">Products</p>
                </div>
              </div>
            </div>

            <div className="relative min-h-[320px] overflow-hidden surface-elevated lg:col-span-7 lg:h-full lg:min-h-0">
              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover object-center"
              />
              <div className="media-mask-soft absolute inset-0" />
              <div className="absolute bottom-0 left-0 p-6 md:p-8">
                <div className="media-chip px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em]">
                    {hasFeaturedSubcategories ? "Choose a featured subcategory" : "Browse category products"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-10 pb-12 md:pb-20">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-label">
                {hasFeaturedSubcategories ? "Featured" : "Products"}
              </p>
              <h2 className="mt-3 font-serif text-3xl text-foreground md:text-4xl">
                {hasFeaturedSubcategories ? "Browse by furniture type" : `Shop ${category.name}`}
              </h2>
            </div>
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 border-b border-grid pb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground transition-colors hover:border-interactive hover:text-interactive"
            >
              All categories
              <ArrowRight size={16} />
            </Link>
          </div>

          <PromotionalBannerSlot placement="category-before-grid" pageCategory={category.name} className="mb-8" />

          {!hasFeaturedSubcategories ? (
            loadingProducts ? (
              <div className="bg-card/60 px-6 py-16 text-center text-sm text-muted-foreground">
                Loading products...
              </div>
            ) : productsError ? (
              <div className="border border-destructive/30 bg-destructive/10 px-6 py-16 text-center text-sm text-destructive">
                {productsError instanceof Error ? productsError.message : "Could not load products."}
              </div>
            ) : !categoryProducts.length ? (
              <div className="bg-card/60 px-6 py-16 text-center">
                <h2 className="font-serif text-2xl text-foreground">No products found</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add products to this category in the admin product editor.
                </p>
              </div>
            ) : (
              <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-4">
                {categoryProducts.map((product) => (
                  <StorefrontProductTile
                    key={product.id}
                    product={product}
                    relatedProducts={categoryProducts}
                    compact
                  />
                ))}
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {category.featured.map((item) => {
                const productCount = categoryProducts.filter((product) => product.featuredSlug === item.slug).length;

                return (
                  <Link
                    key={item.id}
                    to={categoryFeaturedUrl(category.slug, item.slug)}
                    className="group relative min-h-[360px] overflow-hidden surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <img src={item.image_url || category.image} alt={item.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="collection-image-scrim absolute inset-0" />
                    <div className="absolute inset-x-0 bottom-0 z-10 p-6">
                      <p className="media-chip mb-4 inline-flex border-0 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em]">
                        {productCount} product{productCount === 1 ? "" : "s"}
                      </p>
                      <h3 className="collection-image-adaptive font-serif text-3xl leading-tight">{item.name}</h3>
                      <span className="collection-image-adaptive mt-5 inline-flex items-center gap-2 pb-2 font-mono text-[11px] uppercase tracking-[0.2em]">
                        View catalogue
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default CategoryPage;
