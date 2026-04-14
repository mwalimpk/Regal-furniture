import { Building2, Home, Castle, Palmtree } from "lucide-react";

const categories = [
  { icon: Home, label: "Houses", href: "#" },
  { icon: Building2, label: "Apartments", href: "#" },
  { icon: Castle, label: "Villas", href: "#" },
  { icon: Palmtree, label: "Beachfront", href: "#" },
];

const CategoryCards = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
          Clear vision, clear opportunity.
        </h2>
        <p className="text-muted-foreground text-base mb-12 max-w-xl mx-auto">
          From homes to investments, every detail works together to support your property journey.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {categories.map((cat) => (
            <a
              key={cat.label}
              href={cat.href}
              className="group flex flex-col items-center gap-3 p-6 rounded-lg border border-border bg-card hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <cat.icon className="text-accent" size={24} />
              </div>
              <span className="text-sm font-semibold text-card-foreground">{cat.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCards;
