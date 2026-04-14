import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-office.jpg";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="pt-14 md:pt-[88px] min-h-[60vh] md:min-h-[85vh] flex items-stretch">
      <div className="flex flex-col md:flex-row w-full">
        <div className="md:w-[40%] bg-primary flex items-center justify-center p-6 md:p-16">
          <div className="max-w-md text-center space-y-4 md:space-y-6">
            <p className="text-xs md:text-sm font-semibold tracking-widest text-primary-foreground/80 uppercase">
              A Legacy of Comfort
            </p>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight text-primary-foreground font-serif">
              Premium Office &{" "}
              <span className="text-accent">Home Furniture</span>
            </h1>
            <p className="text-primary-foreground/80 text-sm md:text-base leading-relaxed">
              At Regal Office & Home, we believe that furniture is more than just a utility — it's a reflection of lifestyle, comfort, and personal expression.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <a href="#shop"><Button size="lg" variant="secondary" className="text-primary">Shop Now</Button></a>
              <a href="#categories"><Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">Browse Catalogue</Button></a>
            </div>
          </div>
        </div>
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
