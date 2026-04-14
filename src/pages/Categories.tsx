import { Link } from "react-router-dom";
import { categories } from "@/data/products";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

const Categories = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="pt-[120px] md:pt-[140px]">
        <div className="container mx-auto px-4 py-8 md:py-14">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground text-center mb-3">Shop by Category</h1>
          <p className="text-muted-foreground text-center text-sm md:text-base mb-10 max-w-lg mx-auto">
            Browse our full range of office and home furniture — from executive desks to lounge sofas.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-border">
            {categories.map((cat) => (
              <Link key={cat.slug} to={`/category/${cat.slug}`} className="group relative aspect-square overflow-hidden block bg-background">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-foreground/25 group-hover:bg-foreground/40 transition-colors duration-300" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-primary-foreground font-serif text-sm md:text-lg font-semibold">{cat.name}</span>
                  <p className="text-primary-foreground/70 text-[10px] md:text-xs mt-0.5 line-clamp-2">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Categories;
