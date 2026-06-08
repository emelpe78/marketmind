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

export function normalizePlatform(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (value === "ebay" || value === "kleinanzeigen") return value;
  if (typeof value === "object" && value && "value" in value) {
    const platform = (value as { value: unknown }).value;
    if (platform === "ebay" || platform === "kleinanzeigen") return platform;
  }
  return String(value);
}

function toNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function calculateProfit(item: InventoryItem): number | null {
  const buyPrice = toNumber(item.buy_price);
  const sellPrice = toNumber(item.sell_price);

  if (item.status === "verkauft" && buyPrice != null && sellPrice != null) {
    return sellPrice - buyPrice;
  }

  return toNumber(item.profit);
}

export function getInventorySummary(db: Database.Database) {
  const items = db
    .prepare("SELECT * FROM inventory WHERE status = 'verkauft'")
    .all() as InventoryItem[];

  const profits = items
    .map((i) => calculateProfit(i) ?? 0)
    .filter((p) => !Number.isNaN(p));

  const totalProfit = profits.reduce((a, b) => a + b, 0);
  const margins = items
    .map((item) => {
      const buyPrice = toNumber(item.buy_price);
      const sellPrice = toNumber(item.sell_price);
      if (buyPrice == null || buyPrice <= 0 || sellPrice == null) return null;
      return ((sellPrice - buyPrice) / buyPrice) * 100;
    })
    .filter((margin): margin is number => margin != null);

  const avgMargin =
    margins.length > 0
      ? margins.reduce((sum, margin) => sum + margin, 0) / margins.length
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
