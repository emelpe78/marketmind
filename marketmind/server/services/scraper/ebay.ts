import { load } from "cheerio";

export interface EbayListing {
  title: string;
  price: number;
  condition: string;
  url: string;
  endDate: string | null;
  sold: boolean;
  platform: "ebay";
}

export function buildEbaySearchUrl(query: string, page = 1): string {
  const params = new URLSearchParams({
    _nkw: query,
    _sacat: "0",
    _from: "R40",
    LH_PrefLoc: "1",
    LH_Sold: "1",
    LH_Complete: "1",
    rt: "nc",
    _pgn: String(page),
  });
  return `https://www.ebay.de/sch/i.html?${params.toString()}`;
}

export function parseEbayPrice(text: string): number {
  const match = text.match(/([\d.,]+)/);
  if (!match) return 0;
  const normalized = match[1].includes(",")
    ? match[1].replace(/\./g, "").replace(",", ".")
    : match[1];
  return parseFloat(normalized) || 0;
}

export function normalizeCondition(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("neu") || lower.includes("new")) return "Neu";
  if (lower.includes("defekt")) return "Defekt";
  return "Gebraucht";
}

function isPromoTitle(title: string): boolean {
  const lower = title.toLowerCase();
  return lower === "shop on ebay" || lower.startsWith("anzeige");
}

function parseListingFromElement(
  $: ReturnType<typeof load>,
  el: unknown,
): EbayListing | null {
  const $el = $(el as never);
  const title = $el
    .find(".s-card__title, .s-item__title")
    .first()
    .text()
    .replace(/Wird in neuem Fenster oder Tab geöffnet/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!title || isPromoTitle(title)) return null;

  const priceText = $el
    .find(".s-card__price, .s-item__price")
    .first()
    .text()
    .trim();
  const price = parseEbayPrice(priceText);
  if (!price) return null;

  const conditionText =
    $el.find(".s-card__subtitle, .SECONDARY_INFO").first().text().trim() ||
    "Gebraucht";
  const url =
    $el.find("a.s-card__link, a.s-item__link").first().attr("href") || "";
  const endDate =
    $el
      .find(".s-card__caption, .s-item__ended-date, .s-item__endedDate")
      .first()
      .text()
      .replace(/\s+/g, " ")
      .trim() || null;

  return {
    title,
    price,
    condition: normalizeCondition(conditionText),
    url,
    endDate,
    sold: true,
    platform: "ebay",
  };
}

export function parseEbayHtml(html: string): EbayListing[] {
  const $ = load(html);
  const items: EbayListing[] = [];
  const seen = new Set<string>();

  const selectors = [
    "ul.srp-results li.s-card",
    "ul.srp-results li.s-item",
    "li.s-card",
    "li.s-item",
  ];

  for (const selector of selectors) {
    $(selector).each((_, el) => {
      const listing = parseListingFromElement($, el);
      if (!listing) return;
      const key = `${listing.title}|${listing.price}`;
      if (seen.has(key)) return;
      seen.add(key);
      items.push(listing);
    });
    if (items.length) break;
  }

  return items;
}
