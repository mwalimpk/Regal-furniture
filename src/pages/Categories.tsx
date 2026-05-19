import { ArrowDownToLine } from "lucide-react";
import { Link } from "react-router-dom";
import { categories } from "@/data/products";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

const Categories = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="pt-[210px] md:pt-[225px]">
        <div className="container mx-auto px-4 py-8 md:py-14">
          <div className="mb-10 flex flex-col items-center gap-5 text-center">
            <h1 className="text-3xl font-serif font-bold text-foreground md:text-5xl">Shop by Category</h1>
            <p className="max-w-lg text-center text-sm text-muted-foreground md:text-base">
              Browse our full range of office and home furniture from executive desks to lounge sofas.
            </p>
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-2 rounded-full border border-[#d7c8b5] bg-white px-5 py-3 text-sm font-semibold text-[#231f1c] transition-colors hover:bg-[#fbf7f2]"
            >
              <ArrowDownToLine size={16} />
              Download Catalogue
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat) => (
              <Link key={cat.slug} to={`/category/${cat.slug}`} className="group relative block aspect-square overflow-hidden bg-background">
                <img src={cat.image} alt={cat.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-foreground/25 transition-colors duration-300 group-hover:bg-foreground/40" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="font-serif text-sm font-semibold text-primary-foreground md:text-lg">{cat.name}</span>
                  <p className="mt-0.5 line-clamp-2 text-[10px] text-primary-foreground/70 md:text-xs">{cat.description}</p>
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
