import { Link } from "react-router-dom";
import { categories } from "@/data/products";

const CategoryCards = () => {
  const displayCategories = categories.slice(0, 6);

  return (
    <section id="categories" className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-14">
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-foreground mb-2">
            Clear space, clear mind.
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            From desks to storage, every detail works together to support a more organized workspace.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
          {displayCategories.map((cat) => (
            <Link key={cat.slug} to={`/category/${cat.slug}`} className="group relative aspect-square overflow-hidden block">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
              <div className="absolute inset-0 bg-foreground/20 group-hover:bg-foreground/35 transition-colors duration-300" />
              <div className="absolute bottom-6 left-6">
                <span className="text-primary-foreground font-serif text-lg md:text-xl font-semibold">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/categories" className="text-sm font-medium tracking-widest uppercase text-foreground hover:text-primary border-b border-foreground pb-0.5 transition-colors">
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryCards;
