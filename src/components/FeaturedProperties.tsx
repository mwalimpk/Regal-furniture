import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import execDeskImg from "@/assets/product-exec-desk.jpg";
import chairImg from "@/assets/product-exec-chair.jpg";
import workstationImg from "@/assets/product-workstation.jpg";
import conferenceImg from "@/assets/product-conference.jpg";
import sofaImg from "@/assets/product-sofa.jpg";
import standingDeskImg from "@/assets/product-standing-desk.jpg";
import ergoChairImg from "@/assets/product-ergonomic-chair.jpg";
import storageImg from "@/assets/product-storage.jpg";

const products = [
  { id: "1", name: "B002 Executive Desk", category: "Desks & Tables", price: 1299, currency: "USD", image: execDeskImg, description: "Premium executive desk with mahogany finish and brass accents." },
  { id: "2", name: "Lloyd Executive Chair", category: "Seating", price: 599, currency: "USD", image: chairImg, description: "Luxury leather executive chair with ergonomic lumbar support." },
  { id: "3", name: "HILO 200 Standing Desk", category: "Desks & Tables", price: 899, currency: "USD", image: standingDeskImg, description: "Height adjustable standing desk for modern ergonomic workspaces." },
  { id: "4", name: "Dominion 4-Seater Workstation", category: "Workstations", price: 2499, currency: "USD", image: workstationImg, description: "Shared workstation for 4 with integrated cable management." },
  { id: "5", name: "Boat Shaped Boardroom Table", category: "Conference", price: 3499, currency: "USD", image: conferenceImg, description: "Premium boardroom table seating 12 with glass center insert." },
  { id: "6", name: "Chesterfield 3-Seater", category: "Sofas & Lounge", price: 1899, currency: "USD", image: sofaImg, description: "Classic Chesterfield leather couch for executive lounges." },
  { id: "7", name: "Active Ergonomic Chair", category: "Seating", price: 449, currency: "USD", image: ergoChairImg, description: "Full mesh ergonomic swivel chair with adjustable headrest." },
  { id: "8", name: "Metal Filing Cabinet 4-Drawer", category: "Storage", price: 349, currency: "USD", image: storageImg, description: "Heavy duty 4-drawer filing cabinet with card slots." },
];

const FeaturedProducts = () => {
  const { addItem } = useCart();
  const { toast } = useToast();

  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);

  const handleAdd = (product: typeof products[0]) => {
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
          {products.map((product) => (
            <div key={product.id} className="group bg-background">
              <div className="relative overflow-hidden aspect-square">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                <span className="absolute top-3 left-3 bg-background text-foreground text-[10px] md:text-xs font-medium tracking-wider uppercase px-2 py-1">
                  {product.category}
                </span>
              </div>
              <div className="p-4 md:p-5 space-y-1.5">
                <h3 className="font-serif text-sm md:text-base font-semibold text-foreground leading-snug">{product.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 hidden md:block">{product.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm md:text-lg font-semibold text-foreground">{formatPrice(product.price, product.currency)}</span>
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
          <Button variant="outline" size="lg" className="px-10 tracking-wider uppercase text-xs">View All Products</Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
