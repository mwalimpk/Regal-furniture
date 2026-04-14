import { Building2, ShieldCheck, CreditCard, TrendingUp } from "lucide-react";

const features = [
  { icon: Building2, title: "Extensive Listings", description: "Browse thousands of verified properties across multiple countries and cities." },
  { icon: ShieldCheck, title: "Verified Properties", description: "Every listing is verified by our team to ensure quality and authenticity." },
  { icon: CreditCard, title: "Flexible Plans", description: "Choose from buying, renting, or booking options that fit your needs." },
  { icon: TrendingUp, title: "Market Insights", description: "Get real-time market data and insights to make informed decisions." },
];

const WhyChooseUs = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-3">Why Choose Us</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            When professionals surround themselves with the right people, the results can be transformational.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="text-center p-6 rounded-xl bg-card border border-border hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="text-accent" size={28} />
              </div>
              <h3 className="font-serif text-xl font-semibold text-card-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
