import { CreditCard, ShieldCheck, Truck, RefreshCw } from "lucide-react";

const features = [
  {
    title: "Easy Payment",
    icon: <CreditCard className="w-6 h-6 text-brand-red" strokeWidth={1.5} />,
  },
  {
    title: "Secure Data",
    icon: <ShieldCheck className="w-6 h-6 text-brand-red" strokeWidth={1.5} />,
  },
  {
    title: "Fast Delivery",
    icon: <Truck className="w-6 h-6 text-brand-red" strokeWidth={1.5} />,
  },
  {
    title: "Easy return",
    icon: <RefreshCw className="w-6 h-6 text-brand-red" strokeWidth={1.5} />,
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-center text-gray-900 mb-16">
          What makes us the Preferred choices?
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center group">
              <div className="h-20 w-20 rounded-2xl bg-brand-red/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{feature.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
