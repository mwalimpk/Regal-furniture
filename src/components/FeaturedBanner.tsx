import { Button } from "@/components/ui/button";
import bannerImage from "@/assets/banner-wide.jpg";

const FeaturedBanner = () => {
  return (
    <section className="relative w-full h-[500px] overflow-hidden">
      <img
        src={bannerImage}
        alt="Aerial view of luxury residential neighborhood"
        className="w-full h-full object-cover"
        loading="lazy"
        width={1920}
        height={800}
      />
      <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-xl px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground">
            Introducing Global Listings.
          </h2>
          <p className="text-primary-foreground/90 text-base">
            We're proud to bring you curated properties from across the globe — because exceptional living knows no borders.
          </p>
          <Button size="lg" variant="outline" className="rounded-none border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-foreground">
            Shop Now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBanner;
