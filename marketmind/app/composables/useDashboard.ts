import type { SavedResearchListItem } from "~/composables/useSavedResearches";
import { FETCH_KEYS } from "~/utils/fetch-keys";
import { refreshFetchData } from "~/utils/refresh-fetch-data";

export interface DashboardSummary {
  recentSearches: Array<Record<string, unknown>>;
  savedResearches: SavedResearchListItem[];
  watchlistAlerts: number;
  inventorySummary: {
    totalProfit: number;
    avgMargin: number;
    soldCount: number;
    bestFlip: { title: string; profit: number } | null;
    worstFlip: { title: string; profit: number } | null;
  };
  tokenCosts: number;
  aiConfigured: boolean;
  aiProvider: string;
}

export async function useDashboard() {
  const { data: dashboard, pending } = await useFetch<DashboardSummary>(
    "/api/dashboard",
    {
      key: FETCH_KEYS.dashboard,
    },
  );

  async function refreshDashboard() {
    await refreshFetchData(FETCH_KEYS.dashboard);
  }

  return {
    dashboard,
    pending,
    refreshDashboard,
  };
}
