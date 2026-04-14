import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-lifestyle.jpg";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="pt-[88px] min-h-[85vh] flex items-stretch">
      <div className="flex flex-col md:flex-row w-full">
        <div className="md:w-[40%] bg-secondary flex items-center justify-center p-8 md:p-16">
          <div className="max-w-md text-center space-y-6">
            <p className="text-sm font-semibold tracking-widest text-accent uppercase">
              Clarity · Connection · Collaboration
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-foreground font-serif">
              Transforming Networks into{" "}
              <span className="text-accent">Opportunities</span>
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              At Power of Circles, we believe that true growth happens within intentional circles of trust, collaboration, and shared opportunity.
            </p>
            <div className="flex gap-4 justify-center pt-2">
              <Link to="/auth"><Button size="lg">Sign Up</Button></Link>
              <Link to="/auth"><Button size="lg" variant="outline">Sign In</Button></Link>
            </div>
          </div>
        </div>
        <div className="md:w-[60%] relative">
          <img
            src={heroImage}
            alt="Luxury property lifestyle"
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
