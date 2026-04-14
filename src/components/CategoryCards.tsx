import chairImg from "@/assets/chair-ergonomic.jpg";
import deskImg from "@/assets/desk-standing.jpg";
import gamingImg from "@/assets/gaming-setup.jpg";
import lightingImg from "@/assets/lighting-accessories.jpg";

const categories = [
  { image: chairImg, label: "Performance Seating" },
  { image: deskImg, label: "Desks" },
  { image: gamingImg, label: "Gaming" },
  { image: lightingImg, label: "Lighting & Accessories" },
];

const CategoryCards = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
          Clear space, clear mind.
        </h2>
        <p className="text-muted-foreground text-base mb-12 max-w-xl mx-auto">
          From desks to storage, every detail works together to support a more organized workspace.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {categories.map((cat) => (
            <a
              key={cat.label}
              href="#"
              className="group relative overflow-hidden rounded-lg aspect-[3/4]"
            >
              <img
                src={cat.image}
                alt={cat.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                width={800}
                height={1000}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
              <span className="absolute bottom-4 left-0 right-0 text-center text-sm font-bold text-primary-foreground tracking-wide">
                {cat.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCards;
