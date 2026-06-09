export interface SavedResearchListItem {
  id: number;
  title: string;
  query: string;
  platform: string;
  results: unknown[];
  createdAt: string;
  updatedAt: string;
}

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
  const {
    data: dashboard,
    pending,
    refresh,
  } = await useFetch<DashboardSummary>("/api/dashboard");

  async function updateSavedResearch(id: number, title: string) {
    await $fetch(`/api/saved-researches/${id}`, {
      method: "PUT",
      body: { title },
    });
    await refresh();
  }

  async function deleteSavedResearch(id: number) {
    await $fetch(`/api/saved-researches/${id}`, {
      method: "DELETE",
    });
    await refresh();
  }

  return {
    dashboard,
    pending,
    refresh,
    updateSavedResearch,
    deleteSavedResearch,
  };
}
