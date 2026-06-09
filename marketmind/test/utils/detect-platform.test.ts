import { describe, expect, it } from "vitest";
import { detectPlatformFromUrl } from "shared/detect-platform";

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
});
