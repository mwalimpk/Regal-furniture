import execDeskImg from "@/assets/product-exec-desk.jpg";
import chairImg from "@/assets/product-exec-chair.jpg";
import workstationImg from "@/assets/product-workstation.jpg";
import conferenceImg from "@/assets/product-conference.jpg";
import sofaImg from "@/assets/product-sofa.jpg";
import storageImg from "@/assets/product-storage.jpg";

const categories = [
  { image: execDeskImg, label: "Desks & Tables" },
  { image: chairImg, label: "Seating" },
  { image: workstationImg, label: "Workstations" },
  { image: conferenceImg, label: "Conference" },
  { image: sofaImg, label: "Sofas & Lounge" },
  { image: storageImg, label: "Storage" },
];

const CategoryCards = () => {
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
          {categories.map((cat) => (
            <a key={cat.label} href="#shop" className="group relative aspect-square overflow-hidden block">
              <img src={cat.image} alt={cat.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
              <div className="absolute inset-0 bg-foreground/20 group-hover:bg-foreground/35 transition-colors duration-300" />
              <div className="absolute bottom-6 left-6">
                <span className="text-primary-foreground font-serif text-lg md:text-xl font-semibold">{cat.label}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCards;
