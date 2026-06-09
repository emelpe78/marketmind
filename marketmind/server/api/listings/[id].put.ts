import { getDb } from "../../database/db";
import {
  findListingById,
  updateListing,
} from "../../services/listings/repository";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, message: "ID fehlt" });
  }

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

  const db = getDb();
  if (!findListingById(db, id)) {
    throw createError({ statusCode: 404, message: "Anzeige nicht gefunden" });
  }

  return updateListing(db, id, {
    query: body.query?.trim() || body.title.trim(),
    platform: body.platform ?? "kleinanzeigen",
    title: body.title.trim(),
    description: body.description.trim(),
    keywords: body.keywords ?? null,
    category: body.category ?? null,
    price_suggestion: body.price_suggestion,
  });
});
