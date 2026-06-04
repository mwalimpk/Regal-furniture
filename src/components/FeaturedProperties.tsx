import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/data/products";
import { fetchApprovedStorefrontProducts } from "@/lib/storefrontProducts";
import OrderFormDialog from "@/components/OrderFormDialog";
import ProductHoverMedia from "@/components/ProductHoverMedia";

const FeaturedProducts = () => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const { format } = useCurrency();
  const [orderProduct, setOrderProduct] = useState<Product | null>(null);

  const { data: featured = [], isLoading } = useQuery({
    queryKey: ["storefront-products"],
    queryFn: fetchApprovedStorefrontProducts,
    select: (products) => products.slice(0, 8),
  });

  const handleAdd = (product: Product) => {
    addItem({ id: product.id, name: product.name, price: product.price, currency: product.currency, image: product.image });
    toast({ title: "Added to cart", description: `${product.name} added to your cart.` });
  };

  return (
    <>
      <section id="shop" className="py-12 md:py-20">
        <div className="container mx-auto px-10">
          <div className="text-center mb-8 md:mb-14">
            <h2 className="text-2xl md:text-4xl font-bold font-serif text-foreground mb-2">Featured Products</h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
              Hand-picked from our latest catalogue — crafted for comfort and durability.
            </p>
          </div>
          {isLoading ? (
            <div className="bg-card/60 px-6 py-12 text-center text-sm text-muted-foreground">Loading products...</div>
          ) : featured.length === 0 ? (
            <div className="bg-card/60 px-6 py-12 text-center text-sm text-muted-foreground">
              Add approved products in the admin catalog to populate this section.
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border">
              {featured.map((product) => (
                <div key={product.id} className="group bg-background">
                  <div className="relative aspect-square overflow-hidden">
                    <ProductHoverMedia product={product} relatedProducts={featured} className="h-full w-full" />
                    <Link
                      to={`/category/${product.categorySlug}`}
                      className="absolute top-3 left-3 bg-background text-foreground text-[10px] md:text-xs font-medium tracking-wider uppercase px-2 py-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {product.category}
                    </Link>
                  </div>
                  <div className="p-4 md:p-5 space-y-1.5">
                    <h3 className="font-serif text-sm md:text-base font-semibold text-foreground leading-snug">{product.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 hidden md:block">{product.description}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm md:text-lg font-semibold text-foreground">{format(product.price)}</span>
                    </div>
                    <div className="flex gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => handleAdd(product)}
                        className="bg-crimson px-2 py-1 text-[10px] font-medium text-primary-foreground transition-colors hover:bg-crimson/90 md:text-xs"
                      >
                        Add to Cart
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderProduct(product)}
                        className="text-[10px] md:text-xs font-medium border border-primary text-primary px-2 py-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        Place Order
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link to="/categories">
              <Button variant="outline" size="lg" className="px-10 tracking-wider uppercase text-xs">View All Products</Button>
            </Link>
          </div>
        </div>
      </section>

      <OrderFormDialog
        open={!!orderProduct}
        onOpenChange={(open) => { if (!open) setOrderProduct(null); }}
        productName={orderProduct?.name}
        productPrice={orderProduct?.price}
      />
    </>
  );
};

export default FeaturedProducts;
