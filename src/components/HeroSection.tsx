import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-office.jpg";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="pt-[120px] md:pt-[140px] min-h-[50vh] md:min-h-[80vh] flex items-stretch">
      <div className="flex flex-col md:flex-row w-full">
        {/* Left: text */}
        <div className="md:w-[40%] bg-secondary flex items-center justify-center p-8 md:p-16">
          <div className="max-w-sm text-center md:text-left space-y-5">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight text-foreground font-serif">
              A Legacy of Comfort
            </h1>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              Refresh your workspace with ergonomic comfort and premium craftsmanship that stands the test of time.
            </p>
            <a href="#shop">
              <Button size="lg" className="w-full md:w-auto px-10">Shop Now</Button>
            </a>
          </div>
        </div>
        {/* Right: image */}
        <div className="md:w-[60%] relative">
          <img
            src={heroImage}
            alt="Regal Office & Home executive desk setup"
            className="w-full h-full object-cover min-h-[250px] md:min-h-0"
            width={1280}
            height={960}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
