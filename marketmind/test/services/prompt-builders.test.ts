import { describe, it, expect } from "vitest";
import { buildResearchUserPrompt } from "../../server/services/research/prompts";
import { buildFlipUserPrompt } from "../../server/services/flipping/prompts";
import { buildListingUserPrompt } from "../../server/services/listings/prompts";

describe("prompt builders", () => {
  it("buildResearchUserPrompt includes query and platform label", () => {
    const prompt = buildResearchUserPrompt("RTX 3060", "ebay", [
      { title: "Test", price: 100 },
    ]);
    expect(prompt).toContain("RTX 3060");
    expect(prompt).toContain("eBay.de");
    expect(prompt).toContain("Test");
  });

  it("buildFlipUserPrompt includes listing and market data", () => {
    const prompt = buildFlipUserPrompt({
      query: "RTX 3060",
      listing: {
        platform: "ebay",
        url: "https://ebay.de/itm/1",
        title: "MSI RTX 3060",
        price: 149,
        condition: "Gebraucht",
        location: "Berlin",
        category: null,
        description: "Gut",
      },
      marketStats: {
        min: 100,
        max: 200,
        avg: 150,
        median: 150,
        count: 2,
        histogram: [],
        conditionBreakdown: {},
        platformComparison: {},
        demandIndicator: 1,
      },
      marketSamples: [],
    });
    expect(prompt).toContain("Flipping-Potenzial");
    expect(prompt).toContain("MSI RTX 3060");
    expect(prompt).toContain("149,00");
  });

  it("buildListingUserPrompt includes platform hint", () => {
    const prompt = buildListingUserPrompt({
      query: "RTX 3060",
      platform: "kleinanzeigen",
      condition: "Gebraucht",
    });
    expect(prompt).toContain("Kleinanzeigen-Anzeige");
    expect(prompt).toContain("RTX 3060");
  });
});
