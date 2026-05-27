import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { gsap } from "gsap";

const slides = [
  {
    id: "01",
    eyebrow: "Premium Office Furniture",
    accent: "Crafted",
    heading: ["for Those", "Who Lead"],
    body:
      "Exceptional office and home furniture for modern African spaces, where premium craftsmanship meets everyday ambition.",
    replacementFile: "slide-01-crafted-for-those-who-lead.jpg",
    fallbackImage: "/images/products/green/BIG AND TALL HIGH BACK SWIVEL CHAIR.jpg",
    imageAlt: "Premium executive chair",
    cta: "/categories",
    ctaLabel: "Explore Collection",
    tone: {
      background:
        "radial-gradient(circle at 78% 34%, rgb(var(--taupe-rgb) / 0.18), transparent 26%), radial-gradient(circle at 70% 46%, rgb(var(--orange-rgb) / 0.12), transparent 20%), linear-gradient(90deg, rgb(var(--background) / 1) 0%, rgb(var(--card) / 0.96) 46%, rgb(var(--secondary) / 0.94) 100%)",
      card: "rgb(var(--card) / 0.72)",
    },
  },
  {
    id: "02",
    eyebrow: "Executive Desking Collection",
    accent: "Design",
    heading: ["Your Perfect", "Workspace"],
    body:
      "From executive desks to open-plan workstations, furniture that transforms how your team works, meets, and creates.",
    replacementFile: "slide-02-design-your-perfect-workspace.jpg",
    fallbackImage: "/images/products/green/CARINA L SHAPED DESK OAK.jpg",
    imageAlt: "Executive desk workspace",
    cta: "/category/executive-desking",
    ctaLabel: "View Desking",
    tone: {
      background:
        "radial-gradient(circle at 74% 30%, rgb(var(--orange-rgb) / 0.16), transparent 24%), radial-gradient(circle at 82% 52%, rgb(var(--rifle-rgb) / 0.16), transparent 28%), linear-gradient(90deg, rgb(var(--background) / 1) 0%, rgb(var(--card) / 0.96) 46%, rgb(var(--secondary) / 0.92) 100%)",
      card: "rgb(var(--card) / 0.76)",
    },
  },
  {
    id: "03",
    eyebrow: "Workspace Solutions",
    accent: "Spaces",
    heading: ["That Inspire", "Greatness"],
    body:
      "Full office fit-outs for hotels, corporations, schools, and developers. One supplier. One vision. Every space.",
    replacementFile: "slide-03-spaces-that-inspire-greatness.jpg",
    fallbackImage: "/images/products/green/DOMINION 4 SEATER WORKSTATION.jpg",
    imageAlt: "Office workstation furniture",
    cta: "/catalogue",
    ctaLabel: "Open Catalogue",
    tone: {
      background:
        "radial-gradient(circle at 72% 36%, rgb(var(--olive-rgb) / 0.18), transparent 24%), radial-gradient(circle at 84% 18%, rgb(var(--orange-rgb) / 0.12), transparent 18%), linear-gradient(90deg, rgb(var(--background) / 1) 0%, rgb(var(--card) / 0.96) 46%, rgb(var(--secondary) / 0.92) 100%)",
      card: "rgb(var(--card) / 0.78)",
    },
  },
  {
    id: "04",
    eyebrow: "Reception & Lounge",
    accent: "Comfort",
    heading: ["That Welcomes", "Everyone"],
    body:
      "Reception sofas, guest seating, and lounge pieces curated to make commercial interiors feel warm, confident, and complete.",
    replacementFile: "slide-04-comfort-that-welcomes-everyone.jpg",
    fallbackImage: "/images/products/green/CHESTERFIELD LEATHER COUCH 3 SEATER.png",
    imageAlt: "Reception lounge sofa",
    cta: "/category/sofas-lounge",
    ctaLabel: "Explore Lounge",
    tone: {
      background:
        "radial-gradient(circle at 80% 34%, rgb(var(--taupe-rgb) / 0.16), transparent 22%), radial-gradient(circle at 73% 46%, rgb(var(--olive-rgb) / 0.16), transparent 26%), linear-gradient(90deg, rgb(var(--background) / 1) 0%, rgb(var(--card) / 0.96) 46%, rgb(var(--secondary) / 0.92) 100%)",
      card: "rgb(var(--card) / 0.78)",
    },
  },
];

const HeroSection = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const slidesRef = useRef<Array<HTMLDivElement | null>>([]);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const previousIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [folderImages, setFolderImages] = useState<string[]>([]);

  const prefersReducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    let cancelled = false;

    fetch("/api/hero-slides")
      .then((response) => response.json())
      .then((payload: { data?: string[] }) => {
        if (cancelled) return;
        setFolderImages(Array.isArray(payload?.data) ? payload.data : []);
      })
      .catch(() => {
        if (!cancelled) setFolderImages([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const ctx = gsap.context(() => {
      const slideElements = slidesRef.current.filter(Boolean) as HTMLDivElement[];
      if (!slideElements.length) return;

      gsap.set(slideElements, { autoAlpha: 0 });
      gsap.set(slideElements[0], { autoAlpha: 1 });
      gsap.set(slideElements.map((slide) => slide.querySelector("[data-text]")), { y: 58, autoAlpha: 0 });
      gsap.set(slideElements.map((slide) => slide.querySelector("[data-copy]")), { y: 24, autoAlpha: 0 });
      gsap.set(slideElements.map((slide) => slide.querySelector("[data-image]")), { y: 48, scale: 1.08, autoAlpha: 0 });
      gsap.set(bgRef.current, { background: slides[0].tone.background });

      if (prefersReducedMotion) {
        slideElements.forEach((slide, index) => {
          const isActive = index === 0;
          gsap.set(slide, { autoAlpha: isActive ? 1 : 0 });
          gsap.set(slide.querySelector("[data-text]"), { y: 0, autoAlpha: isActive ? 1 : 0 });
          gsap.set(slide.querySelector("[data-copy]"), { y: 0, autoAlpha: isActive ? 1 : 0 });
          gsap.set(slide.querySelector("[data-image]"), { y: 0, scale: 1, autoAlpha: isActive ? 1 : 0 });
        });
        return;
      }

      const intro = slideElements[0];
      gsap.to(intro.querySelector("[data-text]"), { y: 0, autoAlpha: 1, duration: 0.65, ease: "power3.out" });
      gsap.to(intro.querySelector("[data-copy]"), { y: 0, autoAlpha: 1, duration: 0.55, delay: 0.1, ease: "power3.out" });
      gsap.to(intro.querySelector("[data-image]"), {
        y: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 0.75,
        delay: 0.08,
        ease: "power3.out",
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5600);

    return () => window.clearInterval(interval);
  }, [prefersReducedMotion]);

  useEffect(() => {
    const slideElements = slidesRef.current.filter(Boolean) as HTMLDivElement[];
    if (!slideElements.length) return;

    const previousIndex = previousIndexRef.current;
    if (previousIndex === activeIndex) return;

    const previous = slideElements[previousIndex];
    const next = slideElements[activeIndex];
    if (!previous || !next) return;

    if (prefersReducedMotion) {
      slideElements.forEach((slide, index) => {
        const isActive = index === activeIndex;
        gsap.set(slide, { autoAlpha: isActive ? 1 : 0 });
        gsap.set(slide.querySelector("[data-text]"), { y: 0, autoAlpha: isActive ? 1 : 0 });
        gsap.set(slide.querySelector("[data-copy]"), { y: 0, autoAlpha: isActive ? 1 : 0 });
        gsap.set(slide.querySelector("[data-image]"), { y: 0, scale: 1, autoAlpha: isActive ? 1 : 0 });
      });
      gsap.set(bgRef.current, { background: slides[activeIndex].tone.background });
      previousIndexRef.current = activeIndex;
      return;
    }

    const transition = gsap.timeline({
      onComplete: () => {
        previousIndexRef.current = activeIndex;
      },
    });

    transition
      .to(
        previous,
        {
          autoAlpha: 0,
          duration: 0.45,
          ease: "power2.inOut",
        },
        0,
      )
      .to(
        previous.querySelector("[data-text]"),
        {
          y: -36,
          autoAlpha: 0,
          duration: 0.35,
          ease: "power2.in",
        },
        0,
      )
      .to(
        previous.querySelector("[data-copy]"),
        {
          y: -18,
          autoAlpha: 0,
          duration: 0.28,
          ease: "power2.in",
        },
        0.02,
      )
      .to(
        previous.querySelector("[data-image]"),
        {
          y: -26,
          scale: 0.95,
          autoAlpha: 0,
          duration: 0.38,
          ease: "power2.in",
        },
        0,
      )
      .set(next, { autoAlpha: 1 }, 0.02)
      .to(
        bgRef.current,
        {
          background: slides[activeIndex].tone.background,
          duration: 0.55,
          ease: "power2.inOut",
        },
        0,
      )
      .fromTo(
        next.querySelector("[data-text]"),
        { y: 54, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" },
        0.05,
      )
      .fromTo(
        next.querySelector("[data-copy]"),
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.3, ease: "power3.out" },
        0.12,
      )
      .fromTo(
        next.querySelector("[data-image]"),
        { y: 52, scale: 1.08, autoAlpha: 0 },
        { y: 0, scale: 1, autoAlpha: 1, duration: 0.55, ease: "power3.out" },
        0.07,
      )
      ;

    return () => {
      transition.kill();
    };
  }, [activeIndex, prefersReducedMotion]);

  const currentSlide = slides[activeIndex];
  const getSlideImage = (slide: (typeof slides)[number], index: number) => folderImages[index] || slide.fallbackImage;

  return (
    <section
      ref={wrapperRef}
      className="main-wrapper relative mb-6 mt-[120px] h-[calc(100dvh-120px)] min-h-[900px] overflow-hidden lg:mt-[208px] lg:h-[calc(100dvh-208px)]"
    >
      <div
        ref={bgRef}
        className="absolute inset-0 transition-[background] duration-700"
        style={{ background: slides[0].tone.background }}
      />

      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="container mx-auto flex h-full flex-col justify-between py-6">
          <div className="flex items-start justify-between gap-6">
            <div className="bg-background/18 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.3em] text-primary-foreground backdrop-blur-md">
              Where Executive Precision Meets Living Comfort
            </div>
            <div className="hidden items-center gap-3 bg-background/18 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.26em] text-primary-foreground backdrop-blur-md md:flex">
              <span>{currentSlide.id}</span>
              <span className="h-px w-8 bg-interactive/70" />
              <span>{slides.length.toString().padStart(2, "0")}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            {slides.map((slide, index) => (
              <span
                key={slide.id}
                className={`h-[6px] transition-all ${
                  activeIndex === index
                    ? "w-12 bg-interactive"
                    : "w-3 bg-primary-foreground/35"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative h-full w-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            ref={(node) => {
              slidesRef.current[index] = node;
            }}
            className="absolute inset-0"
            style={{ opacity: index === 0 ? 1 : 0 }}
          >
            <div data-image className="absolute inset-0">
              <img
                src={getSlideImage(slide, index)}
                alt={slide.imageAlt}
                className="h-full w-full object-cover object-center"
                onError={(event) => {
                  const target = event.currentTarget;
                  if (target.src.includes(slide.fallbackImage)) return;
                  target.src = slide.fallbackImage;
                }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(12_14_10/0.82)_0%,rgb(12_14_10/0.48)_40%,rgb(12_14_10/0.18)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_32%,rgb(var(--interactive-rgb)/0.18),transparent_24%),radial-gradient(circle_at_82%_16%,rgb(var(--heritage-rgb)/0.18),transparent_18%)]" />
            </div>

            <div className="relative z-10 flex h-full items-center">
              <div className="container mx-auto flex h-full items-center py-6">
                <div data-text className="max-w-[780px]">
                  <div className="mb-8 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.28em] text-primary-foreground/72">
                    <span className="h-px w-10 bg-interactive" />
                    {slide.eyebrow}
                  </div>
                  <h1 className="text-balance font-serif text-[3.4rem] leading-[0.92] tracking-[-0.045em] text-primary-foreground md:text-[5.3rem] lg:text-[7rem]">
                    <span className="block font-normal italic text-interactive">{slide.accent}</span>
                    {slide.heading.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </h1>
                  <div data-copy className="mt-10 max-w-xl space-y-10">
                    <p className="text-base leading-8 text-white md:text-[1.06rem]">
                      {slide.body}
                    </p>
                    <Button
                      asChild
                      className="h-14 rounded-none border-0 bg-primary px-8 font-mono text-[11px] uppercase tracking-[0.22em] text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-0"
                    >
                      <Link to={slide.cta}>
                        {slide.ctaLabel}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
