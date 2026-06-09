import { FETCH_KEYS } from "~/utils/fetch-keys";
import { refreshFetchData } from "~/utils/refresh-fetch-data";

export interface DashboardAgentSummary {
  id: number;
  name: string;
  type: string;
  callCount: number;
  totalCostUsd: number;
}

export interface DashboardSummary {
  savedResearchCount: number;
  savedFlipAnalysisCount: number;
  savedListingCount: number;
  watchlistItemCount: number;
  watchlistAlerts: number;
  openInventoryCount: number;
  agentCallCount: number;
  promptLibraryCount: number;
  agents: DashboardAgentSummary[];
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
