import { describe, expect, it } from "vitest";
import { extractProductSpecificationsFromHtml, mergeProductSpecifications } from "@/lib/productSpecifications";

describe("productSpecifications", () => {
  it("extracts specifications from saved long-description tables", () => {
    const specifications = extractProductSpecificationsFromHtml(`
      <h3>Specifications</h3>
      <table>
        <tbody>
          <tr><th>Materials / finish</th><td>Mahogany veneer</td></tr>
          <tr><th>Dimensions / specs</th><td>1800L x 950W x 800H mm</td></tr>
        </tbody>
      </table>
    `);

    expect(specifications).toEqual([
      { label: "Materials / finish", value: "Mahogany veneer" },
      { label: "Dimensions / specs", value: "1800L x 950W x 800H mm" },
    ]);
  });

  it("lets direct database fields replace stale generated rows", () => {
    const specifications = mergeProductSpecifications([
      { label: "Price", value: "USD" },
      { label: "Warehouse", value: "Harare" },
      { label: "Price", value: "$250" },
      { label: "SKU / Model", value: "B002" },
    ]);

    expect(specifications).toEqual([
      { label: "Price", value: "$250" },
      { label: "Warehouse", value: "Harare" },
      { label: "SKU / Model", value: "B002" },
    ]);
  });
});
