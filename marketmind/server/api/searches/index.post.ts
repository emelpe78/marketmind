import { getDb } from "../../database/db";
import { runSearch } from "../../services/scraper/index";
import { ScraperFetchError } from "../../services/scraper/fetcher";

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    query: string;
    platform: "ebay" | "kleinanzeigen" | "both";
  }>(event);
  if (!body?.query) {
    throw createError({ statusCode: 400, message: "Suchbegriff fehlt" });
  }
  const db = getDb();
  const platform = body.platform || "both";

  try {
    const { searchId, results } = await runSearch(db, body.query, platform);
    return { searchId, resultsCount: results.length, results };
  } catch (error) {
    if (error instanceof ScraperFetchError) {
      throw createError({
        statusCode: 502,
        message: error.message,
        data: {
          status: error.status,
          url: error.url,
          platform: error.platform,
        },
      });
    }
    throw error;
  }
});
