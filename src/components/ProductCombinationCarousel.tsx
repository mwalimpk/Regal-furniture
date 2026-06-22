import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import type { Product } from "@/data/products";
import { useCurrency } from "@/contexts/CurrencyContext";
import { buildCombinationInsight } from "@/lib/productCombinations";
import ProductHoverMedia from "@/components/ProductHoverMedia";

type ProductCombinationCarouselProps = {
  product: Product;
  combinations: Product[];
  relatedProducts?: Product[];
};

const ProductCombinationCarousel = ({ product, combinations, relatedProducts }: ProductCombinationCarouselProps) => {
  const { convert, format, formatConverted } = useCurrency();
  const trackRef = useRef<HTMLDivElement>(null);
  const mediaProducts = relatedProducts?.length ? relatedProducts : [product, ...combinations];
  const insights = useMemo(
    () => combinations.map((item) => buildCombinationInsight(product, item)),
    [combinations, product],
  );

  if (!insights.length) return null;

  const scrollBy = (direction: "prev" | "next") => {
    const track = trackRef.current;
    if (!track) return;
    const amount = Math.max(300, track.clientWidth * 0.72);
    track.scrollBy({ left: direction === "next" ? amount : -amount, behavior: "smooth" });
  };

  return (
    <section className="border-t border-grid/40 bg-background py-16">
      <div className="container mx-auto px-10">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-label">Recommended combinations</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground md:text-5xl">
              Complete the workspace around this piece.
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollBy("prev")}
              className="inline-flex h-11 w-11 items-center justify-center border border-grid/40 text-foreground transition-colors hover:bg-foreground hover:text-background"
              aria-label="Previous combination"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy("next")}
              className="inline-flex h-11 w-11 items-center justify-center border border-grid/40 text-foreground transition-colors hover:bg-foreground hover:text-background"
              aria-label="Next combination"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="flex h-[500px] flex-col overflow-hidden border border-grid/30 surface-elevated p-4 sm:h-[520px] sm:p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-label">Selected piece</p>
            <ProductHoverMedia
              product={product}
              relatedProducts={mediaProducts}
              className="mt-4 h-52 shrink-0 sm:h-56"
            />
            <h3 className="mt-4 line-clamp-2 font-serif text-2xl leading-tight text-foreground">{product.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{product.category}</p>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-label">Current item</p>
            <p className="mt-1 font-serif text-3xl text-heritage">{format(product.price, product.currency)}</p>
          </div>

          <div ref={trackRef} className="flex snap-x gap-5 overflow-x-auto pb-4">
            {insights.map((insight) => (
              <article
                key={insight.product.id}
                className="flex h-[500px] w-[250px] shrink-0 snap-start flex-col overflow-hidden border border-grid/30 bg-card sm:h-[520px] sm:w-[300px] xl:w-[320px]"
              >
                <Link to={`/product/${insight.product.id}`} className="block shrink-0">
                  <ProductHoverMedia
                    product={insight.product}
                    relatedProducts={mediaProducts}
                    className="h-52 shrink-0 sm:h-56"
                  />
                </Link>
                <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-label">{insight.product.category}</p>
                      <h3 className="mt-2 line-clamp-2 font-serif text-2xl leading-tight text-foreground">{insight.product.name}</h3>
                    </div>
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center border border-grid/30 text-heritage">
                      <Plus className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mt-4 border-y border-grid/25 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-label">Total combination</p>
                    <p className="mt-1 font-serif text-3xl text-heritage">
                      {formatConverted(
                        convert(product.price, product.currency) +
                        convert(insight.product.price, insight.product.currency),
                      )}
                    </p>
                  </div>

                  <div className="mt-3 flex max-h-[58px] flex-wrap gap-2 overflow-hidden">
                    <span className="border border-grid/25 bg-background px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {insight.priceFitLabel}
                    </span>
                    {insight.reasons.slice(0, 2).map((reason) => (
                      <span key={reason} className="border border-grid/25 bg-background px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {reason}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-4">
                    <Link
                      to={`/product/${insight.product.id}`}
                      className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-heritage px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-heritage/90"
                    >
                      View companion
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCombinationCarousel;
