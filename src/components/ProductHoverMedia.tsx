import { useEffect, useMemo, useRef, useState } from "react";
import { Product, products as catalogueProducts } from "@/data/products";
import { cn } from "@/lib/utils";

const CAROUSEL_INTERVAL_MS = 3200;
const CAROUSEL_TRANSITION_MS = 950;
const CAROUSEL_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

type ProductHoverMediaProps = {
  product: Product;
  relatedProducts?: Product[];
  className?: string;
  imageClassName?: string;
  imageFit?: "cover" | "contain";
  label?: string;
  onClick?: () => void;
};

const uniqueImages = (images: Array<string | null | undefined>) => {
  const seen = new Set<string>();

  return images.filter((image): image is string => {
    if (!image || seen.has(image)) return false;
    seen.add(image);
    return true;
  });
};

const getProductGallery = (product: Product, relatedProducts?: Product[]) => {
  const sourceProducts = relatedProducts?.length ? relatedProducts : catalogueProducts;
  const categoryProducts = sourceProducts.filter(
    (item) => item.categorySlug === product.categorySlug,
  );
  const currentIndex = categoryProducts.findIndex(
    (item) => item.id === product.id || item.image === product.image,
  );
  const orderedPeers =
    currentIndex >= 0
      ? [...categoryProducts.slice(currentIndex + 1), ...categoryProducts.slice(0, currentIndex)]
      : categoryProducts.filter((item) => item.id !== product.id);

  return uniqueImages([
    product.image,
    ...(product.images || []),
    ...orderedPeers.flatMap((item) => [item.image, ...(item.images || [])]),
  ]).slice(0, 5);
};

const ProductHoverMedia = ({
  product,
  relatedProducts,
  className,
  imageClassName,
  imageFit = "cover",
  label,
  onClick,
}: ProductHoverMediaProps) => {
  const gallery = useMemo(
    () => getProductGallery(product, relatedProducts),
    [product, relatedProducts],
  );
  const [isHovered, setIsHovered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<"up" | "down">("up");
  const activeIndexRef = useRef(0);

  const canCycleImages = gallery.length > 1;

  const transitionTo = (nextIndex: number, nextDirection: "up" | "down") => {
    if (nextIndex === activeIndexRef.current) return;

    setPreviousIndex(activeIndexRef.current);
    setDirection(nextDirection);
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
  };

  const startHover = () => {
    setIsHovered(true);

    if (canCycleImages && activeIndexRef.current === 0) {
      transitionTo(1, "up");
    }
  };

  const endHover = () => {
    setIsHovered(false);

    if (activeIndexRef.current !== 0) {
      transitionTo(0, "down");
    }
  };

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    setIsHovered(false);
    setActiveIndex(0);
    setPreviousIndex(null);
    setDirection("up");
    activeIndexRef.current = 0;
  }, [gallery.join("|")]);

  useEffect(() => {
    if (!isHovered || !canCycleImages) return;

    const interval = window.setInterval(() => {
      const nextIndex = (activeIndexRef.current + 1) % gallery.length;
      transitionTo(nextIndex, "up");
    }, CAROUSEL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [canCycleImages, gallery.length, isHovered]);

  const content = (
    <>
      {label && (
        <span
          className={cn(
            "media-chip absolute left-4 z-30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] transition-[top] duration-500",
            isHovered && canCycleImages ? "top-10" : "top-4",
          )}
        >
          {label}
        </span>
      )}

      {canCycleImages && (
        <>
          <div
            className={cn(
              "product-story-tint absolute inset-x-0 top-0 z-20 h-20 transition-opacity duration-500",
              isHovered ? "opacity-100" : "opacity-0",
            )}
            aria-hidden="true"
          />
          <div
            className={cn(
              "absolute inset-x-3 top-3 z-40 flex gap-1.5 transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0",
            )}
            aria-hidden="true"
          >
            {gallery.map((image, index) => (
              <span key={`${image}-${index}`} className="h-[3px] flex-1 overflow-hidden bg-white/34 shadow-[0_1px_6px_rgb(0_0_0/0.22)]">
                <span
                  key={`${activeIndex}-${image}-${index}`}
                  className={cn(
                    "block h-full origin-left",
                    index < activeIndex ? "bg-white/85" : "bg-white/48",
                    index === activeIndex && isHovered ? "animate-product-story-progress bg-interactive" : "",
                  )}
                  style={
                    index === activeIndex && isHovered
                      ? { animationDuration: `${CAROUSEL_INTERVAL_MS}ms` }
                      : undefined
                  }
                />
              </span>
            ))}
          </div>
        </>
      )}

      <div className="absolute inset-0">
        {gallery.map((image, index) => {
          const stateClass =
            index === activeIndex
              ? "translate-y-0 opacity-100"
              : previousIndex !== null && index === previousIndex
                ? direction === "up"
                  ? "-translate-y-full opacity-100"
                  : "translate-y-full opacity-100"
                : "translate-y-full opacity-0";

          return (
            <img
              key={`${product.id}-${image}-${index}`}
              src={image}
              alt={product.name}
              className={cn(
                "absolute inset-0 h-full w-full transition-all",
                imageFit === "cover" ? "object-cover object-center" : "object-contain p-6 md:p-8",
                stateClass,
                imageClassName,
              )}
              style={{
                transitionDuration: `${CAROUSEL_TRANSITION_MS}ms`,
                transitionTimingFunction: CAROUSEL_EASING,
              }}
              loading="lazy"
            />
          );
        })}
      </div>
    </>
  );

  const sharedProps = {
    onMouseEnter: startHover,
    onMouseLeave: endHover,
    onFocus: startHover,
    onBlur: endHover,
    className: cn("product-media-panel relative block overflow-hidden text-left", className),
  };

  if (onClick) {
    return (
      <button type="button" onClick={onClick} {...sharedProps}>
        {content}
      </button>
    );
  }

  return <div {...sharedProps}>{content}</div>;
};

export default ProductHoverMedia;
