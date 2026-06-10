import { describe, it, expect } from "vitest";
import {
  buildFlipInventoryNotes,
  buildInventoryPrefillFromFlipListing,
  buildInventoryPrefillFromListing,
  buildInventoryPrefillFromWatchlist,
  buildListingNotes,
  buildWatchlistInventoryNotes,
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

  it("buildInventoryPrefillFromFlipListing maps flip listing fields", () => {
    const prefill = buildInventoryPrefillFromFlipListing(
      {
        title: "RTX 3060",
        platform: "kleinanzeigen",
        price: 150,
        url: "https://example.de/1",
        condition: "Gebraucht",
        description: "OVP",
      },
      {
        todayIsoDate: () => "2026-06-10",
        normalizePlatform: (v) =>
          v === "kleinanzeigen" ? "kleinanzeigen" : null,
        savedFlipAnalysisId: 4,
      },
    );
    expect(prefill.title).toBe("RTX 3060");
    expect(prefill.buy_price).toBe(150);
    expect(prefill.buy_platform).toBe("kleinanzeigen");
    expect(prefill.notes).toContain("Flipping-Analyse #4");
  });

  it("buildFlipInventoryNotes includes url and analysis id", () => {
    const notes = buildFlipInventoryNotes(
      {
        url: "https://example.de/1",
        condition: "Neu",
        description: "Test",
      },
      { savedFlipAnalysisId: 2 },
    );
    expect(notes).toContain("https://example.de/1");
    expect(notes).toContain("Flipping-Analyse #2");
  });

  it("buildInventoryPrefillFromWatchlist maps watchlist fields", () => {
    const prefill = buildInventoryPrefillFromWatchlist(
      {
        title: "GPU Deal",
        url: "https://example.de/gpu",
        target_price: 120,
        current_price: 99,
        last_scraped: "2026-06-10T10:00:00Z",
      },
      { todayIsoDate: () => "2026-06-10" },
    );
    expect(prefill.title).toBe("GPU Deal");
    expect(prefill.buy_price).toBe(99);
    expect(prefill.notes).toContain("Zielpreis:");
    expect(prefill.notes).toContain("https://example.de/gpu");
  });
});
