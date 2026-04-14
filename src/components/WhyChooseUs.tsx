import { Truck, ShieldCheck, Headphones, Award } from "lucide-react";

const features = [
  { icon: Award, title: "Premium Quality", description: "Handcrafted furniture built with the finest materials to stand the test of time." },
  { icon: Truck, title: "Nationwide Delivery", description: "Free delivery across Zimbabwe. International shipping available on request." },
  { icon: ShieldCheck, title: "2 Year Warranty", description: "Every piece comes with a comprehensive 2-year manufacturer warranty." },
  { icon: Headphones, title: "Expert Support", description: "Dedicated team to help you choose the perfect furniture for your space." },
];

const WhyChooseUs = () => {
  return (
    <section id="about" className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold font-serif text-foreground mb-2">Why Regal?</h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
            Decades of experience combining modern aesthetics with exceptional craftsmanship.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="text-center p-4 md:p-6 rounded-xl bg-card border border-border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                <feature.icon className="text-accent" size={24} />
              </div>
              <h3 className="font-serif text-base md:text-xl font-semibold text-card-foreground mb-1">{feature.title}</h3>
              <p className="text-muted-foreground text-xs md:text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
