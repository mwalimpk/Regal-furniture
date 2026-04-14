import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-furniture.jpg";

const HeroSection = () => {
  return (
    <section className="pt-[168px] md:pt-[200px] min-h-[85vh] flex items-stretch">
      <div className="flex flex-col md:flex-row w-full">
        {/* Left text panel */}
        <div className="md:w-[40%] bg-secondary flex items-center justify-center p-8 md:p-16">
          <div className="max-w-sm text-center space-y-5">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-foreground font-serif italic">
              The Spring Edit
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Refresh your space with ergonomic comfort and sustainable design that earns its place.
            </p>
            <Button size="lg" className="px-12 rounded-none bg-foreground text-background hover:bg-foreground/90">
              Shop Now
            </Button>
          </div>
        </div>
        {/* Right image panel */}
        <div className="md:w-[60%] relative">
          <img
            src={heroImage}
            alt="Woman at ergonomic desk in modern home office"
            className="w-full h-full object-cover min-h-[400px] md:min-h-0"
            width={1280}
            height={960}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
