import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-[#f8f9fa] border-t border-gray-100">
      <div className="container mx-auto px-4 lg:px-8">
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-center text-gray-900 mb-20">
          Our Customer Testimonials
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24 max-w-5xl mx-auto">
          {/* Left Side stats */}
          <div className="w-full md:w-1/2 space-y-8">
            <p className="text-gray-500 font-medium text-lg">
              Crafted by rate materials and high quality materials.
            </p>
            
            <div className="flex gap-8 md:gap-12 pb-4">
              <div>
                <h3 className="text-4xl font-bold text-gray-900">20+</h3>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Years Experience</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-gray-900">483</h3>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Happy Clients</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-gray-900">150+</h3>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Project Finished</p>
              </div>
            </div>

            <Link to="/categories" className="inline-block">
              <Button className="bg-brand-red hover:bg-brand-red/90 text-white rounded-full px-8 py-6 text-sm font-semibold">
                Explore Products
              </Button>
            </Link>
          </div>

          {/* Right Side Testimonial Card */}
          <div className="w-full md:w-1/2">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-[0_4px_40px_-15px_rgba(0,0,0,0.1)] relative">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Shawn Lee</h4>
                  <p className="text-gray-400 text-sm">A verified buy of Desking</p>
                </div>
              </div>
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#fdb528] text-[#fdb528]" />
                ))}
              </div>

              <p className="text-gray-600 leading-relaxed text-sm md:text-base italic">
                "On time and to my exact demands — High quality, wide range of products absolutely loved the sets they delivered to us."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
