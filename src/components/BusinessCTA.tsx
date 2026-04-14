import { Button } from "@/components/ui/button";
import businessImage from "@/assets/business-cta.jpg";

const BusinessCTA = () => {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto">
          <div className="md:w-1/2 space-y-5">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              Taking care of (your) business
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              We've been helping professionals for years. As a network-driven business ourselves,
              we know the best ways to boost growth, build trust, and create lasting partnerships in property.
            </p>
            <Button size="lg" className="px-8">Get Started</Button>
          </div>
          <div className="md:w-1/2">
            <img
              src={businessImage}
              alt="Business professionals discussing property"
              className="rounded-xl w-full object-cover aspect-[4/3]"
              loading="lazy"
              width={960}
              height={720}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessCTA;
