import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import execDeskImg from "@/assets/product-exec-desk.jpg";
import chairImg from "@/assets/product-exec-chair.jpg";
import workstationImg from "@/assets/product-workstation.jpg";
import conferenceImg from "@/assets/product-conference.jpg";
import sofaImg from "@/assets/product-sofa.jpg";
import standingDeskImg from "@/assets/product-standing-desk.jpg";
import ergoChairImg from "@/assets/product-ergonomic-chair.jpg";
import storageImg from "@/assets/product-storage.jpg";

const products = [
  { id: "1", name: "B002 Executive Desk", category: "Executive Desks", price: 1299, currency: "USD", image: execDeskImg, description: "Premium executive desk with mahogany finish and brass accents." },
  { id: "2", name: "Lloyd Executive Chair", category: "Office Chairs", price: 599, currency: "USD", image: chairImg, description: "Luxury leather executive chair with ergonomic lumbar support." },
  { id: "3", name: "HILO 200 Standing Desk", category: "Adjustable Desks", price: 899, currency: "USD", image: standingDeskImg, description: "Height adjustable standing desk for modern ergonomic workspaces." },
  { id: "4", name: "Dominion 4-Seater Workstation", category: "Workstations", price: 2499, currency: "USD", image: workstationImg, description: "Shared workstation for 4 with integrated cable management." },
  { id: "5", name: "Boat Shaped Boardroom Table", category: "Conference Tables", price: 3499, currency: "USD", image: conferenceImg, description: "Premium boardroom table seating 12 with glass center insert." },
  { id: "6", name: "Chesterfield 3-Seater", category: "Sofas", price: 1899, currency: "USD", image: sofaImg, description: "Classic Chesterfield leather couch for executive lounges." },
  { id: "7", name: "Active Ergonomic Chair", category: "Ergonomic Chairs", price: 449, currency: "USD", image: ergoChairImg, description: "Full mesh ergonomic swivel chair with adjustable headrest." },
  { id: "8", name: "Metal Filing Cabinet 4-Drawer", category: "Storage", price: 349, currency: "USD", image: storageImg, description: "Heavy duty 4-drawer filing cabinet with card slots." },
];

const FeaturedProducts = () => {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
  };

  return (
    <section id="shop" className="py-12 md:py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold font-serif text-foreground mb-2">Featured Products</h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-xl mx-auto">
            Hand-picked furniture from our latest catalogue — crafted for comfort and durability.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {products.map((product) => (
            <div key={product.id} className="group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border">
              <div className="relative overflow-hidden aspect-square">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] md:text-xs font-medium px-2 py-0.5 rounded-full">
                  {product.category}
                </span>
              </div>
              <div className="p-3 md:p-4 space-y-1">
                <h3 className="font-serif text-sm md:text-base font-semibold text-card-foreground leading-snug line-clamp-2">{product.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 hidden md:block">{product.description}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-base md:text-lg font-bold text-primary">{formatPrice(product.price, product.currency)}</span>
                  <button className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
                    <ShoppingCart size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">View All Products →</Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
