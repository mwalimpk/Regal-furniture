import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProjectCTASection from "@/components/ProjectCTASection";
import CategoryCards from "@/components/CategoryCards";
import BestSellingProducts from "@/components/BestSellingProducts";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ProjectCTASection />
      <CategoryCards />
      <BestSellingProducts />
      <FeaturesSection />
      <TestimonialsSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
};

export default Index;
