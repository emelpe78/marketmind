import type Database from "better-sqlite3";

export interface InventoryItem {
  id?: number;
  title: string;
  buy_price: number | null;
  buy_platform: string | null;
  buy_date: string | null;
  sell_price: number | null;
  sell_platform: string | null;
  sell_date: string | null;
  status: string;
  profit: number | null;
  notes: string | null;
}

export function calculateProfit(item: InventoryItem): number | null {
  if (
    item.status === "verkauft" &&
    item.buy_price != null &&
    item.sell_price != null
  ) {
    return item.sell_price - item.buy_price;
  }
  return item.profit;
}

export function getInventorySummary(db: Database.Database) {
  const items = db
    .prepare("SELECT * FROM inventory WHERE status = 'verkauft'")
    .all() as InventoryItem[];

  const profits = items
    .map((i) => calculateProfit(i) ?? 0)
    .filter((p) => !Number.isNaN(p));

  const totalProfit = profits.reduce((a, b) => a + b, 0);
  const avgMargin =
    items.length > 0
      ? items.reduce((sum, i) => {
          if (i.buy_price && i.buy_price > 0 && i.sell_price) {
            return sum + ((i.sell_price - i.buy_price) / i.buy_price) * 100;
          }
          return sum;
        }, 0) / items.length
      : 0;

  let bestFlip = null as { title: string; profit: number } | null;
  let worstFlip = null as { title: string; profit: number } | null;

  for (const item of items) {
    const profit = calculateProfit(item) ?? 0;
    if (!bestFlip || profit > bestFlip.profit) {
      bestFlip = { title: item.title, profit };
    }
    if (!worstFlip || profit < worstFlip.profit) {
      worstFlip = { title: item.title, profit };
    }
  }

  return {
    totalProfit,
    avgMargin,
    bestFlip,
    worstFlip,
    soldCount: items.length,
  };
}
