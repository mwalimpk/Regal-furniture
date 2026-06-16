import { describe, expect, it } from "vitest";
import { normalizeFeaturedList, normalizeProductCategory } from "@/lib/productCategories";

describe("productCategories", () => {
  it("keeps featured items optional when category features are empty", () => {
    const category = normalizeProductCategory({
      id: "chairs",
      name: "Chairs",
      slug: "chairs",
      image_url: "/uploads/categories/chairs.jpg",
      features: [],
    });

    expect(category.featured).toEqual([]);
    expect(category.features).toEqual([]);
  });

  it("does not turn empty featured rows into image cards", () => {
    const featured = normalizeFeaturedList([
      { id: "empty", name: "", slug: "", image_url: "" },
      { id: "image-only", image_url: "/uploads/categories/featured.jpg" },
    ], "/uploads/categories/category.jpg");

    expect(featured).toEqual([]);
  });
});
