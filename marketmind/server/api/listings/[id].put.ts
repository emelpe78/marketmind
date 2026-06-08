import { getDb } from "../../database/db";
import { parsePriceValue } from "../../services/listings/parse-generation";

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
    price_suggestion?: number | string | null;
  }>(event);

  if (!body?.title?.trim() || !body?.description?.trim()) {
    throw createError({
      statusCode: 400,
      message: "Titel und Beschreibung erforderlich",
    });
  }

  const db = getDb();
  const existing = db
    .prepare("SELECT id FROM listings WHERE id = ?")
    .get(id) as { id: number } | undefined;
  if (!existing) {
    throw createError({ statusCode: 404, message: "Anzeige nicht gefunden" });
  }

  db.prepare(
    "UPDATE listings SET query=?, platform=?, title=?, description=?, keywords=?, price_suggestion=? WHERE id=?",
  ).run(
    body.query?.trim() || body.title.trim(),
    body.platform ?? "kleinanzeigen",
    body.title.trim(),
    body.description.trim(),
    body.keywords ?? null,
    parsePriceValue(body.price_suggestion),
    id,
  );
  return db.prepare("SELECT * FROM listings WHERE id = ?").get(id);
});
