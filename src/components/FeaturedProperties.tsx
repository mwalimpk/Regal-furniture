import PropertyCard from "./PropertyCard";
import { Button } from "@/components/ui/button";

const properties = [
  {
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
    type: "House",
    price: "KES 400,000",
    title: "Modern Villa in Kilimani, Nairobi",
    location: "Kilimani, Kenya",
    description: "Exceptional property in one of Nairobi's most coveted residential enclaves with modern finishes.",
    beds: 3, baths: 1, sqft: 1800,
  },
  {
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    type: "Apartment / Flat",
    price: "KES 27,000,000",
    title: "Grand Premier Duplex",
    location: "Nairobi, Kenya",
    description: "3 bedroom Duplex for Sale at Grand-Premier Apartment with premium finishes throughout.",
    beds: 3, baths: 2, sqft: 180,
  },
  {
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
    type: "House",
    price: "USD 3,200,000",
    title: "Miami Beach House",
    location: "Miami, United States",
    description: "Gorgeous 4-bedroom waterfront home in Miami Beach. Private dock, heated pool, and open-plan living.",
    beds: 4, baths: 3, sqft: 4200,
  },
  {
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    type: "Villa",
    price: "USD 950,000",
    title: "Accra East Legon Villa",
    location: "Accra, Ghana",
    description: "Spacious 6-bedroom executive villa in East Legon with swimming pool and landscaped compound.",
    beds: 6, baths: 5, sqft: 7500,
  },
  {
    image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800",
    type: "Townhouse",
    price: "GBP 4,800,000",
    title: "London Chelsea Townhouse",
    location: "London, United Kingdom",
    description: "Prestigious 4-bedroom Georgian townhouse in Chelsea with period features and private garden.",
    beds: 4, baths: 3, sqft: 3200,
  },
  {
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
    type: "Apartment / Flat",
    price: "USD 4,500,000",
    title: "Cape Town Sea Point Flat",
    location: "Cape Town, South Africa",
    description: "Stylish 2-bedroom flat with Atlantic Ocean views in Sea Point. Close to the promenade.",
    beds: 2, baths: 1, sqft: 950,
  },
];

const FeaturedProperties = () => {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Featured Properties</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Explore our hand-picked selection of premium properties from around the world.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property, i) => (
            <PropertyCard key={i} {...property} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Button variant="outline" size="lg">View More Properties →</Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
