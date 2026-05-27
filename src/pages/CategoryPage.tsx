import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownUp, ArrowRight, Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";
import { categories, Product, products } from "@/data/products";
import { QuickFilter, loadFilterSettings } from "@/lib/filterSettings";
import { mergeProducts, propertyToProduct } from "@/lib/storefrontProducts";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import BookVisitDialog from "@/components/BookVisitDialog";
import ProductHoverMedia from "@/components/ProductHoverMedia";
import PromotionalBannerSlot from "@/components/PromotionalBannerSlot";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useToast();
  const { format } = useCurrency();
  const [visitOpen, setVisitOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string | null>(null);

  const category = categories.find((item) => item.slug === slug);

  const { data: filterSettings = loadFilterSettings() } = useQuery({
    queryKey: ["store-filter-settings"],
    queryFn: async () => loadFilterSettings(),
  });

  const relatedCollections = ((filterSettings.collectionGroups?.[slug || ""] || [slug || ""])
    .map((itemSlug) => categories.find((categoryItem) => categoryItem.slug === itemSlug))
    .filter(Boolean)) as typeof categories;

  const { data: dbProducts } = useQuery({
    queryKey: ["category-products", category?.name],
    queryFn: async () => {
      if (!category) return [];
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "approved")
        .eq("property_type", category.name)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!category,
  });

  const categoryProducts: Product[] = useMemo(() => {
    const fromDb: Product[] = (dbProducts || []).map(propertyToProduct);
    const fromStatic = products.filter((product) => product.categorySlug === slug);
    return mergeProducts(fromDb, fromStatic);
  }, [dbProducts, slug]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;

    let next = categoryProducts.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch);

      const matchesMin = min === null || product.price >= min;
      const matchesMax = max === null || product.price <= max;

      return matchesSearch && matchesMin && matchesMax;
    });

    switch (sortBy) {
      case "price-low":
        next = [...next].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        next = [...next].sort((a, b) => b.price - a.price);
        break;
      case "name":
        next = [...next].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return next;
  }, [categoryProducts, searchTerm, minPrice, maxPrice, sortBy]);

  const enabledQuickFilters = filterSettings.quickFilters.filter((item) => item.enabled);

  const activeFilterCount = [
    searchTerm.trim(),
    minPrice.trim(),
    maxPrice.trim(),
    sortBy !== "featured" ? sortBy : "",
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("featured");
    setSelectedQuickFilter(null);
  };

  const applyQuickFilter = (filter: QuickFilter) => {
    setSelectedQuickFilter((current) => (current === filter.id ? null : filter.id));

    if (selectedQuickFilter === filter.id) {
      resetFilters();
      return;
    }

    if (filter.type === "max_price") {
      setMaxPrice(filter.value);
      setMinPrice("");
      if (!filterSettings.showSearch) setSearchTerm("");
    }

    if (filter.type === "min_price") {
      setMinPrice(filter.value);
      setMaxPrice("");
      if (!filterSettings.showSearch) setSearchTerm("");
    }

    if (filter.type === "keyword") {
      setSearchTerm(filter.value);
      setMinPrice("");
      setMaxPrice("");
    }
  };

  const FilterFields = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {relatedCollections.length > 1 && (
        <select
          value={slug || ""}
          onChange={(event) => navigate(`/category/${event.target.value}`)}
          className="h-12 w-full appearance-none bg-background/82 px-4 text-sm text-foreground outline-none transition-colors focus:bg-background"
        >
          {relatedCollections.map((collection) => (
            <option key={collection.slug} value={collection.slug}>
              Collection: {collection.name}
            </option>
          ))}
        </select>
      )}

      {filterSettings.showSearch && (
        <div className={`relative ${mobile ? "" : "xl:col-span-2"}`}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={`Search in ${category?.name.toLowerCase()}...`}
            className="h-12 border-0 bg-background/82 pl-10 focus-visible:ring-1 focus-visible:ring-interactive"
          />
        </div>
      )}

      {filterSettings.showMinPrice && (
        <Input
          type="number"
          min="0"
          value={minPrice}
          onChange={(event) => setMinPrice(event.target.value)}
          placeholder="Min price"
          className="h-12 border-0 bg-background/82 focus-visible:ring-1 focus-visible:ring-interactive"
        />
      )}

      {filterSettings.showMaxPrice && (
        <Input
          type="number"
          min="0"
          value={maxPrice}
          onChange={(event) => setMaxPrice(event.target.value)}
          placeholder="Max price"
          className="h-12 border-0 bg-background/82 focus-visible:ring-1 focus-visible:ring-interactive"
        />
      )}
    </>
  );

  const handleAdd = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      image: product.image,
    });
    toast({ title: "Added to cart", description: `${product.name} added to your cart.` });
  };

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
          <div className="grid gap-6 lg:h-[700px] lg:grid-cols-12">
            <div className="product-media-panel flex flex-col p-7 md:p-10 lg:col-span-5 lg:h-full lg:min-h-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-label">
                Collection Overview
              </p>
              <h1 className="mt-4 font-serif text-4xl leading-tight text-foreground md:text-5xl">
                {category.name}
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-8 text-muted-foreground md:text-base">
                {category.description}
              </p>

              <div className="mt-8 grid gap-5 border-t border-grid/30 pt-6 sm:grid-cols-3">
                <div>
                  <p className="font-serif text-3xl text-foreground">{categoryProducts.length}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-label">Products</p>
                </div>
                <div>
                  <p className="font-serif text-3xl text-foreground">{relatedCollections.length}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-label">Collections</p>
                </div>
                <div>
                  <p className="font-serif text-3xl text-foreground">{enabledQuickFilters.length}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-label">Quick Filters</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setVisitOpen(true)}
                  className="inline-flex min-h-14 items-center justify-center bg-heritage px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-primary-foreground transition-colors hover:bg-heritage/90"
                >
                  Book a showroom visit
                </button>
                <Link
                  to="/categories"
                  className="inline-flex min-h-14 items-center justify-center gap-2 bg-background/72 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground transition-colors hover:bg-background"
                >
                  Browse all categories
                  <ArrowRight size={16} />
                </Link>
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
                    Curated for modern workspaces
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-10 pb-10 md:pb-16">
          <div className="bg-card/55 p-5 md:p-7">
            <div className="flex flex-col gap-4 border-b border-grid/30 pb-5 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground">
                  <Filter size={15} className="text-interactive" />
                  Refine the collection
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Search, filter by budget, and sort the catalog without losing the collection context.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {filteredProducts.length} of {categoryProducts.length} products
                </span>

                {filterSettings.showSort && (
                  <div className="relative hidden w-full md:block md:w-[240px]">
                    <ArrowDownUp className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                      className="h-12 w-full appearance-none bg-background/82 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:bg-background"
                    >
                      <option value="featured">Sort: Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name">Name: A to Z</option>
                    </select>
                  </div>
                )}

                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="rounded-none md:hidden">
                      <Filter className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-none border-grid bg-card">
                    <SheetHeader>
                      <SheetTitle>Filter Products</SheetTitle>
                    </SheetHeader>

                    <div className="mt-6 space-y-4">
                      <div className="grid gap-3">
                        <FilterFields mobile />
                      </div>

                      {enabledQuickFilters.length > 0 && (
                        <div>
                          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-label">Quick Filters</p>
                          <div className="flex flex-wrap gap-2">
                            {enabledQuickFilters.map((filter) => (
                              <button
                                key={filter.id}
                                type="button"
                                onClick={() => applyQuickFilter(filter)}
                                className={`px-3 py-2 text-xs transition-colors ${
                                  selectedQuickFilter === filter.id
                                    ? "bg-heritage text-primary-foreground"
                                    : "bg-background text-foreground/72 hover:bg-secondary hover:text-foreground"
                                }`}
                              >
                                {filter.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {filterSettings.showSort && (
                        <div className="relative">
                          <ArrowDownUp className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <select
                            value={sortBy}
                            onChange={(event) => setSortBy(event.target.value)}
                            className="h-12 w-full appearance-none bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-colors"
                          >
                            <option value="featured">Sort: Featured</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name">Name: A to Z</option>
                          </select>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 rounded-none"
                          onClick={resetFilters}
                        >
                          Reset
                        </Button>
                        <Button
                          className="flex-1 rounded-none bg-heritage text-primary-foreground hover:bg-heritage/90"
                          onClick={() => setMobileFiltersOpen(false)}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 border-b border-grid pb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-interactive hover:text-interactive"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reset filters
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 hidden gap-3 md:grid md:grid-cols-2 xl:grid-cols-4">
              <FilterFields />
            </div>

            {enabledQuickFilters.length > 0 && (
              <div className="mt-5">
                <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-label">
                  Quick Filters
                </div>
                <div className="flex flex-wrap gap-2">
                  {enabledQuickFilters.map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => applyQuickFilter(filter)}
                      className={`px-3 py-2 text-xs transition-colors ${
                        selectedQuickFilter === filter.id
                          ? "bg-heritage text-primary-foreground"
                          : "bg-background/82 text-foreground/72 hover:bg-background hover:text-foreground"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {activeFilterCount > 0 && (
                <span className="bg-background/82 px-3 py-1 text-xs text-foreground/72">
                  {activeFilterCount} active filter{activeFilterCount === 1 ? "" : "s"}
                </span>
              )}
              {searchTerm.trim() && (
                <span className="bg-background/82 px-3 py-1 text-xs text-foreground/72">
                  Search: {searchTerm}
                </span>
              )}
              {minPrice && (
                <span className="bg-background/82 px-3 py-1 text-xs text-foreground/72">
                  Min: {format(Number(minPrice))}
                </span>
              )}
              {maxPrice && (
                <span className="bg-background/82 px-3 py-1 text-xs text-foreground/72">
                  Max: {format(Number(maxPrice))}
                </span>
              )}
              {selectedQuickFilter && (
                <span className="bg-background/82 px-3 py-1 text-xs text-foreground/72">
                  Quick: {enabledQuickFilters.find((item) => item.id === selectedQuickFilter)?.label}
                </span>
              )}
            </div>
          </div>

          <PromotionalBannerSlot placement="category-before-grid" pageCategory={category.name} className="mt-8" />

          {filteredProducts.length === 0 ? (
            <div className="mt-10 bg-card/60 px-6 py-16 text-center">
              <h2 className="font-serif text-2xl text-foreground">No products match these filters</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a broader search or clear the price range.
              </p>
              <Button onClick={resetFilters} variant="outline" className="mt-5 rounded-none">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-x-7 gap-y-14 sm:grid-cols-2 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group flex h-full flex-col text-foreground">
                  <ProductHoverMedia
                    product={product}
                    relatedProducts={categoryProducts}
                    label={product.category}
                    className="aspect-[4/4.7]"
                    onClick={() => navigate(`/product/${product.id}`)}
                  />

                  <div className="mt-5 flex flex-1 flex-col">
                    <h3
                      className="cursor-pointer font-serif text-xl leading-tight text-foreground transition-colors hover:text-interactive md:text-[1.55rem]"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      {product.name}
                    </h3>
                    <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-muted-foreground">
                      {product.description}
                    </p>

                    <div className="mt-5 flex items-end justify-between gap-4">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-label">
                          Starting at
                        </p>
                        <p className="mt-1 font-serif text-2xl text-heritage md:text-[2rem]">
                          {format(product.price)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="inline-flex items-center gap-2 border-b border-grid pb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-interactive hover:text-interactive"
                      >
                        View
                        <ArrowRight size={16} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAdd(product)}
                      className="mt-5 inline-flex min-h-12 items-center justify-center bg-card/80 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-card"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
      <BookVisitDialog open={visitOpen} onOpenChange={setVisitOpen} />
    </div>
  );
};

export default CategoryPage;
