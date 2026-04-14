import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-lifestyle.jpg";

const HeroSection = () => {
  return (
    <section className="pt-16 min-h-[85vh] flex items-stretch">
      <div className="flex flex-col md:flex-row w-full">
        {/* Left text panel - solid background */}
        <div className="md:w-[40%] bg-secondary flex items-center justify-center p-8 md:p-16">
          <div className="max-w-md text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-foreground font-serif">
              The Power of Circles
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Refresh your network with intentional circles of trust, collaboration, and shared opportunity that earns its place.
            </p>
            <Button size="lg" className="px-10 rounded-none">
              Shop Now
            </Button>
          </div>
        </div>
        {/* Right image panel */}
        <div className="md:w-[60%] relative">
          <img
            src={heroImage}
            alt="Modern luxury living space"
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
