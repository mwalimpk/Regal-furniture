import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProjectCTASection from "@/components/ProjectCTASection";
import CategoryCards from "@/components/CategoryCards";
import BestSellingProducts from "@/components/BestSellingProducts";
import PromotionalBannerSlot from "@/components/PromotionalBannerSlot";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="home-viewport min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <PromotionalBannerSlot placement="home-after-hero" />
      <CategoryCards />
      <PromotionalBannerSlot placement="home-before-products" />
      <BestSellingProducts />
      <ProjectCTASection />
      <FeaturesSection />
      <TestimonialsSection />
      <PromotionalBannerSlot placement="home-before-newsletter" />
      <NewsletterSection />
      <Footer />
    </div>
  );
};

export default Index;
