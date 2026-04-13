import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Maximize } from "lucide-react";

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

const PropertyCard = ({ image, type, price, title, location, description, beds, baths, sqft }: PropertyCardProps) => {
  return (
    <div className="group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border">
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">{type}</Badge>
        <span className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-foreground text-sm font-semibold px-3 py-1 rounded-full">
          {price}
        </span>
      </div>
      <div className="p-5 space-y-2">
        <h3 className="font-serif text-lg font-semibold text-card-foreground leading-snug">{title}</h3>
        <p className="text-sm text-muted-foreground">{location}</p>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        <div className="flex items-center gap-4 pt-3 border-t border-border text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Bed size={14} /> {beds} Beds</span>
          <span className="flex items-center gap-1"><Bath size={14} /> {baths} Baths</span>
          <span className="flex items-center gap-1"><Maximize size={14} /> {sqft.toLocaleString()} sqft</span>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
