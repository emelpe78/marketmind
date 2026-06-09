import {
  normalizePlatform,
  type DetectedPlatform,
} from "shared/detect-platform";

export const INVENTORY_PLATFORM_OPTIONS = [
  { label: "Kleinanzeigen", value: "kleinanzeigen" },
  { label: "eBay", value: "ebay" },
];

export function useInventory() {
  const { data: items, refresh } =
    useFetch<Array<Record<string, unknown>>>("/api/inventory");
  const { data: summary, refresh: refreshSummary } = useFetch<
    Record<string, unknown>
  >("/api/inventory/summary");

  async function refreshInventory() {
    await Promise.all([refresh(), refreshSummary()]);
  }

  function todayIsoDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  function buildInventoryPayload(
    item: Record<string, unknown>,
    overrides: {
      status?: string;
      sell_price?: number | null;
      sell_platform?: DetectedPlatform | null;
      sell_date?: string | null;
    } = {},
  ) {
    return {
      title: item.title,
      buy_price: item.buy_price ?? null,
      buy_platform: normalizePlatform(item.buy_platform),
      buy_date: item.buy_date ?? null,
      sell_price: overrides.sell_price ?? item.sell_price ?? null,
      sell_platform:
        overrides.sell_platform !== undefined
          ? overrides.sell_platform
          : item.sell_platform
            ? normalizePlatform(item.sell_platform)
            : null,
      sell_date: overrides.sell_date ?? item.sell_date ?? null,
      status: overrides.status ?? item.status ?? "gekauft",
      notes: item.notes ?? null,
    };
  }

  async function createItem(body: Record<string, unknown>) {
    await $fetch("/api/inventory", { method: "POST", body });
    await refreshInventory();
  }

  async function updateItem(id: number, body: Record<string, unknown>) {
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
    normalizePlatform,
  };
}
