import featuredApartment from "@/assets/featured-apartment.jpg";
import featuredVilla from "@/assets/featured-villa.jpg";
import featuredPenthouse from "@/assets/featured-penthouse.jpg";
import featuredTownhouse from "@/assets/featured-townhouse.jpg";
import featuredBeachfront from "@/assets/featured-beachfront.jpg";

const properties = [
  {
    image: featuredApartment,
    title: "City Apartment",
    description: "For panoramic views and urban sophistication.",
  },
  {
    image: featuredVilla,
    title: "Modern Villa",
    description: "For resort-style living with private outdoor spaces.",
  },
  {
    image: featuredPenthouse,
    title: "Ocean Penthouse",
    description: "For the complete package of luxury and serenity.",
  },
  {
    image: featuredTownhouse,
    title: "Classic Townhouse",
    description: "For a refined aesthetic and period charm in any city.",
  },
  {
    image: featuredBeachfront,
    title: "Beachfront Estate",
    description: "For effortless coastal living at a premium address.",
  },
];

const FeaturedProperties = () => {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground text-center mb-12">
          Find the property that's meant for you.
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {properties.map((property) => (
            <a
              key={property.title}
              href="#"
              className="group block text-center"
            >
              <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  width={800}
                  height={1000}
                />
              </div>
              <h3 className="font-semibold text-card-foreground text-base">{property.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{property.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
