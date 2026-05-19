import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const NewsletterSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight">
            Subscribe to our Newsletter to get Updates<br className="hidden md:block"/> to our latest Furnitures
          </h2>
          <p className="text-gray-500 text-sm">
            Get 20% off on your first order just by subscribing to our newsletter
          </p>
          
          <form className="mt-8 flex items-center bg-white border border-gray-200 rounded-full p-1.5 shadow-sm max-w-md mx-auto focus-within:ring-2 focus-within:ring-brand-red/20 transition-all">
            <div className="pl-4 pr-2 text-gray-400">
              <Mail size={18} />
            </div>
            <input 
              type="email" 
              placeholder="Enter Email Address" 
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400 min-w-0"
              required
            />
            <Button type="submit" className="bg-brand-red hover:bg-brand-red/90 text-white rounded-full px-6 py-5 text-sm font-semibold">
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
