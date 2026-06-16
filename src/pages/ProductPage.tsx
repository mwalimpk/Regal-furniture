import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BadgePercent, Info, PackageCheck, ShoppingCart, ShieldCheck, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import StorefrontProductTile from "@/components/StorefrontProductTile";
import ProductCombinationCarousel from "@/components/ProductCombinationCarousel";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { type Product } from "@/data/products";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import RFQModal from "@/components/RFQModal";
import PromotionalBannerSlot from "@/components/PromotionalBannerSlot";
import { supabase } from "@/integrations/supabase/client";
import { fetchApprovedStorefrontProducts } from "@/lib/storefrontProducts";
import { sanitizeRichTextHtml } from "@/lib/richText";
import { extractProductSpecificationsFromHtml, mergeProductSpecifications } from "@/lib/productSpecifications";
import { getProductPromotionDisplayLabel, getProductPromotionPrice } from "@/lib/productPromotions";
import { useProductPromotionForProduct } from "@/hooks/useProductPromotions";
import { formatCurrency } from "@/utils/formatCurrency";

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem, setIsOpen } = useCart();
  const { toast } = useToast();
  const { currency } = useCurrency();
  const [rfqOpen, setRfqOpen] = useState(false);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedColorId, setSelectedColorId] = useState("");

  const { data: uniqueProducts = [], isLoading } = useQuery({
    queryKey: ["storefront-products"],
    queryFn: fetchApprovedStorefrontProducts,
  });

  const product = useMemo(
    () => uniqueProducts.find((item) => item.id === id),
    [id, uniqueProducts],
  );
  const { promotion: productPromotion } = useProductPromotionForProduct(product);

  const colorVariants = useMemo(() => product?.colorVariants || [], [product]);
  const selectedColorVariant = useMemo(
    () => colorVariants.find((variant) => variant.id === selectedColorId) || colorVariants[0] || null,
    [colorVariants, selectedColorId],
  );

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const variantImages = selectedColorVariant?.images || [];
    const images = variantImages.length ? variantImages : product.images?.length ? product.images : [product.image];
    return Array.from(new Set(images.filter(Boolean)));
  }, [product, selectedColorVariant]);

  const longDescriptionHtml = useMemo(
    () => (product?.longDescription ? sanitizeRichTextHtml(product.longDescription) : ""),
    [product],
  );

  const productSpecifications = useMemo(() => {
    if (!product) return [];

    const databaseSpecifications = [
      { label: "Category", value: product.category },
      { label: "SKU / Model", value: product.sku || "" },
      { label: "Warehouse", value: product.warehouse || "" },
      { label: "Price", value: formatCurrency(product.price, currency) },
      { label: "Color options", value: colorVariants.map((variant) => variant.name).filter(Boolean).join(", ") },
    ];

    return mergeProductSpecifications([
      ...extractProductSpecificationsFromHtml(longDescriptionHtml),
      ...databaseSpecifications,
    ]);
  }, [colorVariants, currency, longDescriptionHtml, product]);

  useEffect(() => {
    if (galleryImages.length) {
      setSelectedImage(galleryImages[0]);
    }
  }, [galleryImages]);

  useEffect(() => {
    if (!colorVariants.length) {
      setSelectedColorId("");
      return;
    }

    setSelectedColorId((current) => colorVariants.some((variant) => variant.id === current) ? current : colorVariants[0].id);
  }, [colorVariants]);

  useEffect(() => {
    if (!product) return;

    try {
      const existing = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
      const updated = [product.id, ...existing.filter((viewId: string) => viewId !== product.id)].slice(0, 4);
      localStorage.setItem("recentlyViewed", JSON.stringify(updated));

      const loadedRecent = updated
        .map((viewId: string) => uniqueProducts.find((item) => item.id === viewId))
        .filter(Boolean) as Product[];

      setRecentlyViewed(loadedRecent.filter((item) => item.id !== product.id));
    } catch (error) {
      console.error(error);
    }
  }, [product, uniqueProducts]);

  useEffect(() => {
    if (!product) {
      setRecommended([]);
      return;
    }

    let ignore = false;
    setRecommended([]);

    const fetchPairings = async () => {
      try {
        const { data, error } = await supabase
          .from("product_pairings")
          .select("recommended_ids")
          .eq("product_id", product.id)
          .maybeSingle();

        if (ignore) return;

        if (error) {
          console.error("Failed to load product pairings", error);
          setRecommended([]);
          return;
        }

        const pairing = data as { recommended_ids?: string[] } | null;

        if (pairing?.recommended_ids?.length) {
          const matched = pairing.recommended_ids
            .map((recId: string) => uniqueProducts.find((item) => item.id === recId))
            .filter(Boolean) as Product[];
          setRecommended(matched);
          return;
        }

        setRecommended([]);
      } catch (error) {
        if (!ignore) {
          console.error("Failed to load product pairings", error);
          setRecommended([]);
        }
      }
    };

    fetchPairings();

    return () => {
      ignore = true;
    };
  }, [product, uniqueProducts]);

  if (isLoading && !product) {
    return (
      <div className="flex min-h-screen flex-col items-center bg-background pt-[104px] text-center lg:pt-[180px]">
        <Navbar />
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center bg-background pt-[104px] text-center lg:pt-[180px]">
        <Navbar />
        <h1 className="mb-6 font-serif text-3xl font-bold text-foreground">Product not found</h1>
        <Link to="/categories">
          <Button>Browse All Categories</Button>
        </Link>
      </div>
    );
  }

  const productPromotionLabel = productPromotion ? getProductPromotionDisplayLabel(productPromotion) : "";
  const promotionalPrice = productPromotion ? getProductPromotionPrice(product.price, productPromotion) : null;
  const currentPrice = promotionalPrice ?? product.price;
  const comparisonPrice = promotionalPrice !== null ? product.price : null;

  const handleAdd = () => {
    const variantSuffix = selectedColorVariant ? ` - ${selectedColorVariant.name}` : "";
    addItem({
      id: selectedColorVariant ? `${product.id}:${selectedColorVariant.id}` : product.id,
      name: `${product.name}${variantSuffix}`,
      price: currentPrice,
      currency: product.currency,
      image: selectedImage || selectedColorVariant?.images[0] || product.image,
    });
    setIsOpen(true);
    toast({ title: "Cart Updated", description: `${product.name}${variantSuffix} ready for checkout.` });
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-[96px] md:pb-0 lg:pt-[172px]">
      <Navbar />

      <div className="border-b border-grid/40 bg-background/92 backdrop-blur">
        <div className="container mx-auto px-10 py-4">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-interactive">Home</Link>
            <span>/</span>
            <Link to={`/category/${product.categorySlug}`} className="transition-colors hover:text-interactive">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-10 py-10 md:py-14">
        <div className="grid gap-12 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <div className="grid gap-4 lg:grid-cols-[92px_minmax(0,1fr)] lg:items-start">
              <div className="order-2 flex gap-3 overflow-x-auto pb-2 lg:order-1 lg:flex-col lg:overflow-visible lg:pb-0">
                {galleryImages.slice(0, 6).map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={`product-media-panel relative flex h-24 w-24 flex-none items-center justify-center overflow-hidden p-2 transition-colors ${
                      selectedImage === image ? "ring-1 ring-heritage" : "hover:ring-1 hover:ring-interactive/60"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="h-full w-full object-contain object-center"
                    />
                  </button>
                ))}
              </div>

              <div className="order-1">
                <div className="product-media-panel relative flex h-[360px] items-center justify-center overflow-hidden p-0 sm:h-[460px] lg:h-[560px] xl:h-[620px]">
                  <img
                    src={selectedImage || product.image}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-[1.02]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="surface-elevated p-5">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center border border-grid/25 bg-background text-heritage">
                  <Truck className="h-5 w-5" />
                </div>
                <p className="font-serif text-xl leading-tight text-foreground">Delivery</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Coordinated city delivery with assembly support where needed.
                </p>
              </div>
              <div className="surface-elevated p-5">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center border border-grid/25 bg-background text-heritage">
                  <PackageCheck className="h-5 w-5" />
                </div>
                <p className="font-serif text-xl leading-tight text-foreground">Bulk Buying</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Suitable for team rollouts, hospitality, and multi-room fit-outs.
                </p>
              </div>
              <div className="surface-elevated p-5">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center border border-grid/25 bg-background text-heritage">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <p className="font-serif text-xl leading-tight text-foreground">Warranty</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Backed by manufacturer cover and after-sales support.
                </p>
              </div>
            </div>
          </div>

          <div className="xl:col-span-5 xl:pl-4">
            <div className="xl:sticky xl:top-[188px]">
              <div className="inline-flex bg-heritage/12 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-heritage">
                {product.category}
              </div>

              <h1 className="mt-5 font-serif text-4xl leading-tight text-foreground md:text-5xl">
                {product.name}
              </h1>

              <div className="mt-5 flex items-center gap-3">
                <div className="flex text-interactive">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={`${index < 4 ? "fill-current" : "fill-current opacity-25"} h-4 w-4`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-muted-foreground">Trusted workspace essential</span>
              </div>

              <p className="mt-6 text-sm leading-8 text-muted-foreground md:text-base">
                {product.description} Built for modern offices, reception areas, and disciplined home workstations,
                with a layout that puts finish, proportion, and buying clarity ahead of visual clutter.
              </p>

              {colorVariants.length > 0 && (
                <div className="mt-8 border border-grid/25 bg-card p-5">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-label">Color</p>
                    <p className="text-sm font-medium text-foreground">{selectedColorVariant?.name}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colorVariants.map((variant) => {
                      const selected = selectedColorVariant?.id === variant.id;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => setSelectedColorId(variant.id)}
                          className={`flex min-h-12 items-center gap-3 border px-3 py-2 text-left transition-colors ${
                            selected
                              ? "border-heritage bg-heritage/10 text-foreground"
                              : "border-grid/30 bg-background text-muted-foreground hover:border-interactive/60 hover:text-foreground"
                          }`}
                          aria-pressed={selected}
                        >
                          <span
                            className="h-7 w-7 shrink-0 border border-grid/35"
                            style={{ backgroundColor: variant.hex }}
                            aria-hidden="true"
                          />
                          <span className="text-sm font-medium">{variant.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="product-media-panel mt-8 p-6 md:p-7">
                <div className="flex flex-wrap items-end gap-4">
                  <span className="font-serif text-5xl text-heritage">
                    {formatCurrency(currentPrice, currency)}
                  </span>
                  {comparisonPrice !== null && comparisonPrice > currentPrice && (
                    <span className="mb-1 text-xl font-medium text-muted-foreground/70 line-through">
                      {formatCurrency(comparisonPrice, currency)}
                    </span>
                  )}
                  <span className="mb-2 bg-background/78 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-label">
                    {productPromotion ? productPromotionLabel : "Project rate available"}
                  </span>
                </div>

                {productPromotion && (
                  <div className="mt-6 border border-interactive/35 bg-interactive/10 p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center border border-interactive/30 bg-background/70 text-interactive">
                        <BadgePercent className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-label">Live promotion</p>
                        <p className="mt-1 font-serif text-2xl leading-tight text-foreground">{productPromotionLabel}</p>
                        {productPromotion.description && (
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{productPromotion.description}</p>
                        )}
                        {productPromotion.ends_at && (
                          <p className="mt-3 text-xs font-medium text-muted-foreground">
                            Ends {new Date(productPromotion.ends_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Button
                    onClick={handleAdd}
                    className="h-14 flex-1 rounded-none bg-heritage font-mono text-[11px] uppercase tracking-[0.22em] text-primary-foreground hover:bg-heritage/90"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                  <Button
                    onClick={() => setRfqOpen(true)}
                    className="h-14 flex-1 rounded-none bg-crimson font-mono text-[11px] uppercase tracking-[0.22em] text-primary-foreground hover:bg-crimson/90 hover:text-primary-foreground"
                  >
                    Request Quote
                  </Button>
                </div>
              </div>

              <div className="mt-8 border-t border-grid/30 pt-6">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-serif text-2xl text-foreground">Specifications</h2>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-label">
                    Product data
                  </span>
                </div>

                <div className="space-y-4">
                  {productSpecifications.map((specification, index) => (
                    <div
                      key={`${specification.label}-${index}`}
                      className={`flex justify-between gap-4 text-sm ${
                        index < productSpecifications.length - 1 ? "border-b border-grid/20 pb-4" : "pb-1"
                      }`}
                    >
                      <span className="text-muted-foreground">{specification.label}</span>
                      <span className="max-w-[62%] text-right font-medium text-foreground">{specification.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex gap-4 bg-heritage/8 p-4">
                  <div className="mt-1 text-heritage"><Info size={20} /></div>
                  <div>
                    <h3 className="pb-1 text-sm font-semibold text-foreground">Need 10+ units?</h3>
                    <p className="text-xs leading-6 text-muted-foreground">
                      Get special bulk pricing for offices, hotels, and large projects.{" "}
                      <button
                        type="button"
                        onClick={() => setRfqOpen(true)}
                        className="cursor-pointer font-semibold text-heritage underline"
                      >
                        Request a bulk quote
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-grid/40 pt-12">
          {longDescriptionHtml ? (
            <div
              className="rich-text-content"
              dangerouslySetInnerHTML={{ __html: longDescriptionHtml }}
            />
          ) : (
            <div className="rich-text-content">
              <p>{product.description}</p>
            </div>
          )}
        </div>

        <PromotionalBannerSlot placement="product-after-summary" pageCategory={product.category} className="mt-14" />
      </div>

      <PromotionalBannerSlot placement="product-before-recommendations" pageCategory={product.category} />

      <ProductCombinationCarousel product={product} combinations={recommended} relatedProducts={uniqueProducts} />

      <div className="border-t border-grid/40 bg-background py-16">
        <div className="container mx-auto space-y-16 px-10">
          {recentlyViewed.length > 0 && (
            <div>
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-label">History</p>
                  <h2 className="mt-3 font-serif text-3xl text-foreground">Recently Viewed</h2>
                </div>
                <Link
                  to="/categories"
                  className="hidden items-center gap-2 border-b border-grid pb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-interactive hover:text-interactive md:flex"
                >
                  Continue browsing
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
                {recentlyViewed.map((item) => (
                  <StorefrontProductTile
                    key={item.id}
                    product={item}
                    relatedProducts={uniqueProducts}
                    compact
                    showDescription={false}
                    imagePanelClassName="product-media-panel"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
      <RFQModal open={rfqOpen} onOpenChange={setRfqOpen} productName={product.name} />
    </div>
  );
};

export default ProductPage;
