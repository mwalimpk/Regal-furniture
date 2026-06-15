import type { StorefrontCategory } from "@/lib/productCategories";

export const CUSTOM_CTA_DESTINATION = "__custom__";

export const DEFAULT_CTA_DESTINATION_OPTIONS = [
  { label: "Collections", href: "/categories" },
  { label: "Catalogue", href: "/catalogue" },
];

export const buildCtaDestinationOptions = (categories: StorefrontCategory[] = []) => [
  ...DEFAULT_CTA_DESTINATION_OPTIONS,
  ...categories.map((category) => ({
    label: category.name,
    href: category.url,
  })),
] as const;

export type CtaDestinationOption = ReturnType<typeof buildCtaDestinationOptions>[number];

export const getCtaDestinationSelectValue = (
  href: string | null | undefined,
  emptyValue = DEFAULT_CTA_DESTINATION_OPTIONS[0].href,
  options: readonly CtaDestinationOption[] = DEFAULT_CTA_DESTINATION_OPTIONS,
) => {
  const trimmed = String(href || "").trim();
  if (!trimmed) return emptyValue;
  return options.some((option) => option.href === trimmed)
    ? trimmed
    : CUSTOM_CTA_DESTINATION;
};

export const getCtaDestinationLabel = (
  href: string | null | undefined,
  options: readonly CtaDestinationOption[] = DEFAULT_CTA_DESTINATION_OPTIONS,
) => {
  const trimmed = String(href || "").trim();
  return options.find((option) => option.href === trimmed)?.label || "Custom link";
};

export const sanitizeCtaHref = (value: string, fallback: string | null = "/categories") => {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(trimmed)) return trimmed;
  return `/${trimmed.replace(/^\/+/, "")}`;
};
