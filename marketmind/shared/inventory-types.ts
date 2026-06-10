import type { InventoryPlatform } from "./detect-platform";

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
  profit?: number | null;
  notes: string | null;
  created_at?: string;
}

export interface InventoryCreatePrefill {
  title?: string;
  buy_price?: number;
  buy_platform?: InventoryPlatform;
  buy_date?: string;
  sell_price?: number;
  sell_platform?: InventoryPlatform;
  notes?: string;
}
