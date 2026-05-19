import { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";
import { categories, products, Product } from "@/data/products";
import { FilterSettings, QuickFilter, loadFilterSettings } from "@/lib/filterSettings";
import { mergeProducts, propertyToProduct } from "@/lib/storefrontProducts";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import BookVisitDialog from "@/components/BookVisitDialog";
import { ArrowDownUp, Filter, Search, X } from "lucide-react";

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

  const category = categories.find((c) => c.slug === slug);

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
    const fromStatic = products.filter((p) => p.categorySlug === slug);
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
    setSelectedQuickFilter((current) => current === filter.id ? null : filter.id);

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
          onChange={(e) => navigate(`/category/${e.target.value}`)}
          className={`h-12 w-full appearance-none rounded-2xl border border-[#d8cbbb] bg-white px-4 text-sm text-foreground outline-none ${mobile ? "" : ""}`}
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
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search in ${category?.name.toLowerCase()}...`}
            className="h-12 rounded-2xl border-[#d8cbbb] bg-white pl-10"
          />
        </div>
      )}

      {filterSettings.showMinPrice && (
        <Input
          type="number"
          min="0"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="Min price"
          className="h-12 rounded-2xl border-[#d8cbbb] bg-white"
        />
      )}

      {filterSettings.showMaxPrice && (
        <Input
          type="number"
          min="0"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Max price"
          className="h-12 rounded-2xl border-[#d8cbbb] bg-white"
        />
      )}
    </>
  );

  const handleAdd = (product: Product) => {
    addItem({ id: product.id, name: product.name, price: product.price, currency: product.currency, image: product.image });
    toast({ title: "Added to cart", description: `${product.name} added to your cart.` });
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-[160px] text-center py-20">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-4">Category not found</h1>
          <Link to="/categories"><Button variant="outline">Browse All Categories</Button></Link>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      {/* Breadcrumb */}
      <div className="pt-[120px] md:pt-[140px]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to="/categories" className="hover:text-foreground">Categories</Link>
            <span>/</span>
            <span className="text-foreground">{category.name}</span>
          </div>
        </div>
      </div>

      {/* Category header */}
      <div className="relative h-[200px] md:h-[300px] overflow-hidden">
        <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary-foreground">{category.name}</h1>
            <p className="text-primary-foreground/80 text-sm md:text-base mt-2 max-w-md mx-auto px-4">{category.description}</p>
            <button
              onClick={() => setVisitOpen(true)}
              className="text-xs font-medium border border-primary-foreground text-primary-foreground px-4 py-2 hover:bg-primary-foreground hover:text-foreground transition-colors"
            >
              Book a Showroom Visit
            </button>
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div className="container mx-auto px-4 py-8 md:py-14">
        <div className="mb-6 rounded-[28px] border border-[#e7ddcf] bg-[#fcfaf7] p-4 md:p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1a1f1b]">
                <Filter size={16} />
                Filter Products
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Narrow this category by keyword, price, or sort order.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {filteredProducts.length} of {categoryProducts.length} products
              </span>
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="rounded-full md:hidden">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-[28px] border-[#e7ddcf] bg-[#fcfaf7]">
                  <SheetHeader>
                    <SheetTitle>Filter Products</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <div className="grid gap-3">
                      <FilterFields mobile />
                    </div>
                    {enabledQuickFilters.length > 0 && (
                      <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7f70]">Quick Filters</p>
                        <div className="flex flex-wrap gap-2">
                          {enabledQuickFilters.map((filter) => (
                            <button
                              key={filter.id}
                              type="button"
                              onClick={() => applyQuickFilter(filter)}
                              className={`rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                                selectedQuickFilter === filter.id
                                  ? "border-brand-red bg-[#f8ebe8] text-brand-red"
                                  : "border-[#ddd3c6] bg-white text-[#6f6659]"
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
                          onChange={(e) => setSortBy(e.target.value)}
                          className="h-12 w-full appearance-none rounded-2xl border border-[#d8cbbb] bg-white pl-10 pr-4 text-sm text-foreground outline-none"
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
                        className="flex-1 rounded-full"
                        onClick={resetFilters}
                      >
                        Reset
                      </Button>
                      <Button
                        className="flex-1 rounded-full bg-[#7b1f34] text-white hover:bg-[#63182a]"
                        onClick={() => setMobileFiltersOpen(false)}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              {activeFilterCount > 0 && (
                <Button variant="outline" onClick={resetFilters} className="rounded-full">
                  <X className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          <div className="hidden gap-3 md:grid md:grid-cols-2 xl:grid-cols-4">
            <FilterFields />
          </div>

          {enabledQuickFilters.length > 0 && (
            <div className="mt-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7f70]">
                Quick Filters
              </div>
              <div className="flex flex-wrap gap-2">
                {enabledQuickFilters.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => applyQuickFilter(filter)}
                    className={`rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                      selectedQuickFilter === filter.id
                        ? "border-brand-red bg-[#f8ebe8] text-brand-red"
                        : "border-[#ddd3c6] bg-white text-[#6f6659]"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-[#f4ece1] px-3 py-1 text-xs font-medium text-[#6f6659]">
                  {activeFilterCount} active filter{activeFilterCount === 1 ? "" : "s"}
                </span>
              )}
              {searchTerm.trim() && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#6f6659] border border-[#e0d5c7]">
                  Search: {searchTerm}
                </span>
              )}
              {minPrice && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#6f6659] border border-[#e0d5c7]">
                  Min: {format(Number(minPrice))}
                </span>
              )}
              {maxPrice && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#6f6659] border border-[#e0d5c7]">
                  Max: {format(Number(maxPrice))}
                </span>
              )}
              {selectedQuickFilter && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#6f6659] border border-[#e0d5c7]">
                  Quick: {enabledQuickFilters.find((item) => item.id === selectedQuickFilter)?.label}
                </span>
              )}
            </div>

            {filterSettings.showSort && (
              <div className="relative hidden w-full md:block md:w-[240px]">
                <ArrowDownUp className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-12 w-full appearance-none rounded-2xl border border-[#d8cbbb] bg-white pl-10 pr-4 text-sm text-foreground outline-none"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-[28px] border border-[#e7ddcf] bg-white px-6 py-16 text-center">
            <h2 className="font-serif text-2xl text-foreground">No products match these filters</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a broader search or clear the price range.
            </p>
            <Button onClick={resetFilters} variant="outline" className="mt-5 rounded-full">
              Clear Filters
            </Button>
          </div>
        ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group bg-background">
              <div
                className="relative overflow-hidden aspect-square cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
              </div>
              <div className="p-4 md:p-5 space-y-1.5">
                <h3
                  className="font-serif text-sm md:text-base font-semibold text-foreground leading-snug cursor-pointer hover:underline"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {product.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 hidden md:block">{product.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm md:text-lg font-semibold text-foreground">{format(product.price)}</span>
                </div>
                <div className="flex gap-1 pt-1">
                  <button
                    onClick={() => handleAdd(product)}
                    className="text-[10px] md:text-xs font-medium border border-foreground text-foreground px-2 py-1 hover:bg-foreground hover:text-background transition-colors"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="text-[10px] md:text-xs font-medium border border-primary text-primary px-2 py-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      <Footer />
      <MobileBottomNav />

      <BookVisitDialog open={visitOpen} onOpenChange={setVisitOpen} />
    </div>
  );
};

export default CategoryPage;
