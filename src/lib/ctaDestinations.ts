import { categories } from "@/data/products";

export const CUSTOM_CTA_DESTINATION = "__custom__";

export const CTA_DESTINATION_OPTIONS = [
  { label: "Collections", href: "/categories" },
  { label: "Catalogue", href: "/catalogue" },
  ...categories.map((category) => ({
    label: category.name,
    href: `/category/${category.slug}`,
  })),
] as const;

export const getCtaDestinationSelectValue = (
  href: string | null | undefined,
  emptyValue = CTA_DESTINATION_OPTIONS[0].href,
) => {
  const trimmed = String(href || "").trim();
  if (!trimmed) return emptyValue;
  return CTA_DESTINATION_OPTIONS.some((option) => option.href === trimmed)
    ? trimmed
    : CUSTOM_CTA_DESTINATION;
};

export const getCtaDestinationLabel = (href: string | null | undefined) => {
  const trimmed = String(href || "").trim();
  return CTA_DESTINATION_OPTIONS.find((option) => option.href === trimmed)?.label || "Custom link";
};

export const sanitizeCtaHref = (value: string, fallback: string | null = "/categories") => {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(trimmed)) return trimmed;
  return `/${trimmed.replace(/^\/+/, "")}`;
};
