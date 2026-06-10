import { describe, it, expect } from "vitest";
import { scrapeListingPrice } from "../../server/services/scraper/price-extract";

describe("scrapeListingPrice", () => {
  it("extracts eBay listing price from HTML", () => {
    const html = `<html><span class="ux-textspans--PRICE">149,00 EUR</span></html>`;
    expect(scrapeListingPrice(html)).toBe(149);
  });

  it("extracts Kleinanzeigen listing price from HTML", () => {
    const html = `<html><span class="boxedarticle--price">180 € VB</span></html>`;
    expect(scrapeListingPrice(html)).toBe(180);
  });
});
