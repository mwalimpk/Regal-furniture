import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { categories, products, Product } from "@/data/products";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const { toast } = useToast();

  const category = categories.find((c) => c.slug === slug);
  const categoryProducts = products.filter((p) => p.categorySlug === slug);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);

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
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary-foreground">{category.name}</h1>
            <p className="text-primary-foreground/80 text-sm md:text-base mt-2 max-w-md mx-auto px-4">{category.description}</p>
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div className="container mx-auto px-4 py-8 md:py-14">
        <p className="text-sm text-muted-foreground mb-6">{categoryProducts.length} products</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {categoryProducts.map((product) => (
            <div key={product.id} className="group bg-background">
              <div className="relative overflow-hidden aspect-square">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
              </div>
              <div className="p-4 md:p-5 space-y-1.5">
                <h3 className="font-serif text-sm md:text-base font-semibold text-foreground leading-snug">{product.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 hidden md:block">{product.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm md:text-lg font-semibold text-foreground">{formatPrice(product.price)}</span>
                  <button
                    onClick={() => handleAdd(product)}
                    className="text-xs font-medium border border-foreground text-foreground px-2 py-1 hover:bg-foreground hover:text-background transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default CategoryPage;
