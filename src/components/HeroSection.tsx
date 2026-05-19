import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
        "radial-gradient(circle at 78% 36%, rgba(106, 113, 73, 0.42), transparent 30%), linear-gradient(90deg, #171c15 0%, #202618 52%, #4d5437 100%)",
      card: "rgba(37, 43, 30, 0.8)",
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
        "radial-gradient(circle at 75% 34%, rgba(130, 91, 47, 0.28), transparent 30%), linear-gradient(90deg, #171c15 0%, #23271a 48%, #474b2f 100%)",
      card: "rgba(46, 42, 27, 0.82)",
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
        "radial-gradient(circle at 74% 38%, rgba(138, 145, 103, 0.3), transparent 28%), linear-gradient(90deg, #161b15 0%, #23281a 48%, #6a7251 100%)",
      card: "rgba(47, 53, 37, 0.8)",
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
        "radial-gradient(circle at 80% 36%, rgba(113, 126, 94, 0.28), transparent 28%), linear-gradient(90deg, #141914 0%, #20251a 48%, #505a41 100%)",
      card: "rgba(43, 48, 34, 0.82)",
    },
  },
];

const HeroSection = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const slidesRef = useRef<Array<HTMLDivElement | null>>([]);
  const bgRef = useRef<HTMLDivElement | null>(null);
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
    if (!wrapperRef.current || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const slideElements = slidesRef.current.filter(Boolean) as HTMLDivElement[];
      if (!slideElements.length) return;

      gsap.set(slideElements, { autoAlpha: 0 });
      gsap.set(slideElements[0], { autoAlpha: 1 });
      gsap.set(slideElements.map((slide) => slide.querySelector("[data-text]")), { y: 58, autoAlpha: 0 });
      gsap.set(slideElements.map((slide) => slide.querySelector("[data-copy]")), { y: 24, autoAlpha: 0 });
      gsap.set(slideElements.map((slide) => slide.querySelector("[data-image]")), { y: 48, scale: 1.08, autoAlpha: 0 });
      gsap.set(slideElements.map((slide) => slide.querySelector("[data-card]")), { y: 30, autoAlpha: 0 });

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
      gsap.to(intro.querySelector("[data-card]"), { y: 0, autoAlpha: 1, duration: 0.6, delay: 0.16, ease: "power3.out" });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: `+=${slides.length * window.innerHeight}`,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          snap: {
            snapTo: (value) => {
              const steps = slides.length - 1;
              return Math.round(value * steps) / steps;
            },
            duration: { min: 0.15, max: 0.4 },
            ease: "power1.inOut",
          },
          onUpdate: (self) => {
            const nextIndex = Math.min(slides.length - 1, Math.round(self.progress * (slides.length - 1)));
            setActiveIndex(nextIndex);
          },
        },
      });

      slideElements.forEach((slide, index) => {
        if (index === 0) return;

        const previous = slideElements[index - 1];
        const phaseStart = index - 0.1;

        timeline
          .to(
            previous,
            {
              autoAlpha: 0,
              duration: 0.45,
              ease: "power2.inOut",
            },
            phaseStart,
          )
          .to(
            previous.querySelector("[data-text]"),
            {
              y: -36,
              autoAlpha: 0,
              duration: 0.35,
              ease: "power2.in",
            },
            phaseStart,
          )
          .to(
            previous.querySelector("[data-copy]"),
            {
              y: -18,
              autoAlpha: 0,
              duration: 0.28,
              ease: "power2.in",
            },
            phaseStart + 0.02,
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
            phaseStart,
          )
          .to(
            previous.querySelector("[data-card]"),
            {
              y: -16,
              autoAlpha: 0,
              duration: 0.25,
              ease: "power2.in",
            },
            phaseStart,
          )
          .set(slide, { autoAlpha: 1 }, phaseStart + 0.02)
          .to(
            bgRef.current,
            {
              background: slides[index].tone.background,
              duration: 0.55,
              ease: "power2.inOut",
            },
            phaseStart,
          )
          .fromTo(
            slide.querySelector("[data-text]"),
            { y: 54, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" },
            phaseStart + 0.05,
          )
          .fromTo(
            slide.querySelector("[data-copy]"),
            { y: 20, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.3, ease: "power3.out" },
            phaseStart + 0.12,
          )
          .fromTo(
            slide.querySelector("[data-image]"),
            { y: 52, scale: 1.08, autoAlpha: 0 },
            { y: 0, scale: 1, autoAlpha: 1, duration: 0.55, ease: "power3.out" },
            phaseStart + 0.07,
          )
          .fromTo(
            slide.querySelector("[data-card]"),
            { y: 28, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.35, ease: "power3.out" },
            phaseStart + 0.16,
          );
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const goToSlide = (index: number) => {
    const trigger = ScrollTrigger.getAll().find((entry) => entry.vars.trigger === wrapperRef.current);
    if (!trigger) return;

    const progress = index / (slides.length - 1);
    const target = trigger.start + (trigger.end - trigger.start) * progress;
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  const currentSlide = slides[activeIndex];
  const getSlideImage = (slide: (typeof slides)[number], index: number) => folderImages[index] || slide.fallbackImage;

  return (
    <section
      ref={wrapperRef}
      className="main-wrapper relative overflow-hidden"
      style={{ height: "100dvh" }}
    >
      <div
        ref={bgRef}
        className="absolute inset-0 transition-[background] duration-700"
        style={{ background: slides[0].tone.background }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,14,12,0.72)_0%,rgba(12,14,12,0.22)_46%,rgba(12,14,12,0.1)_100%)]" />
      <div className="absolute inset-y-0 left-[-8rem] w-64 bg-[#ce9f36]/8 blur-3xl" />

      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="flex h-full flex-col justify-between px-4 pb-6 pt-[126px] md:px-8 md:pb-8 md:pt-[150px] lg:px-10">
          <div className="flex items-start justify-between gap-6">
            <div className="rounded-full border border-white/10 bg-black/8 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-white/72 backdrop-blur">
              Next Generation Collection
            </div>
            <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-black/10 px-4 py-2 text-xs text-white/65 backdrop-blur md:flex">
              <span>{currentSlide.id}</span>
              <span className="h-px w-8 bg-[#d7a22c]/70" />
              <span>{slides.length.toString().padStart(2, "0")}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => goToSlide(Math.max(0, activeIndex - 1))}
                className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/14 bg-black/10 text-white/80 backdrop-blur transition-colors hover:bg-white/8"
                aria-label="Previous slide"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => goToSlide(Math.min(slides.length - 1, activeIndex + 1))}
                className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/14 bg-black/10 text-white/80 backdrop-blur transition-colors hover:bg-white/8"
                aria-label="Next slide"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goToSlide(index)}
                  className={`pointer-events-auto h-2.5 rounded-full transition-all ${
                    activeIndex === index ? "w-12 bg-[#d7a22c]" : "w-2.5 bg-white/34 hover:bg-white/55"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
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
            <div className="grid h-full items-center gap-10 px-4 pb-24 pt-[150px] md:px-8 md:pb-14 md:pt-[170px] lg:grid-cols-[0.82fr_1.18fr] lg:px-10">
              <div data-text className="relative z-10 max-w-[620px]">
                <div className="mb-8 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#d7a22c]">
                  <span className="h-px w-10 bg-[#d7a22c]" />
                  {slide.eyebrow}
                </div>
                <h1 className="text-balance font-serif text-[3.4rem] leading-[0.92] tracking-[-0.045em] text-[#f7f1e8] md:text-[5.3rem] lg:text-[7rem]">
                  <span className="block font-normal italic text-[#d7a22c]">{slide.accent}</span>
                  {slide.heading.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h1>
                <div data-copy className="mt-8 max-w-lg space-y-8">
                  <p className="text-sm leading-8 text-white/68 md:text-base">
                    {slide.body}
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="h-14 rounded-sm border-white/20 bg-black/8 px-8 text-base font-semibold text-white hover:bg-white/8"
                  >
                    <Link to={slide.cta}>
                      {slide.ctaLabel}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="relative flex h-full min-h-[420px] items-center justify-center lg:min-h-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_42%)]" />
                <div
                  data-card
                  className="absolute right-[8%] top-[14%] hidden h-[66%] w-[23%] rounded-[28px] border border-white/10 backdrop-blur-[1px] lg:block"
                  style={{ background: slide.tone.card }}
                />
                <div
                  data-card
                  className="absolute right-[22%] top-[10%] hidden h-[72%] w-[24%] rounded-[30px] border border-[#d7a22c]/24 bg-black/14 backdrop-blur-[1px] lg:block"
                />
                <div
                  data-image
                  className="relative flex h-full w-full items-center justify-center overflow-visible"
                >
                  <img
                    src={getSlideImage(slide, index)}
                    alt={slide.imageAlt}
                    className="max-h-[58vh] w-full max-w-[920px] rounded-[24px] object-cover object-center shadow-[0_30px_120px_rgba(0,0,0,0.45)] md:max-h-[62vh] lg:max-h-[72vh]"
                    onError={(event) => {
                      const target = event.currentTarget;
                      if (target.src.includes(slide.fallbackImage)) return;
                      target.src = slide.fallbackImage;
                    }}
                  />
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
