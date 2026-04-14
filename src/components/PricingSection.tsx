import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Home Office",
    price: "$499",
    subtitle: "Essential ergonomic starter setup",
    features: ["1 ergonomic chair", "Free shipping", "5-year warranty", "30-day returns"],
    cta: "Shop Home Office",
    highlighted: false,
    disabled: false,
  },
  {
    name: "Pro Workspace",
    price: "$1,299",
    subtitle: "Complete desk + chair bundle",
    features: [
      "Performance chair",
      "Height-adjustable desk",
      "Free shipping",
      "12-year warranty",
      "White glove delivery",
      "Ergonomic consultation",
    ],
    cta: "Shop Pro Workspace",
    highlighted: false,
    disabled: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    subtitle: "Tailored solutions for your team",
    features: [
      "Volume pricing",
      "Full workspace design",
      "Installation included",
      "Dedicated account manager",
      "Sustainability reporting",
      "Extended warranties",
      "Flexible financing",
      "Priority support",
    ],
    cta: "Contact Sales",
    highlighted: true,
    disabled: false,
  },
];

const PricingSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-3">Workspace Packages</h2>
          <p className="text-muted-foreground text-lg">
            Choose the right package for your workspace needs.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl p-8 border transition-shadow ${
                plan.highlighted
                  ? "border-accent shadow-lg bg-card"
                  : "border-border bg-card"
              }`}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
                  Most Popular
                </Badge>
              )}
              <h3 className="font-serif text-2xl font-semibold text-card-foreground">{plan.name}</h3>
              <div className="mt-4 mb-1">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{plan.subtitle}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-card-foreground">
                    <Check size={16} className="text-accent shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full rounded-none"
                variant={plan.highlighted ? "default" : "outline"}
                disabled={plan.disabled}
              >
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
