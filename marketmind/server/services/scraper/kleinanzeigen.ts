import { load } from "cheerio";
import { parseGermanPrice } from "shared/parse-german-price";

export interface KleinanzeigenListing {
  title: string;
  price: number;
  location: string;
  date: string;
  category: string;
  url: string;
  platform: "kleinanzeigen";
}

function kleinanzeigenSearchSlug(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/[/\\+&?#%:,;|]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildKleinanzeigenSearchUrl(query: string, page = 1): string {
  const slug = kleinanzeigenSearchSlug(query);
  if (page <= 1) {
    return `https://www.kleinanzeigen.de/s-${slug}/k0`;
  }
  return `https://www.kleinanzeigen.de/s-seite:${page}/${slug}/k0`;
}

export function parseKleinanzeigenPrice(text: string): number {
  return parseGermanPrice(text) ?? 0;
}

function extractPriceText($el: ReturnType<ReturnType<typeof load>>): string {
  const selectors = [
    ".aditem-main--middle--price-shipping--price",
    ".aditem-main--middle--price-shipping",
    ".aditem-main--middle--price",
  ];
  for (const selector of selectors) {
    const text = $el.find(selector).first().text().trim();
    if (text) return text;
  }
  return "";
}

export function parseKleinanzeigenHtml(html: string): KleinanzeigenListing[] {
  const $ = load(html);
  const items: KleinanzeigenListing[] = [];

  $("article.aditem").each((_, el) => {
    const $el = $(el);
    const title = $el.find("h2 a").first().text().trim();
    if (!title) return;

    const priceText = extractPriceText($el);
    const price = parseKleinanzeigenPrice(priceText);
    const location = $el.find(".aditem-main--top--left").first().text().trim();
    const date = $el.find(".aditem-main--top--right").first().text().trim();
    const category = $el
      .find(".aditem-main--middle--description")
      .first()
      .text()
      .trim();
    const href =
      $el.attr("data-href") || $el.find("a").first().attr("href") || "";
    const url = href.startsWith("http")
      ? href
      : `https://www.kleinanzeigen.de${href}`;

    items.push({
      title,
      price,
      location,
      date,
      category,
      url,
      platform: "kleinanzeigen",
    });
  });

  return items;
}
