import { load } from "cheerio";
import { parseGermanPrice } from "shared/parse-german-price";

export function scrapeListingPrice(html: string): number | null {
  const $ = load(html);
  const ebayPrice = $(".x-price-primary, .s-item__price, .ux-textspans--PRICE")
    .first()
    .text();
  if (ebayPrice) {
    const price = parseGermanPrice(ebayPrice);
    if (price !== null) return price;
  }
  const kaPrice = $(".boxedarticle--price, .aditem-main--middle--price")
    .first()
    .text();
  if (kaPrice) return parseGermanPrice(kaPrice);
  return null;
}
