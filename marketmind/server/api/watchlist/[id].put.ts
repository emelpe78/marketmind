import { detectPlatformFromUrl } from "../../../app/utils/detect-platform";
import { getDb } from "../../database/db";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const db = getDb();
  const url = body.url ?? null;
  db.prepare(
    "UPDATE watchlist SET title=?, url=?, platform=?, target_price=?, current_price=?, alert_active=?, status=? WHERE id=?",
  ).run(
    body.title,
    url,
    detectPlatformFromUrl(url),
    body.target_price ?? null,
    body.current_price ?? null,
    body.alert_active ?? 1,
    body.status ?? "aktiv",
    Number(id),
  );
  return db.prepare("SELECT * FROM watchlist WHERE id = ?").get(Number(id));
});
