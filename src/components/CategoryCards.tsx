import { Armchair, Monitor, BookOpen, Sofa, Table, Archive } from "lucide-react";
import execDeskImg from "@/assets/product-exec-desk.jpg";
import chairImg from "@/assets/product-exec-chair.jpg";
import workstationImg from "@/assets/product-workstation.jpg";
import conferenceImg from "@/assets/product-conference.jpg";
import sofaImg from "@/assets/product-sofa.jpg";
import storageImg from "@/assets/product-storage.jpg";

const categories = [
  { image: execDeskImg, label: "Executive Desks", count: "45+ products" },
  { image: chairImg, label: "Office Chairs", count: "80+ products" },
  { image: workstationImg, label: "Workstations", count: "30+ products" },
  { image: conferenceImg, label: "Conference Tables", count: "25+ products" },
  { image: sofaImg, label: "Sofas & Lounge", count: "35+ products" },
  { image: storageImg, label: "Storage & Filing", count: "40+ products" },
];

const CategoryCards = () => {
  return (
    <section id="categories" className="py-12 md:py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-4xl font-serif font-bold text-foreground mb-2">
          Shop by Category
        </h2>
        <p className="text-muted-foreground text-sm md:text-base mb-8 md:mb-12 max-w-xl mx-auto">
          From executive desks to ergonomic seating — find furniture that defines your workspace.
        </p>
        {/* Mobile: horizontal scroll; Desktop: grid */}
        <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 -mx-4 px-4 md:mx-0 max-w-5xl md:mx-auto">
          {categories.map((cat) => (
            <a key={cat.label} href="#" className="snap-start shrink-0 w-[70vw] md:w-auto group relative rounded-xl overflow-hidden aspect-[4/3] block">
              <img src={cat.image} alt={cat.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
              <div className="absolute bottom-4 left-4 text-left">
                <span className="text-primary-foreground font-serif text-lg font-semibold block">{cat.label}</span>
                <span className="text-primary-foreground/80 text-xs">{cat.count}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCards;
