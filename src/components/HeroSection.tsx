import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { normalizeHeroSlides, type HeroSlide } from "@/lib/heroSlides";
import { gsap } from "gsap";

const HERO_AUTOPLAY_MS = 6800;
const HERO_PROGRESS_SECONDS = HERO_AUTOPLAY_MS / 1000;
const HERO_WIPE_COLUMNS = 9;
const HERO_WIPE_ROWS = 6;

const getHeroWipeExitDelay = (index: number) => {
  const column = index % HERO_WIPE_COLUMNS;
  const row = Math.floor(index / HERO_WIPE_COLUMNS);
  const bottomLeftWave = HERO_WIPE_ROWS - 1 - row + column;

  return bottomLeftWave * 0.028 + column * 0.002;
};

const getHeroWipeTravel = (wrapper: HTMLElement | null) => {
  const bounds = wrapper?.getBoundingClientRect();
  const width = bounds?.width || (typeof window !== "undefined" ? window.innerWidth : 1200);
  const height = bounds?.height || (typeof window !== "undefined" ? window.innerHeight : 720);

  return {
    x: width * 1.16,
    y: height * 1.16,
  };
};

const heroWipeTiles = Array.from(
  { length: HERO_WIPE_COLUMNS * HERO_WIPE_ROWS },
  (_, index) => {
    const column = index % HERO_WIPE_COLUMNS;
    const row = Math.floor(index / HERO_WIPE_COLUMNS);
    const cellWidth = 100 / HERO_WIPE_COLUMNS;
    const cellHeight = 100 / HERO_WIPE_ROWS;

    return {
      index,
      column,
      row,
      left: `${column * cellWidth}%`,
      top: `${row * cellHeight}%`,
      width: `${cellWidth}%`,
      height: `${cellHeight}%`,
      background:
        (row + column) % 3 === 0
          ? "rgb(var(--surface-elevated-rgb) / 0.98)"
          : (row + column) % 2 === 0
            ? "rgb(var(--surface-soft-rgb) / 0.98)"
            : "rgb(var(--surface-rgb) / 0.98)",
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
  const wipeRef = useRef<HTMLDivElement | null>(null);
  const previousIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const slidesDataRef = useRef<HeroSlide[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const { data: slides = [], isLoading } = useQuery({
    queryKey: ["active-hero-slides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("status", "active")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return normalizeHeroSlides((data || []) as Array<Record<string, unknown>>);
    },
  });

  const resolvedImages = useMemo(
    () => slides.map((slide) => slide.imageUrl || slide.fallbackImage),
    [slides],
  );

  const prefersReducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    slidesDataRef.current = slides;
  }, [slides]);

  useEffect(() => {
    if (!slides.length) return;
    if (previousIndexRef.current >= slides.length) previousIndexRef.current = 0;
    if (activeIndex < slides.length) return;
    previousIndexRef.current = 0;
    setActiveIndex(0);
  }, [activeIndex, slides.length]);

  useEffect(() => {
    if (!wrapperRef.current || !slides.length) return;

    const ctx = gsap.context(() => {
      const slideElements = slidesRef.current.filter(Boolean) as HTMLDivElement[];
      const wipePanel = wrapperRef.current?.querySelector("[data-hero-wipe-panel]");
      const wipeTiles = gsap.utils.toArray<HTMLElement>(
        wrapperRef.current?.querySelectorAll("[data-hero-wipe-tile]") || [],
      );
      const wipeTargets = wipePanel ? [wipePanel, ...wipeTiles] : wipeTiles;
      if (!slideElements.length) return;

      const wipeTravel = getHeroWipeTravel(wrapperRef.current);

      gsap.set(slideElements, { autoAlpha: 0, zIndex: 0 });
      gsap.set(slideElements[0], { autoAlpha: 1, zIndex: 2 });
      gsap.set(bgRef.current, { background: slidesDataRef.current[0]?.tone.background });
      gsap.set(wipeTiles, {
        autoAlpha: 0,
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        transformOrigin: "50% 50%",
      });
      gsap.set(wipePanel, {
        autoAlpha: 0,
        x: -wipeTravel.x,
        y: wipeTravel.y,
        transformOrigin: "50% 50%",
      });

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
        gsap.set(parts.kicker, { x: -12, y: 26, autoAlpha: 0, filter: "blur(6px)" });
        gsap.set(parts.lines, {
          yPercent: 118,
          rotationX: 14,
          skewY: 3,
          autoAlpha: 1,
          transformPerspective: 900,
          transformOrigin: "0% 100%",
        });
        gsap.set([parts.copy, parts.cta], { y: 30, autoAlpha: 0, filter: "blur(8px)" });
      });

      if (prefersReducedMotion) {
        slideElements.forEach((slide, index) => {
          const parts = getSlideParts(slide);
          const isActive = index === 0;
          gsap.set(slide, { autoAlpha: isActive ? 1 : 0 });
          gsap.set(parts.image, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, xPercent: 0, autoAlpha: isActive ? 1 : 0 });
          gsap.set(parts.imageImg, { scale: 1 });
          gsap.set(parts.kicker, { x: 0, y: 0, autoAlpha: isActive ? 1 : 0, filter: "blur(0px)" });
          gsap.set(parts.lines, { yPercent: 0, rotationX: 0, skewY: 0 });
          gsap.set([parts.copy, parts.cta], { y: 0, autoAlpha: isActive ? 1 : 0, filter: "blur(0px)" });
        });
        gsap.set(wipeTargets, { autoAlpha: 0 });
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
          x: 0,
          y: 0,
          autoAlpha: 1,
          filter: "blur(0px)",
          duration: 0.58,
        }, 0.32)
        .to(parts.lines, {
          yPercent: 0,
          rotationX: 0,
          skewY: 0,
          duration: 0.98,
          stagger: 0.075,
        }, 0.42)
        .to(parts.copy, {
          y: 0,
          autoAlpha: 1,
          filter: "blur(0px)",
          duration: 0.62,
        }, 0.86)
        .to(parts.cta, {
          y: 0,
          autoAlpha: 1,
          filter: "blur(0px)",
          duration: 0.56,
        }, 0.96);
    }, wrapperRef);

    return () => ctx.revert();
  }, [prefersReducedMotion, slides.length]);

  useEffect(() => {
    if (!wrapperRef.current || !slides.length) return;

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
  }, [activeIndex, prefersReducedMotion, slides.length]);

  useEffect(() => {
    if (prefersReducedMotion || slides.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => {
        if (isTransitioningRef.current) return current;
        return (current + 1) % slides.length;
      });
    }, HERO_AUTOPLAY_MS);

    return () => window.clearInterval(interval);
  }, [prefersReducedMotion, slides.length]);

  useEffect(() => {
    if (!slides.length) return;
    const slideElements = slidesRef.current.filter(Boolean) as HTMLDivElement[];
    if (!slideElements.length) return;

    const previousIndex = previousIndexRef.current;
    if (previousIndex === activeIndex) return;

    const previous = slideElements[previousIndex];
    const next = slideElements[activeIndex];
    if (!previous || !next) return;

    const previousParts = getSlideParts(previous);
    const nextParts = getSlideParts(next);
    const activeSlideTone =
      slidesDataRef.current[activeIndex]?.tone.background ||
      slidesDataRef.current[0]?.tone.background;
    const wipePanel = wipeRef.current?.querySelector("[data-hero-wipe-panel]");
    const wipeTiles = gsap.utils.toArray<HTMLElement>(
      wipeRef.current?.querySelectorAll("[data-hero-wipe-tile]") || [],
    );
    const wipeTargets = wipePanel ? [wipePanel, ...wipeTiles] : wipeTiles;

    if (prefersReducedMotion) {
      slideElements.forEach((slide, index) => {
        const parts = getSlideParts(slide);
        const isActive = index === activeIndex;
        gsap.set(slide, { autoAlpha: isActive ? 1 : 0, zIndex: isActive ? 2 : 0 });
        gsap.set(parts.image, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, xPercent: 0, autoAlpha: isActive ? 1 : 0 });
        gsap.set(parts.imageImg, { scale: 1 });
        gsap.set(parts.kicker, { x: 0, y: 0, autoAlpha: isActive ? 1 : 0, filter: "blur(0px)" });
        gsap.set(parts.lines, { yPercent: 0, rotationX: 0, skewY: 0 });
        gsap.set([parts.copy, parts.cta], { y: 0, autoAlpha: isActive ? 1 : 0, filter: "blur(0px)" });
      });
      gsap.set(bgRef.current, { background: activeSlideTone });
      gsap.set(wipeTargets, { autoAlpha: 0 });
      previousIndexRef.current = activeIndex;
      isTransitioningRef.current = false;
      return;
    }

    const wipeTravel = getHeroWipeTravel(wrapperRef.current);
    isTransitioningRef.current = true;

    const transition = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        slideElements.forEach((slide, index) => {
          gsap.set(slide, {
            autoAlpha: index === activeIndex ? 1 : 0,
            zIndex: index === activeIndex ? 2 : 0,
          });
        });
        gsap.set(wipeTargets, {
          autoAlpha: 0,
          clearProps: "transform,filter",
        });
        previousIndexRef.current = activeIndex;
        isTransitioningRef.current = false;
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
      ...(wipePanel ? [wipePanel] : []),
      ...wipeTiles,
    ]);

    transition
      .set(slideElements.filter((_, index) => index !== previousIndex && index !== activeIndex), {
        autoAlpha: 0,
        zIndex: 0,
      }, 0)
      .set(previous, { autoAlpha: 1, zIndex: 2 }, 0)
      .set(next, { autoAlpha: 1, zIndex: 1 }, 0)
      .set(wipePanel, {
        autoAlpha: 1,
        x: -wipeTravel.x,
        y: wipeTravel.y,
        scale: 1,
        rotate: 0,
        filter: "blur(0px)",
        transformOrigin: "50% 50%",
      }, 0)
      .set(wipeTiles, {
        autoAlpha: 0,
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
        filter: "blur(0px)",
        transformOrigin: "50% 50%",
      }, 0)
      .set(nextParts.image, {
        autoAlpha: 1,
        clipPath: "inset(0% 0% 0% 0%)",
        scale: 1,
        xPercent: 0,
      }, 0)
      .set(nextParts.imageImg, { scale: 1.095 }, 0)
      .set(nextParts.sheen, { autoAlpha: 0, xPercent: -130 }, 0)
      .set(nextParts.kicker, { x: -14, y: 30, autoAlpha: 0, filter: "blur(7px)" }, 0)
      .set(nextParts.lines, {
        yPercent: 118,
        rotationX: 15,
        skewY: 3,
        autoAlpha: 1,
        transformPerspective: 900,
        transformOrigin: "0% 100%",
      }, 0)
      .set([nextParts.copy, nextParts.cta], { y: 34, autoAlpha: 0, filter: "blur(8px)" }, 0)
      .to(previousParts.kicker, {
        x: 10,
        y: -18,
        autoAlpha: 0,
        filter: "blur(5px)",
        duration: 0.34,
        ease: "power2.in",
      }, 0)
      .to(previousParts.lines, {
        yPercent: -116,
        rotationX: -10,
        skewY: -2,
        duration: 0.5,
        stagger: 0.035,
        ease: "power3.in",
      }, 0.02)
      .to([previousParts.copy, previousParts.cta], {
        y: -22,
        autoAlpha: 0,
        filter: "blur(6px)",
        duration: 0.36,
        stagger: 0.04,
        ease: "power2.in",
      }, 0.05)
      .to(wipePanel, {
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
        duration: 0.62,
        ease: "expo.inOut",
      }, 0.08)
      .to(previousParts.image, {
        scale: 1.018,
        duration: 0.62,
        ease: "power2.inOut",
      }, 0.12)
      .to(bgRef.current, {
        background: activeSlideTone,
        duration: 0.9,
        ease: "power2.inOut",
      }, 0.34)
      .set(previous, { autoAlpha: 0, zIndex: 0 }, 0.82)
      .set(next, { autoAlpha: 1, zIndex: 2 }, 0.82)
      .set(wipeTiles, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
      }, 0.82)
      .set(wipePanel, { autoAlpha: 0 }, 0.84)
      .to(wipeTiles, {
        x: wipeTravel.x,
        y: -wipeTravel.y,
        rotate: 0,
        duration: 0.68,
        ease: "expo.inOut",
        stagger: getHeroWipeExitDelay,
      }, 0.88)
      .set(wipeTiles, { autoAlpha: 0 }, 2.02)
      .to(nextParts.imageImg, {
        scale: 1.025,
        duration: 1.45,
        ease: "expo.out",
      }, 0.82)
      .to(nextParts.sheen, {
        autoAlpha: 0.85,
        xPercent: 135,
        duration: 0.9,
        ease: "power2.inOut",
      }, 1)
      .set(nextParts.sheen, { autoAlpha: 0 }, 1.88)
      .to(nextParts.kicker, {
        x: 0,
        y: 0,
        autoAlpha: 1,
        filter: "blur(0px)",
        duration: 0.62,
        ease: "expo.out",
      }, 0.98)
      .to(nextParts.lines, {
        yPercent: 0,
        rotationX: 0,
        skewY: 0,
        duration: 0.98,
        stagger: 0.075,
        ease: "expo.out",
      }, 1.08)
      .to(nextParts.copy, {
        y: 0,
        autoAlpha: 1,
        filter: "blur(0px)",
        duration: 0.64,
        ease: "power3.out",
      }, 1.34)
      .to(nextParts.cta, {
        y: 0,
        autoAlpha: 1,
        filter: "blur(0px)",
        duration: 0.58,
        ease: "power3.out",
      }, 1.46);

    return () => {
      transition.kill();
      isTransitioningRef.current = false;
    };
  }, [activeIndex, prefersReducedMotion, slides.length]);

  if (isLoading || !slides.length) return null;

  return (
    <section
      ref={wrapperRef}
      className="main-wrapper relative mb-6 mt-[120px] h-[calc(100dvh-120px)] min-h-[620px] overflow-hidden text-white lg:mt-[170px] lg:h-[calc(100dvh-170px)] lg:min-h-0"
    >
      <div
        ref={bgRef}
        className="absolute inset-0 transition-[background] duration-700"
        style={{ background: slides[0].tone.background }}
      />

      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="container mx-auto flex h-full flex-col justify-between py-6">
          <div className="flex items-start justify-between gap-6">
            <div className="bg-background/18 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.3em] text-white backdrop-blur-md">
              Where Executive Precision Meets Living Comfort
            </div>
            <div className="hidden items-center gap-3 bg-background/18 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.26em] text-white backdrop-blur-md md:flex">
              <span data-hero-active-number>{String(activeIndex + 1).padStart(2, "0")}</span>
              <span className="h-px w-8 bg-interactive/70" />
              <span data-hero-total-number>{slides.length.toString().padStart(2, "0")}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            {slides.map((slide, index) => (
              <span
                key={slide.id}
                className={`relative h-[3px] overflow-hidden transition-all ${
                  activeIndex === index
                    ? "w-16 bg-white/24"
                    : "w-7 bg-white/16"
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

            <div className="relative z-10 flex h-full items-end">
              <div className="container mx-auto flex h-full items-end pb-12 pt-28 md:pb-14 lg:pb-8 xl:pb-8 2xl:pb-12">
                <div data-text className="max-w-[700px] pb-3">
                  <div data-hero-kicker className="mb-4 flex items-center gap-4 font-mono text-[9px] uppercase tracking-[0.26em] text-white/72 md:text-[10px]">
                    <span className="h-px w-10 bg-interactive" />
                    {slide.eyebrow}
                  </div>
                  <h1 className="text-balance font-serif text-[2.45rem] leading-[0.96] tracking-[-0.028em] text-white drop-shadow-[0_18px_45px_rgb(0_0_0/0.26)] md:text-[3.75rem] lg:text-[4.2rem] xl:text-[4.65rem] 2xl:text-[5.55rem]">
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
                  <div className="mt-5 max-w-[500px] space-y-5">
                    <p data-hero-copy className="text-[0.88rem] leading-6 text-white/90 md:text-[0.95rem]">
                      {slide.body}
                    </p>
                    <Button
                      asChild
                      className="h-12 rounded-none border-0 bg-primary px-6 font-mono text-[10px] uppercase tracking-[0.2em] text-white hover:bg-primary/90 hover:text-white focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-0 md:h-[52px] md:px-7"
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
          ref={wipeRef}
          data-hero-wipe
          className="pointer-events-none absolute inset-0 z-[30] overflow-hidden"
          aria-hidden="true"
        >
          <div
            data-hero-wipe-panel
            className="absolute inset-0 opacity-0 will-change-transform"
            style={{ background: "rgb(var(--surface-rgb) / 0.99)" }}
          />
          {heroWipeTiles.map((tile) => (
            <div
              key={tile.index}
              data-hero-wipe-tile
              data-column={tile.column}
              data-row={tile.row}
              className="absolute opacity-0 shadow-[0_20px_70px_rgb(0_0_0/0.08)] will-change-transform"
              style={{
                left: tile.left,
                top: tile.top,
                width: tile.width,
                height: tile.height,
                background: tile.background,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
