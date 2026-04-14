import { Button } from "@/components/ui/button";
import conferenceImg from "@/assets/product-conference.jpg";

const BusinessCTA = () => {
  return (
    <section className="py-12 md:py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 max-w-5xl mx-auto">
          <div className="md:w-1/2 space-y-4 text-center md:text-left">
            <h2 className="text-2xl md:text-4xl font-serif font-bold">
              Corporate & Bulk Orders
            </h2>
            <p className="text-primary-foreground/80 text-sm md:text-base leading-relaxed">
              Furnishing an office, hotel, or institution? Regal Office & Home offers tailored corporate solutions
              with volume discounts, project consultation, and delivery nationwide across Zimbabwe.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Button size="lg" variant="secondary" className="text-primary">Request a Quote</Button>
              <a href="tel:+2638644281361">
                <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary w-full">
                  Call Us Now
                </Button>
              </a>
            </div>
          </div>
          <div className="md:w-1/2">
            <img
              src={conferenceImg}
              alt="Regal boardroom table setup"
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
