import { ArrowRight, BadgePercent, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";
import { getProductPromotionDisplayLabel, getProductPromotionPrice } from "@/lib/productPromotions";
import { useProductPromotionForProduct } from "@/hooks/useProductPromotions";
import ProductHoverMedia from "@/components/ProductHoverMedia";

type StorefrontProductTileProps = {
  product: Product;
  className?: string;
  showDescription?: boolean;
  showRating?: boolean;
  imageFit?: "contain" | "cover";
  imageClassName?: string;
  imagePanelClassName?: string;
  relatedProducts?: Product[];
  contentClassName?: string;
  titleClassName?: string;
  compact?: boolean;
};

const StorefrontProductTile = ({
  product,
  className,
  showDescription = true,
  showRating = false,
  imageFit = "cover",
  imageClassName,
  imagePanelClassName,
  relatedProducts,
  contentClassName,
  titleClassName,
  compact = false,
}: StorefrontProductTileProps) => {
  const { format } = useCurrency();
  const { promotion } = useProductPromotionForProduct(product);
  const promotionLabel = promotion ? getProductPromotionDisplayLabel(promotion) : "";
  const promotionalPrice = promotion ? getProductPromotionPrice(product.price, promotion) : null;
  const displayPrice = promotionalPrice ?? product.price;

  return (
    <Link
      to={`/product/${product.id}`}
      className={cn("group block text-foreground", className)}
    >
      <ProductHoverMedia
        product={product}
        relatedProducts={relatedProducts}
        imageFit={imageFit}
        imageClassName={imageClassName}
        className={cn(compact ? "aspect-[4/4.2]" : "aspect-[4/4.7]", imagePanelClassName)}
      />

      <div className={cn("mt-5", contentClassName)}>
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-label">
              {product.category}
            </p>
            <h3 className={cn("mt-2 font-serif text-xl leading-tight text-foreground md:text-[1.55rem]", titleClassName)}>
              {product.name}
            </h3>
            {promotion && (
              <span className="mt-3 inline-flex items-center gap-1.5 border border-interactive/30 bg-interactive/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-heritage">
                <BadgePercent className="h-3.5 w-3.5" />
                {promotionLabel}
              </span>
            )}
          </div>
          <span className="mt-1 text-heritage opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <ArrowRight size={18} />
          </span>
        </div>

        {showDescription && (
          <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">
            {product.description}
          </p>
        )}

        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-label">
              {promotionalPrice !== null ? "Promo price" : "Starting at"}
            </p>
            <p className="mt-1 font-serif text-2xl text-heritage md:text-[2rem]">
              {format(displayPrice, product.currency)}
            </p>
            {promotionalPrice !== null && (
              <p className="mt-1 text-sm font-medium text-muted-foreground/70 line-through">
                {format(product.price, product.currency)}
              </p>
            )}
          </div>

          {showRating && (
            <div className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.16em] text-label">
              <Star className="h-3.5 w-3.5 fill-interactive text-interactive" />
              <span>4.9</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default StorefrontProductTile;
