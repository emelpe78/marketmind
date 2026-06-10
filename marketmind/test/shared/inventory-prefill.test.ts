import { describe, it, expect } from "vitest";
import {
  buildInventoryPrefillFromListing,
  buildListingNotes,
} from "../../shared/inventory-prefill";

describe("inventory-prefill", () => {
  it("buildListingNotes combines category, keywords and description", () => {
    const notes = buildListingNotes({
      category: "PC",
      keywords: "RTX",
      description: "Gut erhalten",
    });
    expect(notes).toContain("Kategorie: PC");
    expect(notes).toContain("Keywords: RTX");
    expect(notes).toContain("Gut erhalten");
  });

  it("buildInventoryPrefillFromListing maps listing fields", () => {
    const prefill = buildInventoryPrefillFromListing(
      {
        title: "RTX 3060",
        platform: "ebay",
        price_suggestion: 200,
        category: null,
        keywords: null,
        description: "Test",
      },
      {
        todayIsoDate: () => "2026-06-10",
        normalizePlatform: (v) => (v === "ebay" ? "ebay" : null),
      },
    );
    expect(prefill.title).toBe("RTX 3060");
    expect(prefill.sell_price).toBe(200);
    expect(prefill.sell_platform).toBe("ebay");
    expect(prefill.buy_date).toBe("2026-06-10");
  });
});
