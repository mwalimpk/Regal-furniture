import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const stats = [
  { value: "20+", label: "Years Experience" },
  { value: "483", label: "Happy Clients" },
  { value: "150+", label: "Projects Finished" },
];

const TestimonialsSection = () => {
  return (
    <section className="border-t border-grid/50 bg-background py-20 md:py-24">
      <div className="container mx-auto px-10">
        <div className="grid gap-12 lg:grid-cols-[0.38fr_0.62fr] lg:items-center">
          <div>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.28em] text-label">
              Client Proof
            </p>
            <h2 className="font-serif text-3xl leading-tight text-foreground md:text-5xl">
              Trusted by teams that need furniture to feel as resolved as the space around it.
            </h2>

            <div className="mt-10 grid gap-6 border-t border-grid/40 pt-8 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-serif text-4xl text-foreground">{stat.value}</p>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-label">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <Link to="/categories" className="mt-10 inline-block">
              <Button className="rounded-none bg-heritage px-8 py-6 font-mono text-[11px] uppercase tracking-[0.22em] text-primary-foreground hover:bg-heritage/90">
                Explore Products
              </Button>
            </Link>
          </div>

          <div className="bg-[linear-gradient(180deg,rgb(var(--card)/0.88)_0%,rgb(var(--secondary)/0.42)_100%)] p-8 md:p-12">
            <div className="mb-6 flex gap-1">
              {[...Array(5)].map((_, index) => (
                <Star key={index} className="h-4 w-4 fill-interactive text-interactive" />
              ))}
            </div>

            <p className="max-w-3xl font-serif text-2xl leading-relaxed text-foreground md:text-4xl">
              “On time and to our exact brief. The range felt considered, the finishes were excellent,
              and the delivered spaces looked resolved instead of improvised.”
            </p>

            <div className="mt-8 border-t border-grid/30 pt-6">
              <h4 className="text-lg font-semibold text-foreground">Shawn Lee</h4>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-label">
                Verified buyer, executive desking
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
