import { getDb } from "../../../database/db";
import { analyzePrices } from "../../../services/stats/price-analysis";

export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "ID fehlt" });
  }
  const db = getDb();
  const search = db
    .prepare("SELECT * FROM searches WHERE id = ?")
    .get(Number(id));
  if (!search) {
    throw createError({ statusCode: 404, message: "Suche nicht gefunden" });
  }
  const results = db
    .prepare(
      "SELECT price, condition, platform, sold FROM search_results WHERE search_id = ?",
    )
    .all(Number(id)) as {
    price: number;
    condition: string;
    platform: string;
    sold: number;
  }[];
  return analyzePrices(results);
});
