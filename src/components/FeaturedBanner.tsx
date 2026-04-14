import { Button } from "@/components/ui/button";
import sofaImg from "@/assets/product-sofa.jpg";

const FeaturedBanner = () => {
  return (
    <section className="relative w-full h-[300px] md:h-[500px] overflow-hidden">
      <img
        src={sofaImg}
        alt="Regal Chesterfield leather sofa collection"
        className="w-full h-full object-cover"
        loading="lazy"
        width={1920}
        height={800}
      />
      <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-lg px-4">
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary-foreground">
            New Arrivals — Home Collection
          </h2>
          <p className="text-primary-foreground/90 text-sm md:text-base">
            Chesterfield sofas, dining sets, and bedroom furniture — luxury for every room.
          </p>
          <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-foreground px-10 tracking-wider uppercase text-xs">
            Explore Collection
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBanner;
