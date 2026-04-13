import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Free",
    price: "$0",
    subtitle: "Get started with basic listings",
    features: ["Up to 3 property listings", "Standard visibility", "Basic support", "5 images per listing"],
    cta: "Current Free Plan",
    highlighted: false,
    disabled: true,
  },
  {
    name: "Monthly",
    price: "$29.99",
    period: "/month",
    altPrice: "KSh 4,500/month",
    subtitle: "Unlimited listings with premium visibility",
    features: [
      "Unlimited property listings",
      "Premium visibility",
      "Priority support",
      "5 images per listing",
      "Analytics dashboard",
      "Lead management",
    ],
    cta: "Sign In to Subscribe",
    highlighted: false,
    disabled: false,
  },
  {
    name: "Annual",
    price: "$249.99",
    period: "/year",
    altPrice: "KSh 38,000/year",
    subtitle: "Best value — save 30% with annual billing",
    features: [
      "Unlimited property listings",
      "Premium visibility",
      "Priority support",
      "5 images per listing",
      "Analytics dashboard",
      "Lead management",
      "Featured listings",
      "Save 30%",
    ],
    cta: "Sign In to Subscribe",
    highlighted: true,
    disabled: false,
  },
];

const PricingSection = () => {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Listing Packages</h2>
          <p className="text-muted-foreground text-lg">
            Choose the right package for your property listing needs. Pay with Card or M-Pesa.
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
                  Best Value
                </Badge>
              )}
              <h3 className="font-serif text-2xl font-semibold text-card-foreground">{plan.name}</h3>
              <div className="mt-4 mb-1">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
              </div>
              {plan.altPrice && (
                <p className="text-sm text-muted-foreground mb-4">{plan.altPrice}</p>
              )}
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
                className="w-full"
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
