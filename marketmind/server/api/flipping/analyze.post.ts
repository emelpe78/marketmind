import { getDb } from "../../database/db";
import { mapDomainError } from "../../services/errors";
import { analyzeFlip } from "../../services/flipping/analyze-flip";
import { ScraperFetchError } from "../../services/scraper/fetcher";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ url: string }>(event);

  const db = getDb();

  try {
    return await analyzeFlip(db, { url: body.url ?? "" });
  } catch (error) {
    const domainError = mapDomainError(error);
    if (domainError) {
      throw createError(domainError);
    }
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
