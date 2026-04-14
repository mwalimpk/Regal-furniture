import PropertyCard from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const FeaturedProperties = () => {
  const { data: properties, isLoading } = useQuery({
    queryKey: ["featured-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  // Fallback demo data when no DB properties exist
  const demoProperties = [
    { id: "1", title: "Modern Villa in Kilimani, Nairobi", property_type: "House", price: 400000, currency: "KES", location: "Kilimani", city: "Nairobi", country: "Kenya", description: "Exceptional property in one of Nairobi's most coveted residential enclaves.", bedrooms: 3, bathrooms: 1, area_sqft: 1800, images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"] },
    { id: "2", title: "Grand Premier Duplex", property_type: "Apartment", price: 27000000, currency: "KES", location: "Westlands", city: "Nairobi", country: "Kenya", description: "3 bedroom Duplex for Sale at Grand-Premier with premium finishes.", bedrooms: 3, bathrooms: 2, area_sqft: 180, images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"] },
    { id: "3", title: "Miami Beach House", property_type: "House", price: 3200000, currency: "USD", location: "Miami Beach", city: "Miami", country: "United States", description: "Gorgeous 4-bedroom waterfront home with private dock and pool.", bedrooms: 4, bathrooms: 3, area_sqft: 4200, images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"] },
    { id: "4", title: "Accra East Legon Villa", property_type: "Villa", price: 950000, currency: "USD", location: "East Legon", city: "Accra", country: "Ghana", description: "Spacious 6-bedroom executive villa with swimming pool.", bedrooms: 6, bathrooms: 5, area_sqft: 7500, images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"] },
    { id: "5", title: "London Chelsea Townhouse", property_type: "Townhouse", price: 4800000, currency: "GBP", location: "Chelsea", city: "London", country: "United Kingdom", description: "Prestigious Georgian townhouse with period features and private garden.", bedrooms: 4, bathrooms: 3, area_sqft: 3200, images: ["https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800"] },
    { id: "6", title: "Cape Town Sea Point Flat", property_type: "Apartment", price: 4500000, currency: "USD", location: "Sea Point", city: "Cape Town", country: "South Africa", description: "Stylish 2-bedroom flat with Atlantic Ocean views.", bedrooms: 2, bathrooms: 1, area_sqft: 950, images: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800"] },
  ];

  const displayProperties = properties && properties.length > 0 ? properties : demoProperties;

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
  };

  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-3">Featured Properties</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Explore our hand-picked selection of premium properties from around the world.
          </p>
        </div>
        {isLoading ? (
          <div className="text-center text-muted-foreground">Loading properties...</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProperties.map((property: any) => (
              <PropertyCard
                key={property.id}
                image={property.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"}
                type={property.property_type}
                price={formatPrice(property.price, property.currency)}
                title={property.title}
                location={`${property.location || property.city}, ${property.country}`}
                description={property.description || ""}
                beds={property.bedrooms}
                baths={property.bathrooms}
                sqft={property.area_sqft}
              />
            ))}
          </div>
        )}
        <div className="text-center mt-10">
          <Button variant="outline" size="lg">View More Properties →</Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
