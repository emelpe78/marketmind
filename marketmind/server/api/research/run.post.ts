import { getDb } from "../../database/db";
import { runResearch } from "../../services/research/run-research";
import { ScraperFetchError } from "../../services/scraper/fetcher";

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    query?: string;
    platform?: "ebay" | "kleinanzeigen" | "both";
    searchId?: number;
    analyze?: boolean;
    save?: boolean;
    saveName?: string;
  }>(event);

  const db = getDb();

  try {
    return await runResearch(db, {
      query: body?.query,
      platform: body?.platform,
      searchId: body?.searchId,
      analyze: body?.analyze,
      save: body?.save,
      saveName: body?.saveName,
    });
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
