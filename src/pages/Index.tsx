import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryCards from "@/components/CategoryCards";
import FeaturedBanner from "@/components/FeaturedBanner";
import FeaturedProperties from "@/components/FeaturedProperties";
import WhyChooseUs from "@/components/WhyChooseUs";
import BusinessCTA from "@/components/BusinessCTA";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <CategoryCards />
      <FeaturedBanner />
      <FeaturedProperties />
      <WhyChooseUs />
      <BusinessCTA />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Index;
