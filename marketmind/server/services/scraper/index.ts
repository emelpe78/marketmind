import type Database from "better-sqlite3";
import { createScraperRuntime } from "./runtime";
import type { FetcherDeps } from "./fetcher";

export type { ScrapePlatform, ScrapeResult, ScraperRuntime } from "./runtime";
export { createScraperRuntime } from "./runtime";

export async function scrapeEbay(
  db: Database.Database,
  query: string,
  maxResults: number,
  deps: FetcherDeps = {},
) {
  return createScraperRuntime(db, deps).scrapeEbay(query, maxResults);
}

export async function scrapeKleinanzeigen(
  db: Database.Database,
  query: string,
  maxResults: number,
  deps: FetcherDeps = {},
) {
  return createScraperRuntime(db, deps).scrapeKleinanzeigen(query, maxResults);
}

export async function runSearch(
  db: Database.Database,
  query: string,
  platform: import("./runtime").ScrapePlatform,
  deps: FetcherDeps = {},
) {
  return createScraperRuntime(db, deps).runSearch(query, platform);
}
