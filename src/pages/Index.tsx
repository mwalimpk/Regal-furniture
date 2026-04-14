import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryCards from "@/components/CategoryCards";
import FeaturedBanner from "@/components/FeaturedBanner";
import FeaturedProperties from "@/components/FeaturedProperties";
import WhyChooseUs from "@/components/WhyChooseUs";
import BusinessCTA from "@/components/BusinessCTA";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import OrderFormDialog from "@/components/OrderFormDialog";
import BookVisitDialog from "@/components/BookVisitDialog";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [orderOpen, setOrderOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />

      {/* Quick action bar */}
      <section className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <span className="text-sm font-medium">Ready to furnish your space?</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setOrderOpen(true)} className="text-xs tracking-wider uppercase">
              Place an Order
            </Button>
            <Button variant="outline" size="sm" onClick={() => setVisitOpen(true)} className="text-xs tracking-wider uppercase border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Book a Visit
            </Button>
          </div>
        </div>
      </section>

      <CategoryCards />
      <FeaturedProperties />
      <FeaturedBanner />
      <WhyChooseUs />
      <BusinessCTA />
      <PricingSection />
      <Footer />
      <MobileBottomNav />

      <OrderFormDialog open={orderOpen} onOpenChange={setOrderOpen} />
      <BookVisitDialog open={visitOpen} onOpenChange={setVisitOpen} />
    </div>
  );
};

export default Index;
