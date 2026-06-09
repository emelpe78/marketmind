import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  extractSearchQueryFromTitle,
  parseListingDetailHtml,
  sanitizeMarketSearchQuery,
} from "../../server/services/scraper/listing-detail";

const fixturesDir = join(__dirname, "../fixtures");

describe("listing-detail parser", () => {
  it("parses eBay listing detail HTML", () => {
    const html = readFileSync(
      join(fixturesDir, "ebay/listing-detail.html"),
      "utf-8",
    );
    const detail = parseListingDetailHtml(
      html,
      "https://www.ebay.de/itm/123456789",
      "ebay",
    );

    expect(detail).toMatchObject({
      platform: "ebay",
      title: "MSI RTX 3060 Ventus 2X 12GB",
      price: 149,
      condition: "Gebraucht",
      location: "Berlin",
    });
    expect(detail?.description).toContain("Grafikkarte");
  });

  it("parses Kleinanzeigen listing detail HTML", () => {
    const html = readFileSync(
      join(fixturesDir, "kleinanzeigen/listing-detail.html"),
      "utf-8",
    );
    const detail = parseListingDetailHtml(
      html,
      "https://www.kleinanzeigen.de/s-anzeige/rtx-3060/123",
      "kleinanzeigen",
    );

    expect(detail).toMatchObject({
      platform: "kleinanzeigen",
      title: "RTX 3060 12GB zu verkaufen",
      price: 180,
      condition: "Sehr Gut",
      location: "München",
    });
    expect(detail?.description).toContain("Originalverpackung");
  });

  it("extracts search query from listing title", () => {
    expect(extractSearchQueryFromTitle("RTX 3060 12GB zu verkaufen")).toBe(
      "RTX 3060 12GB",
    );
    expect(extractSearchQueryFromTitle("MSI RTX 3060 Ventus 2X 12GB")).toBe(
      "MSI RTX 3060 Ventus 2X 12GB",
    );
  });

  it("sanitizes slashes in search query", () => {
    expect(
      sanitizeMarketSearchQuery("Gaming/Office PC i5 GTX 1050 Ti SSD+SSHD"),
    ).toBe("Gaming Office PC i5 GTX 1050 Ti SSD SSHD");
    expect(
      extractSearchQueryFromTitle(
        "Gaming/Office PC i5 GTX 1050 Ti 16GB RAM SSD+SSHD Windows 11 Pro",
      ),
    ).toBe("Gaming Office PC i5 GTX 1050 Ti 16GB RAM SSD SSHD Windows 11 Pro");
  });
});
