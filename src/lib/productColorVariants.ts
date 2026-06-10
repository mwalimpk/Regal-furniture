export type ProductColorVariant = {
  id: string;
  name: string;
  hex: string;
  images: string[];
};

export const PRODUCT_COLOR_OPTIONS = [
  { name: "Black", hex: "#111111" },
  { name: "White", hex: "#f8f8f4" },
  { name: "Grey", hex: "#858585" },
  { name: "Brown", hex: "#6f4e37" },
  { name: "Oak", hex: "#c59b63" },
  { name: "Walnut", hex: "#7a4c2f" },
  { name: "Mahogany", hex: "#5d2118" },
  { name: "Beige", hex: "#d8c7ad" },
  { name: "Blue", hex: "#1f5f99" },
  { name: "Green", hex: "#486747" },
  { name: "Red", hex: "#a32626" },
  { name: "Custom", hex: "#777777" },
] as const;

const normalizeImageList = (value: unknown) => {
  if (Array.isArray(value)) return value.map(String).map((image) => image.trim()).filter(Boolean);
  if (typeof value === "string") {
    return value.split("|").map((image) => image.trim()).filter(Boolean);
  }
  return [];
};

export const normalizeColorVariants = (value: unknown): ProductColorVariant[] => {
  let source = value;

  if (typeof source === "string") {
    try {
      source = JSON.parse(source);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(source)) return [];

  return source
    .map((item, index) => {
      const record = item && typeof item === "object" ? item as Record<string, unknown> : {};
      const name = String(record.name || "").trim();
      const hex = String(record.hex || PRODUCT_COLOR_OPTIONS[index % PRODUCT_COLOR_OPTIONS.length].hex).trim();
      const images = normalizeImageList(record.images);

      return {
        id: String(record.id || `${name || "color"}-${index + 1}`),
        name,
        hex: /^#[0-9a-f]{6}$/i.test(hex) ? hex : PRODUCT_COLOR_OPTIONS[index % PRODUCT_COLOR_OPTIONS.length].hex,
        images,
      };
    })
    .filter((variant) => variant.name);
};

export const getProductImagesWithColorVariants = (images: string[], colorVariants: ProductColorVariant[]) =>
  Array.from(new Set([...images, ...colorVariants.flatMap((variant) => variant.images)].filter(Boolean)));
