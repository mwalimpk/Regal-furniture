import chairFern from "@/assets/chair-fern.jpg";
import chairZody from "@/assets/chair-zody.jpg";
import chairSoji from "@/assets/chair-soji.jpg";
import chairVery from "@/assets/chair-very.jpg";
import chairBreck from "@/assets/chair-breck.jpg";

const chairs = [
  {
    image: chairFern,
    title: "Fern",
    description: "For best-in-class comfort that goes above and beyond.",
  },
  {
    image: chairZody,
    title: "Zody",
    description: "For innovative, adaptive support that moves with you.",
  },
  {
    image: chairSoji,
    title: "Soji",
    description: "For the complete package of accessible ergonomics.",
  },
  {
    image: chairVery,
    title: "Very",
    description: "For a refined aesthetic and modern design in any space.",
  },
  {
    image: chairBreck,
    title: "Breck",
    description: "For effortless ergonomic comfort at a smart price.",
  },
];

const FeaturedProperties = () => {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground text-center mb-12">
          Find the chair that's meant for you.
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {chairs.map((chair) => (
            <a
              key={chair.title}
              href="#"
              className="group block text-center"
            >
              <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-muted">
                <img
                  src={chair.image}
                  alt={chair.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  width={640}
                  height={800}
                />
              </div>
              <h3 className="font-bold text-card-foreground text-base">{chair.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{chair.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
