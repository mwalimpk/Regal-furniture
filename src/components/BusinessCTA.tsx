import { Button } from "@/components/ui/button";
import conferenceImg from "@/assets/product-conference.jpg";
import { buildWhatsAppCallLink } from "@/lib/contact";

const BusinessCTA = () => {
  const quoteHref = buildWhatsAppCallLink();

  return (
    <section className="py-0">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2">
          <img
            src={conferenceImg}
            alt="Regal boardroom table setup"
            className="w-full h-full object-cover min-h-[300px]"
            loading="lazy"
            width={960}
            height={720}
          />
        </div>
        <div className="md:w-1/2 bg-primary text-primary-foreground flex items-center justify-center p-8 md:p-16">
          <div className="max-w-md text-center md:text-left space-y-5">
            <h2 className="text-2xl md:text-4xl font-serif font-bold">
              Corporate & Bulk Orders
            </h2>
            <p className="text-primary-foreground/80 text-sm md:text-base leading-relaxed">
              Furnishing an office, hotel, or institution? Regal Office & Home offers tailored corporate solutions
              with volume discounts, project consultation, and delivery nationwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Button asChild size="lg" variant="secondary" className="text-primary px-10 tracking-wider uppercase text-xs">
                <a href={quoteHref}>Request a Quote</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessCTA;
