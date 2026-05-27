import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  PromoPlacementKey,
  filterBannersForPlacement,
  normalizePromotionalBanner,
} from "@/lib/promotionalBanners";

type PromotionalBannerSlotProps = {
  placement: PromoPlacementKey;
  pageCategory?: string | null;
  className?: string;
};

const getCountdownParts = (target: string | null, now: number) => {
  if (!target) return [];
  const remaining = Math.max(0, new Date(target).getTime() - now);
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Mins", value: minutes },
    { label: "Secs", value: seconds },
  ];
};

const PromotionalBannerSlot = ({ placement, pageCategory, className }: PromotionalBannerSlotProps) => {
  const [now, setNow] = useState(() => Date.now());
  const { data: banners = [] } = useQuery({
    queryKey: ["active-promotional-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotional_banners")
        .select("*")
        .eq("status", "active")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return ((data || []) as Array<Record<string, unknown>>).map(normalizePromotionalBanner);
    },
  });

  const banner = useMemo(
    () => filterBannersForPlacement(banners, placement, pageCategory)[0],
    [banners, pageCategory, placement],
  );

  useEffect(() => {
    if (!banner?.has_countdown || !banner.countdown_ends_at) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [banner?.countdown_ends_at, banner?.has_countdown, banner?.id]);

  if (!banner) return null;

  const countdownParts = banner.has_countdown ? getCountdownParts(banner.countdown_ends_at, now) : [];
  const ctaHref = banner.cta_href || "/categories";
  const ctaLabel = banner.cta_label || "Shop the offer";
  const isExternal = /^(https?:|mailto:|tel:)/i.test(ctaHref);
  const ctaClassName = "inline-flex min-h-12 items-center justify-center gap-2 border border-[rgb(var(--white-rgb)/0.42)] bg-[rgb(var(--white-rgb)/0.12)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-[rgb(var(--white-rgb)/0.2)]";

  const cta = isExternal ? (
    <a href={ctaHref} target="_blank" rel="noreferrer" className={ctaClassName}>
      {ctaLabel}
      <ArrowRight size={16} />
    </a>
  ) : (
    <Link to={ctaHref} className={ctaClassName}>
      {ctaLabel}
      <ArrowRight size={16} />
    </Link>
  );

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden border-y border-grid/35 bg-[linear-gradient(120deg,rgb(var(--primary)/0.98)_0%,rgb(var(--heritage-rgb)/0.98)_70%,rgb(var(--interactive-rgb)/0.86)_100%)] text-primary-foreground",
        className,
      )}
    >
      {banner.background_image_url && (
        <img
          src={banner.background_image_url}
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          loading="lazy"
        />
      )}
      <div
        className={cn(
          "absolute inset-0 -z-10",
          banner.background_image_url
            ? "bg-[linear-gradient(90deg,rgb(var(--obsidian-rgb)/0.82)_0%,rgb(var(--obsidian-rgb)/0.62)_50%,rgb(var(--heritage-rgb)/0.5)_100%)]"
            : "bg-[linear-gradient(90deg,rgb(var(--obsidian-rgb)/0.22)_0%,transparent_68%)]",
        )}
      />
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-[rgb(var(--white-rgb)/0.24)]" />

      <div className="container mx-auto grid gap-6 px-10 py-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:py-8">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="border border-[rgb(var(--white-rgb)/0.26)] bg-[rgb(var(--white-rgb)/0.1)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em]">
              {banner.category}
            </span>
            {banner.has_countdown && countdownParts.length > 0 && (
              <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary-foreground/82">
                <Clock size={14} />
                Limited window
              </span>
            )}
          </div>
          <h2 className="mt-4 font-serif text-3xl leading-tight tracking-[-0.03em] md:text-4xl">
            {banner.title}
          </h2>
          {banner.subtitle && (
            <p className="mt-3 max-w-3xl text-sm leading-7 text-primary-foreground/82 md:text-base">
              {banner.subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-5 md:min-w-[330px] md:items-end">
          {countdownParts.length > 0 && (
            <div className="grid w-full grid-cols-4 border border-[rgb(var(--white-rgb)/0.2)] bg-[rgb(var(--obsidian-rgb)/0.16)] md:w-[330px]">
              {countdownParts.map((part) => (
                <div key={part.label} className="border-r border-[rgb(var(--white-rgb)/0.16)] px-3 py-3 text-center last:border-r-0">
                  <div className="font-serif text-2xl leading-none">{String(part.value).padStart(2, "0")}</div>
                  <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-primary-foreground/72">{part.label}</div>
                </div>
              ))}
            </div>
          )}
          {cta}
        </div>
      </div>
    </section>
  );
};

export default PromotionalBannerSlot;
