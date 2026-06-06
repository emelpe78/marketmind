import { getDb } from "../../database/db";
import { calculateProfit } from "../../services/inventory/index";

export default defineEventHandler(async (event) => {
  const db = getDb();
  const body = await readBody(event);
  const profit = calculateProfit(body);
  const result = db
    .prepare(
      `INSERT INTO inventory (title, buy_price, buy_platform, buy_date, sell_price, sell_platform, sell_date, status, profit, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      body.title,
      body.buy_price ?? null,
      body.buy_platform ?? null,
      body.buy_date ?? null,
      body.sell_price ?? null,
      body.sell_platform ?? null,
      body.sell_date ?? null,
      body.status ?? "gekauft",
      profit,
      body.notes ?? null,
    );
  return db
    .prepare("SELECT * FROM inventory WHERE id = ?")
    .get(result.lastInsertRowid);
});
