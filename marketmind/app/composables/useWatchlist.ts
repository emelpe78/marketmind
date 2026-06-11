import { detectPlatformFromUrl } from "shared/detect-platform";
import { PLATFORM_LABELS } from "shared/platform-labels";
import { FETCH_KEYS } from "~/utils/fetch-keys";
import { refreshFetchData } from "~/utils/refresh-fetch-data";

export function useWatchlist() {
  const { runWithAiStatus } = useAiStatus();
  const { data: items } = useFetch<Array<Record<string, unknown>>>(
    "/api/watchlist",
    {
      key: FETCH_KEYS.watchlist,
    },
  );
  const loading = ref(false);

  async function refreshWatchlist() {
    await refreshFetchData(FETCH_KEYS.watchlist, FETCH_KEYS.dashboard);
  }

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
    await refreshWatchlist();
  }

  async function updateItem(id: number, body: Record<string, unknown>) {
    await $fetch(`/api/watchlist/${id}`, { method: "PUT", body });
    await refreshWatchlist();
  }

  async function deleteItem(id: number) {
    await $fetch(`/api/watchlist/${id}`, { method: "DELETE" });
    await refreshWatchlist();
  }

  async function scrapeItem(id: number) {
    loading.value = true;
    try {
      return await runWithAiStatus("watchlist-scrape", async () => {
        return await $fetch(`/api/watchlist/${id}/scrape`, { method: "POST" });
      });
    } finally {
      loading.value = false;
      await refreshWatchlist();
    }
  }

  async function scrapeAll() {
    loading.value = true;
    try {
      return await runWithAiStatus("watchlist-scrape-all", async () => {
        return await $fetch("/api/watchlist/scrape-all", { method: "POST" });
      });
    } finally {
      loading.value = false;
      await refreshWatchlist();
    }
  }

  return {
    items,
    loading,
    refreshWatchlist,
    getPlatformLabel,
    createItem,
    updateItem,
    deleteItem,
    scrapeItem,
    scrapeAll,
  };
}
