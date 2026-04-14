import { Truck, Leaf, ShieldCheck, Award } from "lucide-react";

const values = [
  { icon: Truck, label: "Fast Shipping" },
  { icon: Leaf, label: "Sustainably Made" },
  { icon: ShieldCheck, label: "Ergonomic Design" },
  { icon: Award, label: "Quality Craftsmanship" },
];

const WhyChooseUs = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
          Elevate the everyday.
        </h2>
        <p className="text-muted-foreground text-base max-w-2xl mx-auto mb-12">
          We make it easy to create a workspace that fuels focus and sparks creativity — day in, day out.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          {values.map((v) => (
            <a
              key={v.label}
              href="#"
              className="group flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <v.icon className="text-accent" size={28} />
              </div>
              <span className="font-semibold text-sm text-card-foreground">{v.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
