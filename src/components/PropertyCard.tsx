import { Badge } from "@/components/ui/badge";

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
  return (
    <div className="group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border">
      <div className="relative overflow-hidden aspect-square">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">{type}</Badge>
      </div>
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
