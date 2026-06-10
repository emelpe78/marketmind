import { load } from "cheerio";
import type { DetectedPlatform } from "shared/detect-platform";
import type { ListingDetail } from "shared/listing-detail-types";
import { parseGermanPrice } from "shared/parse-german-price";
import { scrapeListingPrice } from "./price-extract";

export type { ListingDetail } from "shared/listing-detail-types";

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function firstNonEmpty(...values: Array<string | undefined | null>): string {
  for (const value of values) {
    const cleaned = cleanText(value ?? "");
    if (cleaned) return cleaned;
  }
  return "";
}

function parseEbayListingDetail(
  $: ReturnType<typeof load>,
  url: string,
): ListingDetail {
  const title = firstNonEmpty(
    $("h1.x-item-title__mainTitle").first().text(),
    $("h1.it-ttl").first().text(),
    $("meta[property='og:title']").attr("content"),
  );

  const description = firstNonEmpty(
    $("#desc_wrapper").text(),
    $("#viTabs_0_panel").text(),
    $(".x-item-description .d-item-description").text(),
    $("meta[property='og:description']").attr("content"),
  );

  const condition = firstNonEmpty(
    $(".x-item-condition-text").first().text(),
    $("[data-testid='x-item-condition-label']").first().text(),
    $(".ux-labels-values__values-content")
      .filter((_, el) =>
        $(el).closest(".ux-labels-values").text().includes("Zustand"),
      )
      .first()
      .text(),
  );

  const location = firstNonEmpty(
    $(".x-sellercard-atf__info__about-seller .ux-textspans").first().text(),
    $(".ux-seller-section__item-location").first().text(),
  );

  const category = firstNonEmpty(
    $("nav.breadcrumbs li").last().text(),
    $(".seo-breadcrumb-text").last().text(),
  );

  return {
    platform: "ebay",
    url,
    title,
    price: scrapeListingPrice($.html()),
    description: description || null,
    condition: condition || null,
    location: location || null,
    category: category || null,
  };
}

function parseKleinanzeigenListingDetail(
  $: ReturnType<typeof load>,
  url: string,
): ListingDetail {
  const title = firstNonEmpty(
    $("#viewad-title").text(),
    $("h1.boxedarticle--title").text(),
    $("meta[property='og:title']").attr("content"),
  );

  const priceText = firstNonEmpty(
    $("#viewad-price").text(),
    $(".boxedarticle--price").first().text(),
  );
  const price = priceText ? parseGermanPrice(priceText) : null;

  const description = firstNonEmpty(
    $("#viewad-description-text").text(),
    $("#viewad-description").text(),
    $("meta[property='og:description']").attr("content"),
  );

  let condition = "";
  $(".addetailslist--detail, .boxedarticle--details--full li").each((_, el) => {
    const text = cleanText($(el).text());
    if (/^zustand\s*:/i.test(text)) {
      condition = text.replace(/^zustand\s*:\s*/i, "");
    }
  });

  const location = firstNonEmpty(
    $("#viewad-locality").text(),
    $(".boxedarticle--details .icon-pin + span").text(),
    $("span[itemprop='address']").text(),
  );

  const category = firstNonEmpty(
    $("#breadrumb").text(),
    $(".breadcrump a").last().text(),
    $("nav.breadcrumb a").last().text(),
  );

  return {
    platform: "kleinanzeigen",
    url,
    title,
    price,
    description: description || null,
    condition: condition || null,
    location: location || null,
    category: category || null,
  };
}

export function parseListingDetailHtml(
  html: string,
  url: string,
  platform: DetectedPlatform,
): ListingDetail | null {
  const $ = load(html);
  const detail =
    platform === "ebay"
      ? parseEbayListingDetail($, url)
      : parseKleinanzeigenListingDetail($, url);

  if (!detail.title) return null;
  return detail;
}

export function extractSearchQueryFromTitle(title: string): string {
  return sanitizeMarketSearchQuery(
    title
      .replace(/\s*[-–|]\s*(zu verkaufen|verkaufe|vb|neu|ovp).*$/i, "")
      .replace(/\s+(zu verkaufen|verkaufe|vb|neu|ovp)\s*$/i, "")
      .trim(),
  );
}

export function sanitizeMarketSearchQuery(query: string): string {
  return query
    .replace(/[/\\+&?#%:,;|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}
