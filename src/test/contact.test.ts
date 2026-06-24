import { describe, expect, it } from "vitest";
import {
  buildWhatsAppCallLink,
  buildWhatsAppLink,
  getOrderBranchOptions,
  SALES_WHATSAPP_NUMBERS,
} from "@/lib/contact";

describe("warehouse-aware WhatsApp ordering", () => {
  it("routes single-warehouse carts directly to that branch", () => {
    expect(getOrderBranchOptions(["Harare", "Harare"])).toEqual(["Harare"]);
    expect(getOrderBranchOptions(["Bulawayo"])).toEqual(["Bulawayo"]);
  });

  it("uses the only branch capable of fulfilling products combined with Both", () => {
    expect(getOrderBranchOptions(["Both", "Harare"])).toEqual(["Harare"]);
    expect(getOrderBranchOptions(["Both", "Bulawayo"])).toEqual(["Bulawayo"]);
  });

  it("offers both branches for dual-location or mixed-warehouse carts", () => {
    expect(getOrderBranchOptions(["Both"])).toEqual(["Harare", "Bulawayo"]);
    expect(getOrderBranchOptions(["Harare", "Bulawayo"])).toEqual(["Harare", "Bulawayo"]);
  });

  it("builds the WhatsApp link with the selected branch number", () => {
    expect(buildWhatsAppLink("Order", SALES_WHATSAPP_NUMBERS.Bulawayo)).toContain(
      `wa.me/${SALES_WHATSAPP_NUMBERS.Bulawayo}`,
    );
  });

  it("builds an official WhatsApp call link with a sanitized number", () => {
    expect(buildWhatsAppCallLink("+263 780 472 180")).toBe("https://wa.me/call/263780472180");
  });
});
