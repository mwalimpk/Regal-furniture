import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { products, Product } from "@/data/products";

const FeaturedProducts = () => {
  const { addItem } = useCart();
  const { toast } = useToast();

  const featured = products.filter((_, i) => [0, 18, 8, 10, 28, 35, 22, 31].includes(i));

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);

  const handleAdd = (product: Product) => {
    addItem({ id: product.id, name: product.name, price: product.price, currency: product.currency, image: product.image });
    toast({ title: "Added to cart", description: `${product.name} added to your cart.` });
  };

  return (
    <section id="shop" className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-14">
          <h2 className="text-2xl md:text-4xl font-bold font-serif text-foreground mb-2">Featured Products</h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            Hand-picked from our latest catalogue — crafted for comfort and durability.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {featured.map((product) => (
            <div key={product.id} className="group bg-background">
              <div className="relative overflow-hidden aspect-square">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
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
                  <span className="text-sm md:text-lg font-semibold text-foreground">{formatPrice(product.price)}</span>
                  <button
                    onClick={() => handleAdd(product)}
                    className="w-8 h-8 border border-foreground text-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                  >
                    <ShoppingCart size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/categories">
            <Button variant="outline" size="lg" className="px-10 tracking-wider uppercase text-xs">View All Products</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
