import { getDb } from "../../database/db";
import { checkAlert } from "../../services/watchlist/scraper";

export default defineEventHandler(() => {
  const db = getDb();
  const items = db
    .prepare("SELECT * FROM watchlist ORDER BY created_at DESC")
    .all() as {
    id: number;
    title: string;
    url: string | null;
    platform: string | null;
    target_price: number | null;
    current_price: number | null;
    alert_active: number;
    status: string;
    last_scraped: string | null;
    created_at: string;
  }[];
  return items.map((item) => ({
    ...item,
    alertTriggered: checkAlert(
      item.current_price,
      item.target_price,
      item.alert_active,
    ),
  }));
});
