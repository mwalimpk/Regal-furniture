import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import Navbar from "@/components/Navbar";
import StorefrontProductTile from "@/components/StorefrontProductTile";
import { useProductInstitutions } from "@/hooks/useProductInstitutions";
import { fetchApprovedStorefrontProducts } from "@/lib/storefrontProducts";

const InstitutionPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: institutions = [], isLoading: loadingInstitutions } = useProductInstitutions();
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["storefront-products"],
    queryFn: fetchApprovedStorefrontProducts,
  });

  const institution = institutions.find((item) => item.slug === slug);
  const institutionProducts = products.filter((product) => product.institutionSlugs?.includes(slug || ""));

  if (loadingInstitutions || loadingProducts) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-[112px] text-center text-muted-foreground lg:pt-[188px]">Loading products...</main>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-10 py-24 pt-[140px] text-center lg:pt-[220px]">
          <h1 className="font-serif text-4xl text-foreground">Institution not found</h1>
          <Link to="/" className="mt-8 inline-flex items-center gap-2 text-sm text-heritage">
            <ArrowLeft size={16} />
            Return home
          </Link>
        </main>
      </div>
    );
  }

  const heroImage = institution.imageUrl || institutionProducts[0]?.image;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="pt-[96px] lg:pt-[172px]">
        <section className="relative min-h-[430px] overflow-hidden border-b border-grid/40">
          {heroImage && <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(12_14_10/0.9),rgb(12_14_10/0.52),rgb(12_14_10/0.2))]" />
          <div className="container relative z-10 mx-auto flex min-h-[430px] flex-col justify-end px-10 py-12 text-white">
            <Link to="/" className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/70">
              <ArrowLeft size={15} />
              Home
            </Link>
            <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-white/68">Institution solutions</p>
            <h1 className="mt-4 font-serif text-5xl leading-tight md:text-7xl">{institution.name}</h1>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-white/76 md:text-base">{institution.description}</p>
          </div>
        </section>

        <section className="container mx-auto px-10 py-16 md:py-20">
          <div className="mb-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-label">
              {institutionProducts.length} matching product{institutionProducts.length === 1 ? "" : "s"}
            </p>
            <h2 className="mt-3 font-serif text-3xl text-foreground md:text-5xl">Furniture selected for {institution.name}</h2>
          </div>

          {institutionProducts.length ? (
            <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-4">
              {institutionProducts.map((product) => (
                <StorefrontProductTile
                  key={product.id}
                  product={product}
                  relatedProducts={institutionProducts}
                  compact
                />
              ))}
            </div>
          ) : (
            <div className="border border-grid/25 bg-card/60 px-6 py-16 text-center">
              <h2 className="font-serif text-2xl text-foreground">No products assigned yet</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Assign this institution to products in the admin product editor.
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default InstitutionPage;
