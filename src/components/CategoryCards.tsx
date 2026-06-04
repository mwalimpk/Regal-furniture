import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { categories } from "@/data/products";
import { fetchApprovedStorefrontProducts } from "@/lib/storefrontProducts";

const featuredCategoryImages: Record<string, { image: string; position?: string }> = {
  "executive-suites": {
    image: "/uploads/collections/executive-suites/big-tall-500-hi-back-swivel-chair-netting-02da43e643.jpg",
    position: "center top",
  },
  "office-suites": {
    image: "/uploads/collections/office-suites/almin-workstation-4-seater-df4ddb5484.jpg",
    position: "center center",
  },
  "conference-boardroom": {
    image: "/uploads/collections/conference-boardroom/arcadian-boardroom-table-079a3a1fbd.jpg",
    position: "center center",
  },
  "reception-lobby": {
    image: "/uploads/collections/reception-lobby/chesterfield-leather-couch-3-seater-933676b7ed.png",
    position: "center center",
  },
  "accessories": {
    image: "/uploads/collections/accessories/metal-4-drawer-filing-cabinet-wth-bar-fdd5e9e2a5.jpg",
    position: "center center",
  },
};

const CategoryCards = () => {
  const { data: liveProducts = [] } = useQuery({
    queryKey: ["storefront-products"],
    queryFn: fetchApprovedStorefrontProducts,
  });

  const featuredCategories = [
    "executive-suites",
    "office-suites",
    "conference-boardroom",
    "reception-lobby",
    "accessories",
  ].map((slug) => {
    const category = categories.find((item) => item.slug === slug);
    const count = liveProducts.filter((product) => product.categorySlug === slug).length;
    const curated = featuredCategoryImages[slug];
    const fallbackImage = liveProducts.find((product) => product.categorySlug === slug)?.image || curated?.image || category?.image || "";

    return {
      name: category?.name || slug,
      items: `${count || 0} products`,
      slug,
      image: fallbackImage,
      imagePosition: curated?.position || "center center",
      description: category?.description || "",
    };
  });

  const [leadCategory, ...secondaryCategories] = featuredCategories;

  return (
    <section className="bg-background py-20 md:py-24">
      <div className="container mx-auto px-10">
        <div className="mb-12 grid gap-6 lg:grid-cols-[0.4fr_0.6fr] lg:items-end">
          <div className="max-w-xl">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.28em] text-label">Collections</p>
            <h2 className="font-serif text-3xl leading-tight text-foreground md:text-5xl">
              A calmer path into the catalog, shaped around how clients actually shop spaces.
            </h2>
          </div>
          <div className="max-w-2xl lg:justify-self-end">
            <p className="text-sm leading-7 text-muted-foreground">
              Instead of equal-weight tiles everywhere, the collections now move like an editorial spread:
              one lead story, then supporting categories that are easier to compare at a glance.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:h-[700px] lg:grid-cols-12">
          {leadCategory && (
            <Link
              to={`/category/${leadCategory.slug}`}
              className="group relative block min-h-[440px] overflow-hidden surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:col-span-7 lg:h-full lg:min-h-0"
            >
              <img
                src={leadCategory.image}
                alt={leadCategory.name}
                className="h-full w-full object-cover"
                style={{ objectPosition: leadCategory.imagePosition }}
                loading="lazy"
              />
              <div className="collection-image-scrim absolute inset-0" />
              <div className="absolute inset-x-0 bottom-0 z-10 p-6 transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0 md:p-8">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <span className="media-chip border-0 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em]">
                    {leadCategory.items}
                  </span>
                  <span className="collection-image-adaptive inline-flex items-center gap-2 pb-2 font-mono text-[11px] uppercase tracking-[0.2em]">
                    Explore
                    <ArrowRight size={16} />
                  </span>
                </div>
                <h3 className="collection-image-adaptive max-w-xl font-serif text-3xl md:text-4xl">{leadCategory.name}</h3>
              </div>
              <div className="collection-hover-panel absolute inset-0 z-20 flex translate-y-full flex-col justify-between p-6 transition-transform duration-500 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0 md:p-8">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[rgb(var(--collection-hover-muted-rgb)/1)]">
                    {leadCategory.items}
                  </p>
                  <h3 className="mt-5 max-w-xl font-serif text-3xl leading-tight text-[rgb(var(--collection-hover-foreground-rgb)/1)] md:text-5xl">
                    {leadCategory.name}
                  </h3>
                </div>
                <div className="max-w-xl translate-y-5 opacity-0 transition-all delay-100 duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                  <p className="text-sm leading-7 text-[rgb(var(--collection-hover-muted-rgb)/1)] md:text-base md:leading-8">
                    {leadCategory.description}
                  </p>
                  <span className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 border border-[rgb(var(--collection-hover-foreground-rgb)/0.7)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[rgb(var(--collection-hover-foreground-rgb)/1)] transition-colors group-hover:border-interactive group-hover:text-interactive">
                    Explore Collection
                    <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            </Link>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-5 lg:h-full lg:grid-rows-2">
            {secondaryCategories.map((category) => (
              <Link
                key={category.slug}
                to={`/category/${category.slug}`}
                className="group relative block min-h-[240px] overflow-hidden surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:h-full lg:min-h-0"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: category.imagePosition }}
                  loading="lazy"
                />
                <div className="collection-image-scrim absolute inset-0" />
                <div className="absolute inset-x-0 bottom-0 z-10 p-5 transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0 md:p-6">
                  <p className="collection-image-adaptive font-mono text-[10px] uppercase tracking-[0.22em] opacity-80">
                    {category.items}
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <h3 className="collection-image-adaptive max-w-[12rem] font-serif text-xl leading-tight">
                      {category.name}
                    </h3>
                    <ArrowRight
                      size={16}
                      className="collection-image-adaptive"
                    />
                  </div>
                </div>
                <div className="collection-hover-panel absolute inset-0 z-20 flex translate-y-full flex-col justify-between p-5 transition-transform duration-500 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0 md:p-6">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[rgb(var(--collection-hover-muted-rgb)/1)]">
                      {category.items}
                    </p>
                    <h3 className="mt-4 max-w-[13rem] font-serif text-2xl leading-tight text-[rgb(var(--collection-hover-foreground-rgb)/1)]">
                      {category.name}
                    </h3>
                  </div>
                  <div className="translate-y-4 opacity-0 transition-all delay-100 duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                    <p className="line-clamp-4 text-sm leading-6 text-[rgb(var(--collection-hover-muted-rgb)/1)]">
                      {category.description}
                    </p>
                    <span className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 border border-[rgb(var(--collection-hover-foreground-rgb)/0.7)] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--collection-hover-foreground-rgb)/1)] transition-colors group-hover:border-interactive group-hover:text-interactive">
                      View Collection
                      <ArrowRight size={15} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 pb-2 font-mono text-[11px] uppercase tracking-[0.24em] text-foreground transition-colors hover:text-interactive"
          >
            View the full catalog
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryCards;
