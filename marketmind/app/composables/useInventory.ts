import {
  normalizeInventoryPlatform,
  type InventoryPlatform,
} from "shared/detect-platform";
import type { InventoryItem } from "shared/inventory-types";
import { INVENTORY_PLATFORM_SELECT_OPTIONS } from "shared/platform-labels";
import { FETCH_KEYS } from "~/utils/fetch-keys";
import { refreshInventoryData } from "~/utils/refresh-fetch-data";

export const INVENTORY_PLATFORM_OPTIONS = [
  ...INVENTORY_PLATFORM_SELECT_OPTIONS,
];

export function useInventory() {
  const { data: items } = useFetch<InventoryItem[]>("/api/inventory", {
    key: FETCH_KEYS.inventory,
  });
  const { data: summary } = useFetch<Record<string, unknown>>(
    "/api/inventory/summary",
    {
      key: FETCH_KEYS.inventorySummary,
    },
  );

  async function refreshInventory() {
    await refreshInventoryData();
  }

  function todayIsoDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  function buildInventoryPayload(
    item: InventoryItem,
    overrides: {
      status?: string;
      sell_price?: number | null;
      sell_platform?: InventoryPlatform | null;
      sell_date?: string | null;
    } = {},
  ) {
    return {
      title: item.title,
      buy_price: item.buy_price ?? null,
      buy_platform: normalizeInventoryPlatform(item.buy_platform),
      buy_date: item.buy_date ?? null,
      sell_price: overrides.sell_price ?? item.sell_price ?? null,
      sell_platform:
        overrides.sell_platform !== undefined
          ? overrides.sell_platform
          : item.sell_platform
            ? normalizeInventoryPlatform(item.sell_platform)
            : null,
      sell_date: overrides.sell_date ?? item.sell_date ?? null,
      status: overrides.status ?? item.status ?? "gekauft",
      notes: item.notes ?? null,
    };
  }

  async function createItem(body: Omit<InventoryItem, "id" | "profit">) {
    await $fetch("/api/inventory", { method: "POST", body });
    await refreshInventory();
  }

  async function updateItem(id: number, body: Partial<InventoryItem>) {
    await $fetch(`/api/inventory/${id}`, { method: "PUT", body });
    await refreshInventory();
  }

  async function deleteItem(id: number) {
    await $fetch(`/api/inventory/${id}`, { method: "DELETE" });
    await refreshInventory();
  }

  return {
    items,
    summary,
    refreshInventory,
    todayIsoDate,
    buildInventoryPayload,
    createItem,
    updateItem,
    deleteItem,
    normalizeInventoryPlatform,
  };
}
