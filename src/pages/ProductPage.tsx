import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/utils/formatCurrency";
import { useToast } from "@/hooks/use-toast";
import { products, Product } from "@/data/products";
import { greenProducts } from "@/data/greenProducts";
import { mergeProducts, propertyToProduct } from "@/lib/storefrontProducts";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import RFQModal from "@/components/RFQModal";
import { Star, ShoppingCart, Info, Truck, ShieldCheck, ArrowRight } from "lucide-react";

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem, setIsOpen } = useCart();
  const { toast } = useToast();
  const { currency } = useCurrency();
  const [rfqOpen, setRfqOpen] = useState(false);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState("");

  const { data: dbProducts, isLoading } = useQuery({
    queryKey: ["storefront-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const uniqueProducts = useMemo(
    () => mergeProducts(
      (dbProducts || []).map(propertyToProduct),
      [...products, ...greenProducts],
    ),
    [dbProducts],
  );
  const product = useMemo(
    () => uniqueProducts.find((p) => p.id === id),
    [id, uniqueProducts],
  );
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const images = product.images?.length ? product.images : [product.image];
    return Array.from(new Set(images.filter(Boolean)));
  }, [product]);

  useEffect(() => {
    if (galleryImages.length) {
      setSelectedImage(galleryImages[0]);
    }
  }, [galleryImages]);

  // Manage Recent Views locally in LocalStorage
  useEffect(() => {
    if (!product) return;
    
    try {
      const existing = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const updated = [product.id, ...existing.filter((viewId: string) => viewId !== product.id)].slice(0, 4);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      
      const loadedRecent = updated
        .map((vid: string) => uniqueProducts.find(p => p.id === vid))
        .filter(Boolean) as Product[];
      
      setRecentlyViewed(loadedRecent.filter(p => p.id !== product.id));
    } catch (e) {
      console.error(e);
    }
  }, [product, uniqueProducts]);

  // Fetch Supabase Pairings
  useEffect(() => {
    if (!product) return;
    const fetchPairings = async () => {
      try {
        const { data, error } = await supabase
          .from('product_pairings')
          .select('recommended_ids')
          .eq('product_id', product.id)
          .maybeSingle();
        
        if (!error && data && data.recommended_ids?.length > 0) {
          const matched = data.recommended_ids
            .map((recId: string) => uniqueProducts.find((p) => p.id === recId))
            .filter(Boolean) as Product[];
          setRecommended(matched);
        } else {
          fallbackPairings();
        }
      } catch {
        fallbackPairings();
      }
    };
    
    const fallbackPairings = () => {
        const matched = uniqueProducts
            .filter(p => p.categorySlug === product.categorySlug && p.id !== product.id)
            .slice(0, 4);
        setRecommended(matched);
    };

    fetchPairings();
  }, [product, uniqueProducts]);

  if (isLoading && !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pt-32 text-center items-center">
        <Navbar />
        <p className="text-gray-600">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pt-32 text-center items-center">
        <Navbar />
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6">Product not found</h1>
        <Link to="/categories"><Button>Browse All Categories</Button></Link>
      </div>
    );
  }

  const handleAdd = () => {
    addItem({ id: product.id, name: product.name, price: product.price, currency: product.currency, image: product.image });
    setIsOpen(true);
    toast({ title: "Cart Updated", description: `${product.name} ready for checkout.` });
  };

  const oldPrice = parseFloat((product.price * 1.22).toFixed(0));

  return (
    <div className="min-h-screen bg-[#fcfaf7] pb-20 pt-20 md:pb-0">
      <Navbar />

      <div className="border-b border-[#ece3d7] bg-white/90 backdrop-blur">
        <div className="container mx-auto px-4 py-4 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-medium text-[#7d7468]">
            <Link to="/" className="hover:text-brand-red">Home</Link>
            <span className="text-[#c4b7a7]">›</span>
            <Link to={`/category/${product.categorySlug}`} className="hover:text-brand-red">{product.category}</Link>
            <span className="text-[#c4b7a7]">›</span>
            <span className="text-[#171a18]">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 lg:px-8 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-[32px] border border-[#e8dfd4] bg-[linear-gradient(180deg,#faf7f2_0%,#f2ece5_100%)] p-6 shadow-[0_30px_70px_rgba(27,31,28,0.06)] md:p-8">
              <div className="aspect-[4/3] rounded-[24px] bg-white/40 p-4">
                <img src={selectedImage || product.image} alt={product.name} className="h-full w-full object-contain mix-blend-multiply drop-shadow-[0_18px_30px_rgba(0,0,0,0.15)]" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
              {galleryImages.slice(0, 6).map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={`aspect-square overflow-hidden rounded-[20px] border p-2 transition-all ${selectedImage === image ? "border-brand-red bg-[#fff8f7] shadow-sm" : "border-[#e4dacf] bg-white hover:border-[#cdb79a]"}`}
                >
                  <img src={image} alt={`${product.name} view ${index + 1}`} className="h-full w-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>

            <div className="rounded-[28px] border border-[#e8dfd4] bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif text-2xl text-[#171a18]">What you’ll receive</h3>
                <span className="text-xs uppercase tracking-[0.2em] text-[#8a7f70]">3+ image ready</span>
              </div>
              <div className="grid gap-3 text-sm text-[#5f584f] md:grid-cols-3">
                <div className="rounded-2xl bg-[#f7f2ea] p-4">
                  <p className="font-semibold text-[#171a18]">Primary product image</p>
                  <p className="mt-2 leading-6">Clean hero framing for category cards, catalog pages, and the featured homepage blocks.</p>
                </div>
                <div className="rounded-2xl bg-[#f7f2ea] p-4">
                  <p className="font-semibold text-[#171a18]">Detail and angle views</p>
                  <p className="mt-2 leading-6">Support material quality, finish choices, and size confidence before the quote request.</p>
                </div>
                <div className="rounded-2xl bg-[#f7f2ea] p-4">
                  <p className="font-semibold text-[#171a18]">Project-ready descriptions</p>
                  <p className="mt-2 leading-6">The page now supports richer visual presentation without overwhelming the buyer.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="mb-4 inline-flex rounded-full bg-[#f8ebe8] px-3 py-1 text-xs font-medium text-brand-red">
              {product.category}
            </div>

            <h1 className="font-serif text-4xl leading-tight text-[#171a18] md:text-5xl">{product.name}</h1>

            <div className="mb-6 mt-4 flex items-center gap-3">
              <div className="flex text-[#fdb528]">
                {[...Array(5)].map((_, i) => (
                   <Star key={i} className={`${i < 4 ? "fill-current" : "fill-current opacity-25"} h-4 w-4`} />
                ))}
              </div>
              <span className="text-sm font-medium text-[#6d655b]">Trusted workspace essential</span>
            </div>

            <p className="mb-8 text-sm leading-7 text-[#5f584f] md:text-base">
              {product.description} Built for modern offices, reception areas, and disciplined home workstations, with a layout that now prioritizes image quality, trust, and a clearer path to purchase or quotation.
            </p>

            <div className="mb-8 rounded-[30px] border border-[#e6ddd1] bg-white p-6 shadow-[0_20px_50px_rgba(23,26,24,0.05)]">
              <div className="flex flex-wrap items-end gap-4">
                <span className="font-serif text-5xl text-brand-red">{formatCurrency(product.price, currency)}</span>
              {product.price > 0 && (
                <>
                    <span className="mb-1 text-xl font-medium text-[#a89e92] line-through">{formatCurrency(oldPrice, currency)}</span>
                    <span className="mb-2 rounded-full bg-[#f8ebe8] px-3 py-1 text-xs font-bold text-brand-red">Project rate available</span>
                </>
              )}
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-[#f7f2ea] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#8d8272]">Delivery</p>
                  <p className="mt-2 text-sm font-medium text-[#171a18]">City delivery and assembly support</p>
                </div>
                <div className="rounded-2xl bg-[#f7f2ea] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#8d8272]">Bulk Buying</p>
                  <p className="mt-2 text-sm font-medium text-[#171a18]">Quotes for 10+ units and fit-outs</p>
                </div>
                <div className="rounded-2xl bg-[#f7f2ea] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#8d8272]">Warranty</p>
                  <p className="mt-2 text-sm font-medium text-[#171a18]">5-year manufacturer cover</p>
                </div>
              </div>
            </div>

            <div className="mb-8 overflow-hidden rounded-[28px] border border-[#e6ddd1] bg-white">
              <div className="border-b border-[#eee4d8] bg-[#fbf7f1] px-5 py-4 text-xs font-semibold uppercase tracking-[0.26em] text-[#7d7468]">
                Specifications
              </div>
              <div className="divide-y divide-[#f0e8de] text-sm">
                <div className="flex justify-between px-5 py-4">
                   <span className="text-[#7d7468]">Dimensions</span>
                   <span className="text-right font-medium text-[#171a18]">160cm × 160cm</span>
                </div>
                <div className="flex justify-between px-5 py-4">
                   <span className="text-[#7d7468]">Material</span>
                   <span className="text-right font-medium text-[#171a18]">Premium Grade</span>
                </div>
                <div className="flex justify-between px-5 py-4">
                   <span className="text-[#7d7468]">Availability</span>
                   <span className="text-right font-medium text-[#171a18]">In Stock — Ships in 3-5 days</span>
                </div>
                <div className="flex justify-between px-5 py-4">
                   <span className="text-[#7d7468]">Warranty</span>
                   <span className="text-right font-medium text-[#171a18]">5 Years</span>
                </div>
              </div>
            </div>

            <div className="mb-8 flex flex-col gap-4 sm:flex-row">
               <Button onClick={handleAdd} className="h-14 flex-1 rounded-full bg-[#7b1f34] text-base font-semibold text-white shadow-lg shadow-brand-red/20 transition-all hover:bg-[#661828]">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
               </Button>
               <Button onClick={() => setRfqOpen(true)} variant="outline" className="h-14 flex-1 rounded-full border-brand-red text-base font-semibold text-brand-red hover:bg-red-50">
                  Request Quote
               </Button>
            </div>

            <div className="space-y-4">
               <div className="flex gap-4 rounded-[24px] border border-[#f0d9d6] bg-[#fcf5f5] p-4">
                  <div className="mt-1 text-brand-red"><Info size={20} /></div>
                  <div>
                    <h4 className="pb-1 text-sm font-semibold text-[#171a18]">Need 10+ units?</h4>
                    <p className="text-xs text-[#6f6659]">
                      Get special bulk pricing for offices, hotels, and large projects. <button onClick={() => setRfqOpen(true)} className="cursor-pointer font-bold text-brand-red underline">Request a bulk quote</button>
                    </p>
                  </div>
               </div>
               
               <div className="flex gap-4 rounded-[24px] bg-white p-4 border border-[#e6ddd1]">
                  <div className="mt-1 text-gray-700"><Truck size={20} /></div>
                  <div>
                    <h4 className="pb-1 text-sm font-semibold text-[#171a18]">Delivery Information</h4>
                    <p className="text-xs text-[#6f6659]">Free delivery & assembly within city limits. Nationwide shipping available.</p>
                  </div>
               </div>

               <div className="flex gap-4 rounded-[24px] bg-white p-4 border border-[#e6ddd1]">
                  <div className="mt-1 text-gray-700"><ShieldCheck size={20} /></div>
                  <div>
                    <h4 className="pb-1 text-sm font-semibold text-[#171a18]">Warranty</h4>
                    <p className="text-xs text-[#6f6659]">5 Years manufacturer warranty included.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#ebe2d8] bg-white py-16">
        <div className="container mx-auto space-y-16 px-4 lg:px-8">
          {recommended.length > 0 && (
            <div>
              <div className="mb-8 flex items-center justify-between">
                <h2 className="font-serif text-3xl text-[#171a18]">You May Also Like</h2>
                <span className="hidden text-sm text-[#7d7468] md:block">Recommended companion pieces</span>
              </div>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {recommended.map((prod) => (
                  <Link key={prod.id} to={`/product/${prod.id}`} className="group flex flex-col rounded-[24px] border border-[#ebe3d8] bg-[#fdfbf8] p-4 transition-all hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(23,26,24,0.06)]">
                    <div className="mb-4 flex aspect-square items-center justify-center rounded-[18px] bg-[#f4eee7] p-4">
                       <img src={prod.image} alt={prod.name} className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <h3 className="mb-1 line-clamp-1 text-sm font-bold text-[#171a18]">{prod.name}</h3>
                    <p className="font-serif font-bold text-brand-red">{formatCurrency(prod.price, currency)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {recentlyViewed.length > 0 && (
            <div>
              <div className="mb-8 flex items-center justify-between">
                <h2 className="font-serif text-3xl text-[#171a18]">Recently Viewed</h2>
                <Link to="/categories" className="hidden items-center gap-2 text-sm font-semibold text-[#171a18] md:flex">
                  Continue browsing
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {recentlyViewed.map((prod) => (
                  <Link key={prod.id} to={`/product/${prod.id}`} className="group flex flex-col rounded-[24px] border border-[#ebe3d8] bg-[#fdfbf8] p-4 transition-all hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(23,26,24,0.06)]">
                    <div className="mb-4 flex aspect-square items-center justify-center rounded-[18px] bg-[#f4eee7] p-4">
                       <img src={prod.image} alt={prod.name} className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <h3 className="mb-1 line-clamp-1 text-sm font-bold text-[#171a18]">{prod.name}</h3>
                    <p className="font-serif font-bold text-brand-red">{formatCurrency(prod.price, currency)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
      <MobileBottomNav />

      <RFQModal open={rfqOpen} onOpenChange={setRfqOpen} productName={product.name} />
    </div>
  );
};

export default ProductPage;
