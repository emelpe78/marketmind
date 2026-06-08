import { getDb } from "../../database/db";
import { parsePriceValue } from "../../services/listings/parse-generation";

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    query?: string;
    platform?: string;
    title?: string;
    description?: string;
    keywords?: string | null;
    price_suggestion?: number | string | null;
  }>(event);

  if (!body?.title?.trim() || !body?.description?.trim()) {
    throw createError({
      statusCode: 400,
      message: "Titel und Beschreibung erforderlich",
    });
  }

  const db = getDb();
  const result = db
    .prepare(
      "INSERT INTO listings (query, platform, title, description, keywords, price_suggestion) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .run(
      body.query?.trim() || body.title.trim(),
      body.platform ?? "kleinanzeigen",
      body.title.trim(),
      body.description.trim(),
      body.keywords ?? null,
      parsePriceValue(body.price_suggestion),
    );
  return db
    .prepare("SELECT * FROM listings WHERE id = ?")
    .get(result.lastInsertRowid);
});
