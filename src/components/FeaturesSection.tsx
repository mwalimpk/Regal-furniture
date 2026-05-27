import { CreditCard, RefreshCw, ShieldCheck, Truck } from "lucide-react";

const features = [
  {
    title: "Easy Payment",
    body: "Flexible payment coordination for retail orders and project accounts.",
    icon: <CreditCard className="h-6 w-6 text-current" strokeWidth={1.5} />,
  },
  {
    title: "Secure Data",
    body: "Protected customer information from inquiry to order completion.",
    icon: <ShieldCheck className="h-6 w-6 text-current" strokeWidth={1.5} />,
  },
  {
    title: "Fast Delivery",
    body: "Coordinated dispatch and assembly for city and nationwide fulfillment.",
    icon: <Truck className="h-6 w-6 text-current" strokeWidth={1.5} />,
  },
  {
    title: "Easy Return",
    body: "Straightforward support if a product or fit-out detail needs attention.",
    icon: <RefreshCw className="h-6 w-6 text-current" strokeWidth={1.5} />,
  },
];

const FeaturesSection = () => {
  return (
    <section className="surface-inverse py-16 md:py-20">
      <div className="container mx-auto px-10">
        <div className="grid gap-10 lg:grid-cols-[0.36fr_0.64fr] lg:items-center">
          <div>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.28em] text-[rgb(var(--inverse-foreground-rgb)/0.6)]">
              Operational Assurances
            </p>
            <h2 className="font-serif text-3xl leading-tight md:text-5xl">
              The service layer behind every workspace decision.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 xl:gap-0">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`py-2 xl:px-6 ${index > 0 ? "xl:border-l xl:border-[rgb(var(--inverse-foreground-rgb)/0.18)]" : ""}`}
              >
                <div className="mb-5 text-interactive">{feature.icon}</div>
                <h3 className="font-serif text-2xl text-[rgb(var(--inverse-foreground-rgb)/1)]">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[rgb(var(--inverse-foreground-rgb)/0.68)]">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
