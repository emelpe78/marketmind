import { getDb } from "../../database/db";
import {
  calculateProfit,
  normalizePlatform,
} from "../../services/inventory/index";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const profit = calculateProfit(body);
  const db = getDb();
  db.prepare(
    `UPDATE inventory SET title=?, buy_price=?, buy_platform=?, buy_date=?, sell_price=?, sell_platform=?, sell_date=?, status=?, profit=?, notes=? WHERE id=?`,
  ).run(
    body.title,
    body.buy_price ?? null,
    normalizePlatform(body.buy_platform),
    body.buy_date ?? null,
    body.sell_price ?? null,
    normalizePlatform(body.sell_platform),
    body.sell_date ?? null,
    body.status ?? "gekauft",
    profit,
    body.notes ?? null,
    Number(id),
  );
  return db.prepare("SELECT * FROM inventory WHERE id = ?").get(Number(id));
});
