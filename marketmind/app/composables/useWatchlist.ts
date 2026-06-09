import { detectPlatformFromUrl } from "shared/detect-platform";
import { PLATFORM_LABELS } from "shared/platform-labels";

export function useWatchlist() {
  const { data: items, refresh } =
    useFetch<Array<Record<string, unknown>>>("/api/watchlist");
  const loading = ref(false);

  function getPlatformLabel(item: Record<string, unknown>): string | null {
    const platform =
      detectPlatformFromUrl(String(item.url ?? "")) ??
      (item.platform === "ebay" || item.platform === "kleinanzeigen"
        ? item.platform
        : null);
    return platform ? (PLATFORM_LABELS[platform] ?? null) : null;
  }

  async function createItem(body: Record<string, unknown>) {
    await $fetch("/api/watchlist", { method: "POST", body });
    await refresh();
  }

  async function updateItem(id: number, body: Record<string, unknown>) {
    await $fetch(`/api/watchlist/${id}`, { method: "PUT", body });
    await refresh();
  }

  async function deleteItem(id: number) {
    await $fetch(`/api/watchlist/${id}`, { method: "DELETE" });
    await refresh();
  }

  async function scrapeItem(id: number) {
    loading.value = true;
    try {
      return await $fetch(`/api/watchlist/${id}/scrape`, { method: "POST" });
    } finally {
      loading.value = false;
      await refresh();
    }
  }

  async function scrapeAll() {
    loading.value = true;
    try {
      return await $fetch("/api/watchlist/scrape-all", { method: "POST" });
    } finally {
      loading.value = false;
      await refresh();
    }
  }

  return {
    items,
    loading,
    refresh,
    getPlatformLabel,
    createItem,
    updateItem,
    deleteItem,
    scrapeItem,
    scrapeAll,
  };
}
