import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-property.jpg";

const HeroSection = () => {
  return (
    <section className="pt-16 min-h-[85vh] flex items-center">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <p className="text-sm font-semibold tracking-widest text-accent uppercase">
            Clarity · Connection · Collaboration
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
            Transforming Networks into{" "}
            <span className="text-accent">Opportunities</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
            At Power of Circles in Networking, we believe that true growth happens
            within intentional circles of trust, collaboration, and shared opportunity.
          </p>
          <p className="text-muted-foreground">
            Your network is powerful, but the right circle is transformational.
            Discover premium properties and connect with trusted professionals worldwide.
          </p>
          <div className="flex gap-4 pt-2">
            <Button size="lg">Sign Up</Button>
            <Button size="lg" variant="outline">Sign In</Button>
          </div>
        </div>
        <div className="relative">
          <img
            src={heroImage}
            alt="Luxury beachfront property"
            className="rounded-2xl shadow-xl w-full object-cover aspect-[16/11]"
            width={1280}
            height={720}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
