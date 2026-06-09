import { describe, expect, it } from "vitest";
import {
  detectPlatformFromUrl,
  isListingUrl,
  normalizeInventoryPlatform,
  normalizePlatform,
} from "shared/detect-platform";

describe("detect-platform", () => {
  it("detects platform from listing urls", () => {
    expect(
      detectPlatformFromUrl(
        "https://www.kleinanzeigen.de/s-anzeige/rtx-3060/123",
      ),
    ).toBe("kleinanzeigen");
    expect(detectPlatformFromUrl("https://www.ebay.de/itm/123456789")).toBe(
      "ebay",
    );
    expect(detectPlatformFromUrl("https://example.com/item")).toBeNull();
    expect(detectPlatformFromUrl("")).toBeNull();
  });

  it("normalizes inventory platforms including sonstige", () => {
    expect(normalizePlatform("ebay")).toBe("ebay");
    expect(normalizePlatform("sonstige")).toBeNull();
    expect(normalizeInventoryPlatform("sonstige")).toBe("sonstige");
    expect(normalizeInventoryPlatform({ value: "sonstige" })).toBe("sonstige");
  });

  it("detects listing urls", () => {
    expect(
      isListingUrl("https://www.kleinanzeigen.de/s-anzeige/rtx-3060/123"),
    ).toBe(true);
    expect(isListingUrl("https://www.ebay.de/itm/123456789")).toBe(true);
    expect(isListingUrl("RTX 3060 12GB")).toBe(false);
    expect(isListingUrl("https://example.com/item")).toBe(false);
  });
});
