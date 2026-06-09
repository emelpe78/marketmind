import { getDb } from "../../database/db";
import { createListing } from "../../services/listings/repository";

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    query?: string;
    platform?: string;
    title?: string;
    description?: string;
    keywords?: string | null;
    category?: string | null;
    price_suggestion?: number | string | null;
  }>(event);

  if (!body?.title?.trim() || !body?.description?.trim()) {
    throw createError({
      statusCode: 400,
      message: "Titel und Beschreibung erforderlich",
    });
  }

  return createListing(getDb(), {
    query: body.query?.trim() || body.title.trim(),
    platform: body.platform ?? "kleinanzeigen",
    title: body.title.trim(),
    description: body.description.trim(),
    keywords: body.keywords ?? null,
    category: body.category ?? null,
    price_suggestion: body.price_suggestion,
  });
});
