import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Basic",
    price: "Free",
    subtitle: "Browse and inquire on products",
    features: ["Browse full catalogue", "Request quotes", "Basic support", "Save favourites"],
    cta: "Sign Up Free",
    highlighted: false,
    disabled: false,
  },
  {
    name: "Business",
    price: "$49",
    period: "/month",
    subtitle: "For businesses and resellers",
    features: ["Wholesale pricing access", "Bulk order discounts", "Priority delivery", "Dedicated account manager", "Custom quotations", "Invoice billing"],
    cta: "Contact Sales",
    highlighted: true,
    disabled: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    subtitle: "Full-scale office furnishing projects",
    features: ["Project consultation", "Custom furniture design", "Installation service", "Volume discounts up to 40%", "Extended warranty", "Ongoing maintenance"],
    cta: "Get a Quote",
    highlighted: false,
    disabled: false,
  },
];

const PricingSection = () => {
  return (
    <section className="py-12 md:py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold font-serif text-foreground mb-2">Business Plans</h2>
          <p className="text-muted-foreground text-sm md:text-lg">
            From individual buyers to large corporations — we have a plan for you.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative rounded-xl p-6 md:p-8 border transition-shadow ${plan.highlighted ? "border-primary shadow-lg bg-card" : "border-border bg-card"}`}>
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">Most Popular</Badge>
              )}
              <h3 className="font-serif text-xl md:text-2xl font-semibold text-card-foreground">{plan.name}</h3>
              <div className="mt-3 mb-1">
                <span className="text-3xl md:text-4xl font-bold text-foreground">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mb-5">{plan.subtitle}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-xs md:text-sm text-card-foreground">
                    <span className="text-accent font-bold">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant={plan.highlighted ? "default" : "outline"} disabled={plan.disabled}>
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
