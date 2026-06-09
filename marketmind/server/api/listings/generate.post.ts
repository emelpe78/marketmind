import { getDb } from "../../database/db";
import { mapDomainError } from "../../services/errors";
import { generateListing } from "../../services/listings/generate-listing";

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    query?: string;
    platform?: "kleinanzeigen" | "ebay";
    condition?: string;
    extras?: string;
    desiredPrice?: number;
    searchId?: number;
  }>(event);

  if (!body?.query || !body?.platform) {
    throw createError({
      statusCode: 400,
      message: "Query und Plattform erforderlich",
    });
  }

  const db = getDb();

  try {
    return await generateListing(db, {
      query: body.query,
      platform: body.platform,
      condition: body.condition ?? "Gebraucht",
      extras: body.extras,
      desiredPrice: body.desiredPrice,
      searchId: body.searchId,
    });
  } catch (error) {
    const domainError = mapDomainError(error);
    if (domainError) {
      throw createError(domainError);
    }
    throw error;
  }
});
