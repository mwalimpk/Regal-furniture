import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import Navbar from "@/components/Navbar";
import PromotionalBannerSlot from "@/components/PromotionalBannerSlot";
import StorefrontProductTile from "@/components/StorefrontProductTile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProductCategories } from "@/hooks/useProductCategories";
import { categoryUrl } from "@/lib/productCategories";
import { fetchApprovedStorefrontProducts } from "@/lib/storefrontProducts";

const PAGE_SIZE_OPTIONS = [8, 12, 16, 24];
const ALL_FILTER_VALUE = "all";

type SortMode = "featured" | "price-asc" | "price-desc" | "name-asc";
type PageItem = number | "ellipsis";

const getUniqueFilterOptions = (values: Array<string | null | undefined>) =>
  Array.from(new Set(values.map((value) => String(value || "").trim()).filter(Boolean)))
    .sort((left, right) => left.localeCompare(right));

const getPageItems = (page: number, pageCount: number): PageItem[] => {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const visiblePages = Array.from(pages)
    .filter((item) => item >= 1 && item <= pageCount)
    .sort((left, right) => left - right);

  return visiblePages.reduce<PageItem[]>((items, item, index) => {
    const previous = visiblePages[index - 1];
    if (previous && item - previous > 1) items.push("ellipsis");
    items.push(item);
    return items;
  }, []);
};

const FeaturedCategoryPage = () => {
  const { slug, featuredSlug } = useParams<{ slug: string; featuredSlug: string }>();
  const { data: categories = [], isLoading: loadingCategories } = useProductCategories();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);
  const [page, setPage] = useState(1);
  const [warehouseFilter, setWarehouseFilter] = useState(ALL_FILTER_VALUE);
  const [currencyFilter, setCurrencyFilter] = useState(ALL_FILTER_VALUE);
  const [colorFilter, setColorFilter] = useState(ALL_FILTER_VALUE);

  const category = useMemo(
    () => categories.find((item) => item.slug === slug),
    [categories, slug],
  );
  const featured = useMemo(
    () => category?.featured.find((item) => item.slug === featuredSlug) || null,
    [category, featuredSlug],
  );

  const {
    data: allProducts = [],
    error,
    isLoading: loadingProducts,
  } = useQuery({
    queryKey: ["storefront-products"],
    queryFn: fetchApprovedStorefrontProducts,
    enabled: !loadingCategories && Boolean(category && featured),
  });

  const subcategoryProducts = useMemo(
    () =>
      allProducts.filter(
        (product) => product.categorySlug === slug && product.featuredSlug === featuredSlug,
      ),
    [allProducts, featuredSlug, slug],
  );

  const warehouseOptions = useMemo(
    () => getUniqueFilterOptions(subcategoryProducts.map((product) => product.warehouse)),
    [subcategoryProducts],
  );
  const currencyOptions = useMemo(
    () => getUniqueFilterOptions(subcategoryProducts.map((product) => product.currency)),
    [subcategoryProducts],
  );
  const colorOptions = useMemo(
    () => getUniqueFilterOptions(
      subcategoryProducts.flatMap((product) => product.colorVariants?.map((variant) => variant.name) || []),
    ),
    [subcategoryProducts],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const entryFiltered = subcategoryProducts.filter((product) => {
      const productColors = product.colorVariants?.map((variant) => variant.name).filter(Boolean) || [];

      if (warehouseFilter !== ALL_FILTER_VALUE && product.warehouse !== warehouseFilter) return false;
      if (currencyFilter !== ALL_FILTER_VALUE && product.currency !== currencyFilter) return false;
      if (colorFilter !== ALL_FILTER_VALUE && !productColors.includes(colorFilter)) return false;

      return true;
    });

    const searched = normalizedSearch
      ? entryFiltered.filter((product) =>
          [product.name, product.description, product.longDescription, product.sku, product.warehouse]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch),
        )
      : entryFiltered;

    return [...searched].sort((left, right) => {
      if (sortMode === "price-asc") return left.price - right.price;
      if (sortMode === "price-desc") return right.price - left.price;
      if (sortMode === "name-asc") return left.name.localeCompare(right.name);
      return 0;
    });
  }, [colorFilter, currencyFilter, searchTerm, sortMode, subcategoryProducts, warehouseFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const displayStart = filteredProducts.length ? (currentPage - 1) * pageSize + 1 : 0;
  const displayEnd = Math.min(currentPage * pageSize, filteredProducts.length);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pageItems = useMemo(() => getPageItems(currentPage, totalPages), [currentPage, totalPages]);
  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    warehouseFilter !== ALL_FILTER_VALUE ||
    currencyFilter !== ALL_FILTER_VALUE ||
    colorFilter !== ALL_FILTER_VALUE;

  const clearProductFilters = () => {
    setSearchTerm("");
    setWarehouseFilter(ALL_FILTER_VALUE);
    setCurrencyFilter(ALL_FILTER_VALUE);
    setColorFilter(ALL_FILTER_VALUE);
  };

  useEffect(() => {
    setPage(1);
  }, [colorFilter, currencyFilter, featuredSlug, pageSize, searchTerm, slug, sortMode, warehouseFilter]);

  useEffect(() => {
    setPage((current) => Math.min(Math.max(current, 1), totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (warehouseFilter !== ALL_FILTER_VALUE && !warehouseOptions.includes(warehouseFilter)) {
      setWarehouseFilter(ALL_FILTER_VALUE);
    }
  }, [warehouseFilter, warehouseOptions]);

  useEffect(() => {
    if (currencyFilter !== ALL_FILTER_VALUE && !currencyOptions.includes(currencyFilter)) {
      setCurrencyFilter(ALL_FILTER_VALUE);
    }
  }, [currencyFilter, currencyOptions]);

  useEffect(() => {
    if (colorFilter !== ALL_FILTER_VALUE && !colorOptions.includes(colorFilter)) {
      setColorFilter(ALL_FILTER_VALUE);
    }
  }, [colorFilter, colorOptions]);

  if (loadingCategories) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="py-20 pt-[112px] text-center lg:pt-[180px]">
          <p className="text-muted-foreground">Loading featured catalogue...</p>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  if (!category || !featured) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-10 py-20 pt-[112px] text-center lg:pt-[180px]">
          <h1 className="mb-4 font-serif text-2xl font-bold text-foreground">
            Featured catalogue not found
          </h1>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            {category && (
              <Link to={categoryUrl(category.slug)}>
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4" />
                  Back to {category.name}
                </Button>
              </Link>
            )}
            <Link to="/categories">
              <Button variant={category ? "default" : "outline"}>Browse All Categories</Button>
            </Link>
          </div>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <main className="pt-[96px] lg:pt-[172px]">
        <div className="border-b border-grid/40 bg-background/92 backdrop-blur">
          <div className="container mx-auto px-10 py-4">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <Link to="/" className="transition-colors hover:text-foreground">Home</Link>
              <span>/</span>
              <Link to="/categories" className="transition-colors hover:text-foreground">Categories</Link>
              <span>/</span>
              <Link to={categoryUrl(category.slug)} className="transition-colors hover:text-foreground">
                {category.name}
              </Link>
              <span>/</span>
              <span className="text-foreground">{featured.name}</span>
            </div>
          </div>
        </div>

        <PromotionalBannerSlot placement="category-top" pageCategory={category.name} />

        <section className="container mx-auto px-10 py-8 md:py-12">
          <div className="grid gap-6 lg:h-[620px] lg:grid-cols-12">
            <div className="product-media-panel flex flex-col justify-between p-7 md:p-10 lg:col-span-5 lg:h-full lg:min-h-0">
              <div>
                <Link
                  to={categoryUrl(category.slug)}
                  className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-label transition-colors hover:text-foreground"
                >
                  <ArrowLeft size={16} />
                  {category.name}
                </Link>
                <h1 className="mt-5 font-serif text-4xl leading-tight text-foreground md:text-5xl">
                  {featured.name}
                </h1>
                <p className="mt-5 max-w-xl text-sm leading-8 text-muted-foreground md:text-base">
                  Browse every approved product assigned to this featured furniture type.
                </p>
              </div>

              <div className="mt-8 grid gap-5 border-t border-grid/30 pt-6 sm:grid-cols-2">
                <div>
                  <p className="font-serif text-3xl text-foreground">{subcategoryProducts.length}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-label">Products</p>
                </div>
                <div>
                  <p className="font-serif text-3xl text-foreground">{PAGE_SIZE_OPTIONS.length}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-label">Page sizes</p>
                </div>
              </div>
            </div>

            <div className="relative min-h-[320px] overflow-hidden surface-elevated lg:col-span-7 lg:h-full lg:min-h-0">
              <img
                src={featured.image_url || category.image}
                alt={featured.name}
                className="h-full w-full object-cover object-center"
              />
              <div className="media-mask-soft absolute inset-0" />
              <div className="absolute bottom-0 left-0 p-6 md:p-8">
                <div className="media-chip px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em]">
                    {category.name} catalogue
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-10 pb-12 md:pb-20">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-label">Catalogue</p>
              <h2 className="mt-3 font-serif text-3xl text-foreground md:text-4xl">
                {featured.name}
              </h2>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-5xl lg:grid-cols-3 xl:grid-cols-[minmax(220px,1.2fr)_minmax(150px,0.75fr)_minmax(140px,0.65fr)_minmax(140px,0.65fr)_170px_150px]">
              <label className="relative block">
                <span className="sr-only">Search products</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search products"
                  className="pl-9"
                />
              </label>

              <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                <SelectTrigger aria-label="Filter by warehouse">
                  <SelectValue placeholder="Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER_VALUE}>All warehouses</SelectItem>
                  {warehouseOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                <SelectTrigger aria-label="Filter by currency">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER_VALUE}>All currencies</SelectItem>
                  {currencyOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={colorFilter} onValueChange={setColorFilter}>
                <SelectTrigger aria-label="Filter by color">
                  <SelectValue placeholder="Color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER_VALUE}>All colors</SelectItem>
                  {colorOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortMode} onValueChange={(value) => setSortMode(value as SortMode)}>
                <SelectTrigger aria-label="Sort products">
                  <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: low to high</SelectItem>
                  <SelectItem value="price-desc">Price: high to low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>

              <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger aria-label="Products per page">
                  <SelectValue placeholder="Per page" />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option} per page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <PromotionalBannerSlot placement="category-before-grid" pageCategory={category.name} className="mb-8" />

          {loadingProducts ? (
            <div className="bg-card/60 px-6 py-16 text-center text-sm text-muted-foreground">
              Loading products...
            </div>
          ) : error ? (
            <div className="border border-destructive/30 bg-destructive/10 px-6 py-16 text-center text-sm text-destructive">
              {error instanceof Error ? error.message : "Could not load products."}
            </div>
          ) : !filteredProducts.length ? (
            <div className="bg-card/60 px-6 py-16 text-center">
              <h2 className="font-serif text-2xl text-foreground">No products found</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {hasActiveFilters
                  ? "Try another search or clear one of the catalogue filters."
                  : "Assign products to this featured subcategory in the admin product editor."}
              </p>
              {hasActiveFilters && (
                <Button type="button" variant="outline" onClick={clearProductFilters} className="mt-5">
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-4">
                {paginatedProducts.map((product) => (
                  <StorefrontProductTile
                    key={product.id}
                    product={product}
                    relatedProducts={subcategoryProducts}
                    compact
                  />
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-4 border-t border-grid/30 pt-6 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {displayStart}-{displayEnd} of {filteredProducts.length} products
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>

                  <div className="hidden items-center gap-1 sm:flex">
                    {pageItems.map((item, index) =>
                      item === "ellipsis" ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-sm text-muted-foreground">...</span>
                      ) : (
                        <Button
                          key={item}
                          type="button"
                          variant={currentPage === item ? "default" : "ghost"}
                          size="sm"
                          className="h-9 w-9 px-0"
                          onClick={() => setPage(item)}
                          aria-current={currentPage === item ? "page" : undefined}
                        >
                          {item}
                        </Button>
                      ),
                    )}
                  </div>

                  <span className="px-2 text-sm text-muted-foreground sm:hidden">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default FeaturedCategoryPage;
