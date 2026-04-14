import { Button } from "@/components/ui/button";
import bannerImage from "@/assets/banner-office.jpg";

const FeaturedBanner = () => {
  return (
    <section className="relative w-full h-[500px] overflow-hidden">
      <img
        src={bannerImage}
        alt="Modern open-plan office workspace"
        className="w-full h-full object-cover"
        loading="lazy"
        width={1920}
        height={800}
      />
      <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-xl px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground">
            Introducing Heller.
          </h2>
          <p className="text-primary-foreground/90 text-base">
            We're proud to welcome Heller to the Haworth family — because modern design is serious fun.
          </p>
          <Button size="lg" className="rounded-none px-10 bg-primary-foreground text-foreground hover:bg-primary-foreground/90">
            Shop Now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBanner;
