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

const HERO_AUTOPLAY_MS = 6800;
const HERO_PROGRESS_SECONDS = HERO_AUTOPLAY_MS / 1000;
const HERO_BREAKAWAY_COLUMNS = 7;
const HERO_BREAKAWAY_ROWS = 5;

const heroBreakawayTiles = Array.from(
  { length: HERO_BREAKAWAY_COLUMNS * HERO_BREAKAWAY_ROWS },
  (_, index) => {
    const column = index % HERO_BREAKAWAY_COLUMNS;
    const row = Math.floor(index / HERO_BREAKAWAY_COLUMNS);
    const left = (column / HERO_BREAKAWAY_COLUMNS) * 100;
    const right = 100 - ((column + 1) / HERO_BREAKAWAY_COLUMNS) * 100;
    const top = (row / HERO_BREAKAWAY_ROWS) * 100;
    const bottom = 100 - ((row + 1) / HERO_BREAKAWAY_ROWS) * 100;

    return {
      index,
      column,
      row,
      clipPath: `inset(${Math.max(0, top - 0.08)}% ${Math.max(0, right - 0.08)}% ${Math.max(0, bottom - 0.08)}% ${Math.max(0, left - 0.08)}%)`,
    };
  },
);

const getSlideParts = (slide: HTMLDivElement) => ({
  image: slide.querySelector("[data-hero-image]"),
  imageImg: slide.querySelector("[data-hero-image-img]"),
  sheen: slide.querySelector("[data-hero-sheen]"),
  kicker: slide.querySelector("[data-hero-kicker]"),
  lines: gsap.utils.toArray<HTMLElement>(slide.querySelectorAll("[data-hero-line]")),
  copy: slide.querySelector("[data-hero-copy]"),
  cta: slide.querySelector("[data-hero-cta]"),
});

const HeroSection = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const slidesRef = useRef<Array<HTMLDivElement | null>>([]);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const breakawayRef = useRef<HTMLDivElement | null>(null);
  const previousIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [folderImages, setFolderImages] = useState<string[]>([]);
  const resolvedImages = useMemo(
    () => slides.map((slide, index) => folderImages[index] || slide.fallbackImage),
    [folderImages],
  );

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

      gsap.set(slideElements, { autoAlpha: 0, zIndex: 0 });
      gsap.set(slideElements[0], { autoAlpha: 1, zIndex: 2 });
      gsap.set(bgRef.current, { background: slides[0].tone.background });

      slideElements.forEach((slide) => {
        const parts = getSlideParts(slide);
        gsap.set(parts.image, {
          clipPath: "inset(0% 0% 0% 100%)",
          scale: 1.03,
          xPercent: 1.5,
          transformOrigin: "50% 50%",
        });
        gsap.set(parts.imageImg, { scale: 1.08, transformOrigin: "50% 50%" });
        gsap.set(parts.sheen, { autoAlpha: 0, xPercent: -130 });
        gsap.set(parts.kicker, { y: 18, autoAlpha: 0 });
        gsap.set(parts.lines, { yPercent: 112, autoAlpha: 1 });
        gsap.set([parts.copy, parts.cta], { y: 24, autoAlpha: 0 });
      });

      if (prefersReducedMotion) {
        slideElements.forEach((slide, index) => {
          const parts = getSlideParts(slide);
          const isActive = index === 0;
          gsap.set(slide, { autoAlpha: isActive ? 1 : 0 });
          gsap.set(parts.image, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, xPercent: 0, autoAlpha: isActive ? 1 : 0 });
          gsap.set(parts.imageImg, { scale: 1 });
          gsap.set(parts.kicker, { y: 0, autoAlpha: isActive ? 1 : 0 });
          gsap.set(parts.lines, { yPercent: 0 });
          gsap.set([parts.copy, parts.cta], { y: 0, autoAlpha: isActive ? 1 : 0 });
        });
        return;
      }

      const intro = slideElements[0];
      const parts = getSlideParts(intro);
      const introTimeline = gsap.timeline({ defaults: { ease: "expo.out" } });

      introTimeline
        .to(parts.image, {
          clipPath: "inset(0% 0% 0% 0%)",
          xPercent: 0,
          scale: 1,
          duration: 1.18,
        }, 0)
        .to(parts.imageImg, {
          scale: 1.025,
          duration: HERO_PROGRESS_SECONDS,
          ease: "none",
        }, 0.1)
        .to(parts.sheen, {
          autoAlpha: 0.85,
          xPercent: 135,
          duration: 0.9,
          ease: "power2.inOut",
        }, 0.08)
        .set(parts.sheen, { autoAlpha: 0 }, 1)
        .to(parts.kicker, {
          y: 0,
          autoAlpha: 1,
          duration: 0.48,
          ease: "power3.out",
        }, 0.32)
        .to(parts.lines, {
          yPercent: 0,
          duration: 0.86,
          stagger: 0.08,
        }, 0.42)
        .to(parts.copy, {
          y: 0,
          autoAlpha: 1,
          duration: 0.52,
          ease: "power3.out",
        }, 0.86)
        .to(parts.cta, {
          y: 0,
          autoAlpha: 1,
          duration: 0.5,
          ease: "power3.out",
        }, 0.96);
    }, wrapperRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const progressFills = gsap.utils.toArray<HTMLElement>(
      wrapperRef.current.querySelectorAll("[data-hero-progress-fill]"),
    );

    gsap.killTweensOf(progressFills);
    gsap.set(progressFills, {
      scaleX: 0,
      transformOrigin: "left center",
    });

    if (progressFills[activeIndex]) {
      gsap.to(progressFills[activeIndex], {
        scaleX: 1,
        duration: prefersReducedMotion ? 0 : HERO_PROGRESS_SECONDS,
        ease: "none",
      });
    }

    return () => {
      gsap.killTweensOf(progressFills);
    };
  }, [activeIndex, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, HERO_AUTOPLAY_MS);

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

    const previousParts = getSlideParts(previous);
    const nextParts = getSlideParts(next);
    const breakawayTiles = gsap.utils.toArray<HTMLElement>(
      breakawayRef.current?.querySelectorAll("[data-hero-breakaway-tile]") || [],
    );

    if (prefersReducedMotion) {
      slideElements.forEach((slide, index) => {
        const parts = getSlideParts(slide);
        const isActive = index === activeIndex;
        gsap.set(slide, { autoAlpha: isActive ? 1 : 0, zIndex: isActive ? 2 : 0 });
        gsap.set(parts.image, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, xPercent: 0, autoAlpha: isActive ? 1 : 0 });
        gsap.set(parts.imageImg, { scale: 1 });
        gsap.set(parts.kicker, { y: 0, autoAlpha: isActive ? 1 : 0 });
        gsap.set(parts.lines, { yPercent: 0 });
        gsap.set([parts.copy, parts.cta], { y: 0, autoAlpha: isActive ? 1 : 0 });
      });
      gsap.set(bgRef.current, { background: slides[activeIndex].tone.background });
      gsap.set(breakawayTiles, { autoAlpha: 0 });
      previousIndexRef.current = activeIndex;
      return;
    }

    if (breakawayRef.current) {
      breakawayRef.current.style.setProperty("--hero-breakaway-image", `url("${resolvedImages[previousIndex]}")`);
    }

    const transition = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        gsap.set(previous, { autoAlpha: 0, zIndex: 0 });
        gsap.set(breakawayTiles, {
          autoAlpha: 0,
          clearProps: "transform,filter",
        });
        previousIndexRef.current = activeIndex;
      },
    });

    gsap.killTweensOf([
      previousParts.image,
      previousParts.imageImg,
      previousParts.kicker,
      ...previousParts.lines,
      previousParts.copy,
      previousParts.cta,
      nextParts.image,
      nextParts.imageImg,
      nextParts.kicker,
      ...nextParts.lines,
      nextParts.copy,
      nextParts.cta,
      ...breakawayTiles,
    ]);

    transition
      .set(previous, { zIndex: 1 }, 0)
      .set(next, { autoAlpha: 1, zIndex: 2 }, 0)
      .set(breakawayTiles, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        z: 0,
        scale: 1,
        rotate: 0,
        rotationX: 0,
        rotationY: 0,
        filter: "blur(0px)",
        transformPerspective: 900,
        transformOrigin: "50% 50%",
      }, 0)
      .set(nextParts.image, {
        autoAlpha: 1,
        clipPath: "inset(0% 0% 0% 0%)",
        scale: 1,
        xPercent: 0,
      }, 0)
      .set(nextParts.imageImg, { scale: 1.065 }, 0)
      .set(nextParts.sheen, { autoAlpha: 0, xPercent: -130 }, 0)
      .set(nextParts.kicker, { y: 18, autoAlpha: 0 }, 0)
      .set(nextParts.lines, { yPercent: 112, autoAlpha: 1 }, 0)
      .set([nextParts.copy, nextParts.cta], { y: 24, autoAlpha: 0 }, 0)
      .to(bgRef.current, {
        background: slides[activeIndex].tone.background,
        duration: 0.9,
        ease: "power2.inOut",
      }, 0)
      .to(previousParts.kicker, {
        y: -16,
        autoAlpha: 0,
        duration: 0.34,
        ease: "power2.in",
      }, 0)
      .to(previousParts.lines, {
        yPercent: -112,
        duration: 0.48,
        stagger: 0.035,
        ease: "power3.in",
      }, 0.02)
      .to([previousParts.copy, previousParts.cta], {
        y: -18,
        autoAlpha: 0,
        duration: 0.34,
        stagger: 0.04,
        ease: "power2.in",
      }, 0.05)
      .to(previousParts.image, {
        scale: 1.012,
        autoAlpha: 0,
        duration: 0.22,
        ease: "power2.out",
      }, 0.12)
      .to(breakawayTiles, {
        x: (index) => {
          const column = index % HERO_BREAKAWAY_COLUMNS;
          const columnProgress = column / Math.max(1, HERO_BREAKAWAY_COLUMNS - 1);
          const drift = column % 2 === 0 ? -24 : 24;
          return (columnProgress - 0.5) * 460 + drift;
        },
        y: (index) => {
          const row = Math.floor(index / HERO_BREAKAWAY_COLUMNS);
          const rowProgress = row / Math.max(1, HERO_BREAKAWAY_ROWS - 1);
          const lift = row % 2 === 0 ? -36 : 34;
          return (rowProgress - 0.5) * 330 + lift;
        },
        z: (index) => 90 + ((index * 31) % 130),
        rotationX: (index) => {
          const row = Math.floor(index / HERO_BREAKAWAY_COLUMNS);
          return (row - (HERO_BREAKAWAY_ROWS - 1) / 2) * -9;
        },
        rotationY: (index) => {
          const column = index % HERO_BREAKAWAY_COLUMNS;
          return (column - (HERO_BREAKAWAY_COLUMNS - 1) / 2) * 8;
        },
        rotate: (index) => ((index * 17) % 23) - 11,
        scale: (index) => (index % 3 === 0 ? 0.94 : 1.04),
        autoAlpha: 0,
        filter: "blur(1.4px)",
        duration: 1.06,
        ease: "expo.inOut",
        stagger: {
          grid: [HERO_BREAKAWAY_ROWS, HERO_BREAKAWAY_COLUMNS],
          from: "center",
          each: 0.018,
        },
      }, 0.1)
      .to(nextParts.imageImg, {
        scale: 1.025,
        duration: HERO_PROGRESS_SECONDS,
        ease: "none",
      }, 0.16)
      .to(nextParts.sheen, {
        autoAlpha: 0.85,
        xPercent: 135,
        duration: 0.9,
        ease: "power2.inOut",
      }, 0.38)
      .set(nextParts.sheen, { autoAlpha: 0 }, 1.26)
      .to(nextParts.kicker, {
        y: 0,
        autoAlpha: 1,
        duration: 0.46,
        ease: "power3.out",
      }, 0.5)
      .to(nextParts.lines, {
        yPercent: 0,
        duration: 0.84,
        stagger: 0.07,
        ease: "expo.out",
      }, 0.58)
      .to(nextParts.copy, {
        y: 0,
        autoAlpha: 1,
        duration: 0.48,
        ease: "power3.out",
      }, 0.94)
      .to(nextParts.cta, {
        y: 0,
        autoAlpha: 1,
        duration: 0.46,
        ease: "power3.out",
      }, 1.04);

    return () => {
      transition.kill();
    };
  }, [activeIndex, prefersReducedMotion, resolvedImages]);

  const currentSlide = slides[activeIndex];

  return (
    <section
      ref={wrapperRef}
      className="main-wrapper relative mb-6 mt-[120px] h-[calc(100dvh-120px)] min-h-[900px] overflow-hidden lg:mt-[170px] lg:h-[calc(100dvh-170px)]"
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
                className={`relative h-[3px] overflow-hidden transition-all ${
                  activeIndex === index
                    ? "w-16 bg-primary-foreground/24"
                    : "w-7 bg-primary-foreground/16"
                }`}
                aria-hidden="true"
              >
                <span
                  data-hero-progress-fill
                  className="absolute inset-y-0 left-0 w-full origin-left scale-x-0 bg-interactive"
                />
              </span>
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
            <div data-hero-image className="absolute inset-0 overflow-hidden will-change-transform">
              <img
                data-hero-image-img
                src={resolvedImages[index]}
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
              <div
                data-hero-sheen
                className="absolute inset-y-0 left-[-32%] w-[42%] bg-[linear-gradient(90deg,transparent_0%,rgb(var(--white-rgb)/0.22)_48%,transparent_100%)] mix-blend-screen"
              />
            </div>

            <div className="relative z-10 flex h-full items-center">
              <div className="container mx-auto flex h-full items-center py-6">
                <div data-text className="max-w-[780px]">
                  <div data-hero-kicker className="mb-8 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.28em] text-primary-foreground/72">
                    <span className="h-px w-10 bg-interactive" />
                    {slide.eyebrow}
                  </div>
                  <h1 className="text-balance font-serif text-[3.4rem] leading-[0.92] tracking-[-0.045em] text-primary-foreground md:text-[5.3rem] lg:text-[7rem]">
                    <span className="block overflow-hidden pb-1">
                      <span data-hero-line className="block font-normal italic text-interactive">
                        {slide.accent}
                      </span>
                    </span>
                    {slide.heading.map((line) => (
                      <span key={line} className="block overflow-hidden pb-1">
                        <span data-hero-line className="block">
                          {line}
                        </span>
                      </span>
                    ))}
                  </h1>
                  <div className="mt-10 max-w-xl space-y-10">
                    <p data-hero-copy className="text-base leading-8 text-white md:text-[1.06rem]">
                      {slide.body}
                    </p>
                    <Button
                      asChild
                      className="h-14 rounded-none border-0 bg-primary px-8 font-mono text-[11px] uppercase tracking-[0.22em] text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-0"
                    >
                      <Link data-hero-cta to={slide.cta}>
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

        <div
          ref={breakawayRef}
          data-hero-breakaway
          className="pointer-events-none absolute inset-0 z-[12] overflow-hidden [perspective:900px]"
          aria-hidden="true"
        >
          {heroBreakawayTiles.map((tile) => (
            <div
              key={tile.index}
              data-hero-breakaway-tile
              data-column={tile.column}
              data-row={tile.row}
              className="absolute inset-0 opacity-0 will-change-transform"
              style={{
                clipPath: tile.clipPath,
                backgroundImage: "var(--hero-breakaway-image)",
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
