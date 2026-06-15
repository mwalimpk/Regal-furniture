export type HeroSlideTone = {
  background: string;
  card: string;
};

export type HeroSlide = {
  id: string;
  eyebrow: string;
  accent: string;
  title: string;
  heading: string[];
  body: string;
  imageUrl: string;
  fallbackImage: string;
  imageAlt: string;
  cta: string;
  ctaLabel: string;
  ctaEnabled: boolean;
  tone: HeroSlideTone;
  displayOrder: number;
};

export type HeroSlideRow = {
  id?: string | number | null;
  eyebrow?: string | null;
  accent_title?: string | null;
  title?: string | null;
  description?: string | null;
  image_url?: string | null;
  image_alt?: string | null;
  cta_label?: string | null;
  cta_href?: string | null;
  cta_enabled?: boolean | number | string | null;
  display_order?: string | number | null;
};

const HERO_TONES: HeroSlideTone[] = [
  {
    background:
      "radial-gradient(circle at 78% 34%, rgb(var(--taupe-rgb) / 0.18), transparent 26%), radial-gradient(circle at 70% 46%, rgb(var(--orange-rgb) / 0.12), transparent 20%), linear-gradient(90deg, rgb(var(--background) / 1) 0%, rgb(var(--card) / 0.96) 46%, rgb(var(--secondary) / 0.94) 100%)",
    card: "rgb(var(--card) / 0.72)",
  },
  {
    background:
      "radial-gradient(circle at 74% 30%, rgb(var(--orange-rgb) / 0.16), transparent 24%), radial-gradient(circle at 82% 52%, rgb(var(--rifle-rgb) / 0.16), transparent 28%), linear-gradient(90deg, rgb(var(--background) / 1) 0%, rgb(var(--card) / 0.96) 46%, rgb(var(--secondary) / 0.92) 100%)",
    card: "rgb(var(--card) / 0.76)",
  },
  {
    background:
      "radial-gradient(circle at 72% 36%, rgb(var(--olive-rgb) / 0.18), transparent 24%), radial-gradient(circle at 84% 18%, rgb(var(--orange-rgb) / 0.12), transparent 18%), linear-gradient(90deg, rgb(var(--background) / 1) 0%, rgb(var(--card) / 0.96) 46%, rgb(var(--secondary) / 0.92) 100%)",
    card: "rgb(var(--card) / 0.78)",
  },
  {
    background:
      "radial-gradient(circle at 80% 34%, rgb(var(--taupe-rgb) / 0.16), transparent 22%), radial-gradient(circle at 73% 46%, rgb(var(--olive-rgb) / 0.16), transparent 26%), linear-gradient(90deg, rgb(var(--background) / 1) 0%, rgb(var(--card) / 0.96) 46%, rgb(var(--secondary) / 0.92) 100%)",
    card: "rgb(var(--card) / 0.78)",
  },
];

const splitHeroTitle = (title: string) => {
  if (/\r?\n/.test(title)) {
    const manualLines = title
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (manualLines.length) return manualLines.slice(0, 3);
  }

  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 2) return [title.trim()].filter(Boolean);

  const midpoint = Math.ceil(words.length / 2);
  return [
    words.slice(0, midpoint).join(" "),
    words.slice(midpoint).join(" "),
  ].filter(Boolean);
};

const parseBoolean = (value: unknown, fallback = true) => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  return String(value).toLowerCase() !== "false" && String(value) !== "0";
};

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: "01",
    eyebrow: "Premium Office Furniture",
    accent: "Crafted",
    title: "for Those Who Lead",
    heading: ["for Those", "Who Lead"],
    body:
      "Exceptional office and home furniture for modern African spaces, where premium craftsmanship meets everyday ambition.",
    imageUrl: "/images/products/green/BIG AND TALL HIGH BACK SWIVEL CHAIR.jpg",
    fallbackImage: "/images/products/green/BIG AND TALL HIGH BACK SWIVEL CHAIR.jpg",
    imageAlt: "Premium executive chair",
    cta: "/categories",
    ctaLabel: "Explore Collection",
    ctaEnabled: true,
    tone: HERO_TONES[0],
    displayOrder: 1,
  },
  {
    id: "02",
    eyebrow: "Workspace Collection",
    accent: "Design",
    title: "Your Perfect Workspace",
    heading: ["Your Perfect", "Workspace"],
    body:
      "From executive desks to open-plan workstations, furniture that transforms how your team works, meets, and creates.",
    imageUrl: "/images/products/green/CARINA L SHAPED DESK OAK.jpg",
    fallbackImage: "/images/products/green/CARINA L SHAPED DESK OAK.jpg",
    imageAlt: "Executive desk workspace",
    cta: "/categories",
    ctaLabel: "Explore Collection",
    ctaEnabled: true,
    tone: HERO_TONES[1],
    displayOrder: 2,
  },
  {
    id: "03",
    eyebrow: "Workspace Solutions",
    accent: "Spaces",
    title: "That Inspire Greatness",
    heading: ["That Inspire", "Greatness"],
    body:
      "Full office fit-outs for hotels, corporations, schools, and developers. One supplier. One vision. Every space.",
    imageUrl: "/images/products/green/DOMINION 4 SEATER WORKSTATION.jpg",
    fallbackImage: "/images/products/green/DOMINION 4 SEATER WORKSTATION.jpg",
    imageAlt: "Office workstation furniture",
    cta: "/catalogue",
    ctaLabel: "Open Catalogue",
    ctaEnabled: true,
    tone: HERO_TONES[2],
    displayOrder: 3,
  },
  {
    id: "04",
    eyebrow: "Hospitality Spaces",
    accent: "Comfort",
    title: "That Welcomes Everyone",
    heading: ["That Welcomes", "Everyone"],
    body:
      "Reception sofas, guest seating, and lounge pieces curated to make commercial interiors feel warm, confident, and complete.",
    imageUrl: "/images/products/green/CHESTERFIELD LEATHER COUCH 3 SEATER.png",
    fallbackImage: "/images/products/green/CHESTERFIELD LEATHER COUCH 3 SEATER.png",
    imageAlt: "Reception lounge sofa",
    cta: "/categories",
    ctaLabel: "Explore Collection",
    ctaEnabled: true,
    tone: HERO_TONES[3],
    displayOrder: 4,
  },
];

export const normalizeHeroSlide = (row: HeroSlideRow, index = 0): HeroSlide => {
  const fallback = DEFAULT_HERO_SLIDES[index % DEFAULT_HERO_SLIDES.length];
  const title = String(row.title || fallback.title);
  const accent = String(row.accent_title || fallback.accent);
  const imageUrl = String(row.image_url || fallback.imageUrl);

  return {
    id: String(row.id || `${index + 1}`.padStart(2, "0")),
    eyebrow: String(row.eyebrow || fallback.eyebrow),
    accent,
    title,
    heading: splitHeroTitle(title),
    body: String(row.description || fallback.body),
    imageUrl,
    fallbackImage: imageUrl || fallback.fallbackImage,
    imageAlt: String(row.image_alt || title || fallback.imageAlt),
    cta: String(row.cta_href || fallback.cta || "/categories"),
    ctaLabel: String(row.cta_label || fallback.ctaLabel || "Explore Collection"),
    ctaEnabled: parseBoolean(row.cta_enabled, fallback.ctaEnabled),
    tone: HERO_TONES[index % HERO_TONES.length],
    displayOrder: Number(row.display_order || index + 1),
  };
};

export const normalizeHeroSlides = (rows: Array<HeroSlideRow & Record<string, unknown>>) =>
  rows.map((row, index) => normalizeHeroSlide(row, index));
