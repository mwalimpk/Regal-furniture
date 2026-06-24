import { describe, expect, it } from "vitest";
import {
  PRODUCT_IMPORT_IGNORE_HEADER,
  analyzeProductCsvHeaders,
  buildProductImportTemplateCsv,
  validateProductCsv,
} from "@/lib/productCsvImport";

describe("productCsvImport", () => {
  it("accepts product form labels as CSV headers", () => {
    const csv = [
      "Product Name,Category,Price,SKU / Model,Warehouse,Long Description,Image URLs,Currency,Featured subcategory",
      '"B002 Executive Desk",Desks,"$1,250",B002,Bulawayo,"<p>Large executive workstation.</p>","/images/desk.jpg|uploads/desk-side.jpg",USD,manager-desk',
    ].join("\n");

    const result = validateProductCsv(
      csv,
      [],
      ["Desks"],
      [{ category: "Desks", slug: "manager-desk" }],
    );

    expect(result.errors).toEqual([]);
    expect(result.interpretations[0]).toMatchObject({
      rawHeader: "Product Name",
      header: "title",
      matchType: "form-label",
    });
    expect(result.headers).toEqual([
      "title",
      "property_type",
      "price",
      "location",
      "city",
      "long_description",
      "images",
      "currency",
      "featured_slug",
    ]);
    expect(result.validRows[0].payload).toMatchObject({
      title: "B002 Executive Desk",
      property_type: "Desks",
      price: 1250,
      location: "B002",
      city: "Bulawayo",
      long_description: "<p>Large executive workstation.</p>",
      currency: "USD",
      featured_slug: "manager-desk",
    });
    expect(result.validRows[0].payload.images).toEqual(["/images/desk.jpg", "uploads/desk-side.jpg"]);
  });

  it("rejects duplicate columns after header matching", () => {
    const csv = [
      "title,Product Name,Category,Price",
      "Desk One,Desk Two,Desks,250",
    ].join("\n");

    const result = validateProductCsv(csv, [], ["Desks"]);

    expect(result.validRows).toEqual([]);
    expect(result.errors[0].message).toContain("Duplicate header(s): title (title, Product Name).");
  });

  it("suggests close matches and imports after manual confirmation", () => {
    const csv = [
      "Prodct Nme,Categ,Prce",
      "Desk One,Desks,250",
    ].join("\n");

    const analysis = analyzeProductCsvHeaders(csv);

    expect(analysis.unresolvedHeaders.map((header) => header.rawHeader)).toEqual(["Prodct Nme", "Categ", "Prce"]);
    expect(analysis.unresolvedHeaders.map((header) => header.suggestedHeader)).toEqual([
      "title",
      "property_type",
      "price",
    ]);

    const result = validateProductCsv(csv, [], ["Desks"], [], {
      headerMappings: {
        "Prodct Nme": "title",
        Categ: "property_type",
        Prce: "price",
      },
    });

    expect(result.errors).toEqual([]);
    expect(result.validRows[0].payload).toMatchObject({
      title: "Desk One",
      property_type: "Desks",
      price: 250,
    });
    expect(result.interpretations.map((header) => header.matchType)).toEqual(["manual", "manual", "manual"]);
  });

  it("allows unrelated columns to be ignored with a summary", () => {
    const csv = [
      "Product Name,Category,Price,Supplier Notes",
      "Desk One,Desks,250,Ships in July",
    ].join("\n");

    const result = validateProductCsv(csv, [], ["Desks"], [], {
      headerMappings: {
        "Supplier Notes": PRODUCT_IMPORT_IGNORE_HEADER,
      },
    });

    expect(result.errors).toEqual([]);
    expect(result.ignoredHeaders).toEqual(["Supplier Notes"]);
    expect(result.interpretations.find((header) => header.rawHeader === "Supplier Notes")).toMatchObject({
      header: null,
      matchType: "ignored",
    });
    expect(result.validRows[0].payload.title).toBe("Desk One");
  });

  it("downloads the import template with form labels", () => {
    expect(buildProductImportTemplateCsv()).toBe(
      "Product Name,Description,Long Description,Category,Featured subcategory,Price,Currency,SKU / Model,Warehouse,Country,Images,Status,Featured,Institutions\n",
    );
  });
});
