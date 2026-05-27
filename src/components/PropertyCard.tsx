import ProductHoverMedia from "@/components/ProductHoverMedia";

interface PropertyCardProps {
  image: string;
  type: string;
  price: string;
  title: string;
  location: string;
  description: string;
  beds: number;
  baths: number;
  sqft: number;
}

const PropertyCard = ({ image, type, price, title, location, description }: PropertyCardProps) => {
  const product = {
    id: title,
    name: title,
    category: type,
    categorySlug: type.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
    price: Number(price.replace(/[^0-9.]/g, "")) || 0,
    currency: "USD",
    image,
    description,
  };

  return (
    <div className="group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border">
      <ProductHoverMedia product={product} label={type} className="aspect-square" />
      <div className="p-4 space-y-1">
        <h3 className="font-serif text-base font-semibold text-card-foreground leading-snug line-clamp-2">{title}</h3>
        <p className="text-xs text-muted-foreground">{location}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-primary">{price}</span>
          <span className="text-xs font-medium text-foreground border border-foreground px-2 py-1 hover:bg-foreground hover:text-background transition-colors cursor-pointer">Add</span>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
