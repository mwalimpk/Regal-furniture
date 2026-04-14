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

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <CategoryCards />
      <FeaturedProperties />
      <FeaturedBanner />
      <WhyChooseUs />
      <BusinessCTA />
      <PricingSection />
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
