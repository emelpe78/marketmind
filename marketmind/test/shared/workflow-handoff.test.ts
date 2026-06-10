import { describe, it, expect } from "vitest";
import {
  buildFlipRoute,
  buildListingsPrefillFromFlip,
  buildListingsPrefillFromInventory,
  buildListingsRoute,
  canBuildListingsFromFlipListing,
  parseFlipHandoffQuery,
  parseListingsHandoffQuery,
  researchPlatformToListingPlatform,
  truncateHandoffExtras,
} from "../../shared/workflow-handoff";

describe("workflow-handoff", () => {
  it("maps research platform to listing platform", () => {
    expect(researchPlatformToListingPlatform("both")).toBe("kleinanzeigen");
    expect(researchPlatformToListingPlatform("ebay")).toBe("ebay");
    expect(researchPlatformToListingPlatform("kleinanzeigen")).toBe(
      "kleinanzeigen",
    );
  });

  it("builds flip route with encoded url", () => {
    const route = buildFlipRoute(
      "https://www.kleinanzeigen.de/s-anzeige/test/123",
    );
    expect(route).toContain("/flipping?");
    expect(route).toContain("from=watchlist");
    expect(route).toContain(encodeURIComponent("kleinanzeigen.de"));
  });

  it("builds listings route with optional ids", () => {
    const route = buildListingsRoute({
      q: "RTX 3060",
      platform: "both",
      searchId: 5,
      savedResearchId: 2,
      from: "research",
      desiredPrice: 199,
    });
    expect(route).toContain("q=RTX+3060");
    expect(route).toContain("platform=kleinanzeigen");
    expect(route).toContain("searchId=5");
    expect(route).toContain("savedResearchId=2");
    expect(route).toContain("from=research");
    expect(route).toContain("desiredPrice=199");
  });

  it("parses listings handoff query", () => {
    const parsed = parseListingsHandoffQuery({
      q: "GTX 1080",
      platform: "ebay",
      searchId: "3",
      savedFlipAnalysisId: "7",
      condition: "Gebraucht",
      desiredPrice: "220",
      extras: "OVP",
      from: "flip-saved",
    });
    expect(parsed).toEqual({
      query: "GTX 1080",
      platform: "ebay",
      searchId: 3,
      savedResearchId: undefined,
      savedFlipAnalysisId: 7,
      condition: "Gebraucht",
      desiredPrice: 220,
      extras: "OVP",
      handoffSource: "flip-saved",
    });
  });

  it("returns null for listings handoff without query", () => {
    expect(parseListingsHandoffQuery({ platform: "ebay" })).toBeNull();
  });

  it("parses flip handoff query", () => {
    const parsed = parseFlipHandoffQuery({
      url: "https://www.ebay.de/itm/123",
      from: "watchlist",
    });
    expect(parsed).toEqual({
      url: "https://www.ebay.de/itm/123",
      handoffSource: "watchlist",
    });
  });

  it("truncates long extras", () => {
    const long = "a".repeat(600);
    expect(truncateHandoffExtras(long).length).toBeLessThanOrEqual(500);
  });

  it("builds listings prefill from flip result", () => {
    const routeInput = buildListingsPrefillFromFlip({
      query: "RTX 3060",
      listing: {
        platform: "kleinanzeigen",
        url: "https://example.de/1",
        title: "RTX 3060",
        price: 180,
        description: "Gut",
        condition: "Gebraucht",
        location: null,
        category: null,
      },
      marketStats: {
        min: 150,
        max: 250,
        avg: 200,
        median: 195,
        count: 10,
      },
    });
    expect(routeInput.q).toBe("RTX 3060");
    expect(routeInput.platform).toBe("kleinanzeigen");
    expect(routeInput.desiredPrice).toBe(195);
    expect(routeInput.from).toBe("flip");
  });

  it("builds listings prefill from inventory item", () => {
    const routeInput = buildListingsPrefillFromInventory({
      title: "MacBook Air",
      buy_platform: "ebay",
      sell_platform: null,
      sell_price: 650,
      notes: "Akku ok",
    });
    expect(routeInput.q).toBe("MacBook Air");
    expect(routeInput.platform).toBe("ebay");
    expect(routeInput.desiredPrice).toBe(650);
    expect(routeInput.from).toBe("inventory");
  });

  it("detects supported flip listing platforms", () => {
    expect(canBuildListingsFromFlipListing({ platform: "ebay" })).toBe(true);
    expect(canBuildListingsFromFlipListing({ platform: "sonstige" })).toBe(
      false,
    );
  });
});
