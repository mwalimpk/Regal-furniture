import { ArrowDownToLine, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useProductCategories } from "@/hooks/useProductCategories";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import PromotionalBannerSlot from "@/components/PromotionalBannerSlot";

const Categories = () => {
  const { data: categories = [], isLoading } = useProductCategories();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <div className="pt-[96px] lg:pt-[172px]">
        <div className="container mx-auto px-10 py-8 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[0.42fr_0.58fr] lg:items-end">
            <div className="max-w-xl">
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.28em] text-label">Collections</p>
              <h1 className="font-serif text-4xl leading-tight text-foreground md:text-6xl">
                Shop by Category
              </h1>
            </div>

            <div className="max-w-2xl lg:justify-self-end">
              <p className="text-sm leading-8 text-muted-foreground md:text-base">
                Browse the full range of office and home furniture, from executive desking and lounge seating
                to storage, collaboration, and reception pieces.
              </p>
              <Link
                to="/catalogue"
                className="mt-6 inline-flex items-center gap-2 border-b border-grid pb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground transition-colors hover:border-interactive hover:text-interactive"
              >
                <ArrowDownToLine size={16} />
                Download Catalogue
              </Link>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <PromotionalBannerSlot placement="categories-before-grid" className="sm:col-span-2 lg:col-span-3 xl:col-span-4" />
            {isLoading ? (
              <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 text-sm text-muted-foreground">Loading categories...</div>
            ) : !categories.length ? (
              <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 bg-card/60 p-8 text-sm text-muted-foreground">
                No product categories have been added yet.
              </div>
            ) : categories.map((category) => (
              <Link key={category.slug} to={category.url} className="group block">
                <div className="aspect-[4/4.5] overflow-hidden bg-card/60">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                </div>
                <div className="mt-5">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="font-serif text-2xl leading-tight text-foreground">{category.name}</h2>
                    <ArrowRight
                      size={18}
                      className="mt-1 text-heritage transition-colors duration-300 group-hover:text-interactive"
                    />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Categories;
