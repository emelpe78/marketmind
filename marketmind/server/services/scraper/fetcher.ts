import type Database from "better-sqlite3";

const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
];

export type FetchFn = typeof fetch;

export interface FetcherConfig {
  delayMinMs: number;
  delayMaxMs: number;
  userAgentRotation: boolean;
  cacheTtlHours: number;
  proxyEnabled?: boolean;
  proxyHost?: string;
  proxyPort?: string;
  proxyAuth?: string;
}

export interface FetcherSession {
  cookies: Record<string, string>;
  warmedOrigins: Set<string>;
}

export interface FetcherDeps {
  fetchFn?: FetchFn;
  sleepFn?: (ms: number) => Promise<void>;
  randomFn?: () => number;
  uaIndex?: { current: number };
  session?: FetcherSession;
  skipWarmUp?: boolean;
}

export class ScraperFetchError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly url: string,
    public readonly platform: "ebay" | "kleinanzeigen" | "unknown" = "unknown",
  ) {
    super(message);
    this.name = "ScraperFetchError";
  }
}

let lastFetchTime = 0;

export function createFetcherSession(): FetcherSession {
  return { cookies: {}, warmedOrigins: new Set() };
}

export function getNextUserAgent(
  rotation: boolean,
  index: { current: number } = { current: 0 },
): string {
  if (!rotation) return USER_AGENTS[0] ?? "";
  index.current = (index.current + 1) % USER_AGENTS.length;
  return USER_AGENTS[index.current] ?? USER_AGENTS[0] ?? "";
}

function detectPlatform(url: string): "ebay" | "kleinanzeigen" | "unknown" {
  if (url.includes("ebay.de")) return "ebay";
  if (url.includes("kleinanzeigen.de")) return "kleinanzeigen";
  return "unknown";
}

function originKey(url: string): string {
  return new URL(url).origin;
}

function warmUpUrl(platform: "ebay" | "kleinanzeigen"): string {
  return platform === "ebay"
    ? "https://www.ebay.de/"
    : "https://www.kleinanzeigen.de/";
}

export function buildRequestHeaders(
  url: string,
  userAgent: string,
  cookieHeader?: string,
): Record<string, string> {
  const platform = detectPlatform(url);
  const isSearch =
    url.includes("/sch/") || url.includes("/s-") || url.includes("keywords=");

  const headers: Record<string, string> = {
    "User-Agent": userAgent,
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    "Upgrade-Insecure-Requests": "1",
    DNT: "1",
  };

  if (userAgent.includes("Chrome")) {
    headers["Sec-Ch-Ua"] =
      '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"';
    headers["Sec-Ch-Ua-Mobile"] = "?0";
    headers["Sec-Ch-Ua-Platform"] = userAgent.includes("Windows")
      ? '"Windows"'
      : userAgent.includes("Linux")
        ? '"Linux"'
        : '"macOS"';
    headers["Sec-Fetch-Dest"] = "document";
    headers["Sec-Fetch-Mode"] = "navigate";
    headers["Sec-Fetch-User"] = "?1";
    headers["Sec-Fetch-Site"] = isSearch ? "same-origin" : "none";
  }

  if (platform === "ebay" && isSearch) {
    headers.Referer = "https://www.ebay.de/";
  }
  if (platform === "kleinanzeigen" && isSearch) {
    headers.Referer = "https://www.kleinanzeigen.de/";
  }

  if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }

  return headers;
}

function extractSetCookies(response: Response): string[] {
  const headers = response.headers;
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }
  const single = headers.get("set-cookie");
  return single ? [single] : [];
}

function mergeCookies(
  session: FetcherSession,
  origin: string,
  response: Response,
): void {
  const headers = response?.headers;
  if (!headers) return;

  for (const raw of extractSetCookies(response)) {
    const pair = raw.split(";")[0]?.trim();
    if (!pair) continue;
    const [name] = pair.split("=");
    if (!name) continue;
    session.cookies[`${origin}|${name}`] = pair;
  }
}

function cookieHeaderForOrigin(
  session: FetcherSession,
  origin: string,
): string | undefined {
  const prefix = `${origin}|`;
  const pairs = Object.entries(session.cookies)
    .filter(([key]) => key.startsWith(prefix))
    .map(([, value]) => value);
  return pairs.length ? pairs.join("; ") : undefined;
}

async function warmUpOrigin(
  origin: string,
  platform: "ebay" | "kleinanzeigen",
  userAgent: string,
  fetchFn: FetchFn,
  session: FetcherSession,
): Promise<void> {
  if (session.warmedOrigins.has(origin)) return;

  const url = warmUpUrl(platform);
  const response = await fetchFn(url, {
    headers: buildRequestHeaders(url, userAgent),
    redirect: "follow",
  });
  mergeCookies(session, origin, response);
  if (!response.ok) {
    throw new ScraperFetchError(
      blockedMessage(response.status, platform),
      response.status,
      url,
      platform,
    );
  }
  session.warmedOrigins.add(origin);
}

export function isCacheValid(cachedAt: string, ttlHours: number): boolean {
  const cached = new Date(cachedAt).getTime();
  const ttlMs = ttlHours * 60 * 60 * 1000;
  return Date.now() - cached < ttlMs;
}

export function getCachedHtml(
  db: Database.Database,
  url: string,
  ttlHours: number,
): string | null {
  const row = db
    .prepare("SELECT html, cached_at FROM scraper_cache WHERE url = ?")
    .get(url) as { html: string; cached_at: string } | undefined;
  if (!row) return null;
  if (!isCacheValid(row.cached_at, ttlHours)) {
    db.prepare("DELETE FROM scraper_cache WHERE url = ?").run(url);
    return null;
  }
  return row.html;
}

export function setCachedHtml(
  db: Database.Database,
  url: string,
  html: string,
): void {
  db.prepare(
    "INSERT INTO scraper_cache (url, html, cached_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(url) DO UPDATE SET html = excluded.html, cached_at = CURRENT_TIMESTAMP",
  ).run(url, html);
}

function blockedMessage(
  status: number,
  platform: "ebay" | "kleinanzeigen" | "unknown",
): string {
  const name =
    platform === "ebay"
      ? "eBay.de"
      : platform === "kleinanzeigen"
        ? "Kleinanzeigen.de"
        : "die Seite";
  if (status === 403 || status === 401) {
    return `${name} blockiert automatische Anfragen (${status}). Proxy in den Einstellungen aktivieren oder später erneut versuchen.`;
  }
  if (status === 429) {
    return `${name} rate-limitiert Anfragen (${status}). Scraper-Delay erhöhen und später erneut versuchen.`;
  }
  return `${name} antwortet mit HTTP ${status}.`;
}

export function invalidateCachedHtml(db: Database.Database, url: string): void {
  db.prepare("DELETE FROM scraper_cache WHERE url = ?").run(url);
}

export async function fetchWithConfig(
  db: Database.Database,
  url: string,
  config: FetcherConfig,
  deps: FetcherDeps = {},
): Promise<string> {
  const fetchFn = deps.fetchFn ?? fetch;
  const sleepFn =
    deps.sleepFn ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));
  const randomFn = deps.randomFn ?? Math.random;
  const uaIndex = deps.uaIndex ?? { current: 0 };
  const session = deps.session ?? createFetcherSession();
  const platform = detectPlatform(url);

  const cached = getCachedHtml(db, url, config.cacheTtlHours);
  if (cached) return cached;

  const delayRange = config.delayMaxMs - config.delayMinMs;
  const delay = config.delayMinMs + randomFn() * delayRange;
  const elapsed = Date.now() - lastFetchTime;
  if (elapsed < delay) {
    await sleepFn(delay - elapsed);
  }

  const userAgent = getNextUserAgent(config.userAgentRotation, uaIndex);
  const origin = originKey(url);

  if (
    !deps.skipWarmUp &&
    (platform === "ebay" || platform === "kleinanzeigen")
  ) {
    await warmUpOrigin(origin, platform, userAgent, fetchFn, session);
  }

  const response = await fetchFn(url, {
    headers: buildRequestHeaders(
      url,
      userAgent,
      cookieHeaderForOrigin(session, origin),
    ),
    redirect: "follow",
  });
  lastFetchTime = Date.now();
  mergeCookies(session, origin, response);

  if (!response.ok) {
    throw new ScraperFetchError(
      blockedMessage(response.status, platform),
      response.status,
      url,
      platform,
    );
  }

  const html = await response.text();
  setCachedHtml(db, url, html);
  return html;
}

export { USER_AGENTS };
