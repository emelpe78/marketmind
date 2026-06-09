import {
  refreshAfterAgentCall,
  refreshDashboardData,
} from "~/utils/refresh-fetch-data";

export interface SearchResult {
  title: string;
  price: number;
  url: string;
  platform: string;
  condition?: string | null;
}

export interface PlatformSummary {
  platform: "ebay" | "kleinanzeigen";
  summary: string;
}

export interface ResearchRunResponse {
  searchId: number;
  results: SearchResult[];
  stats: Record<string, unknown>;
  summaries?: PlatformSummary[];
  savedResearchId?: number;
}

export function useResearch() {
  async function runSearch(
    query: string,
    platform: "ebay" | "kleinanzeigen" | "both",
  ) {
    return $fetch<ResearchRunResponse>("/api/research/run", {
      method: "POST",
      body: { query, platform },
    });
  }

  async function analyzeSearch(searchId: number) {
    const response = await $fetch<ResearchRunResponse>("/api/research/run", {
      method: "POST",
      body: { searchId, analyze: true },
    });
    await refreshAfterAgentCall();
    return response;
  }

  async function saveResearch(
    searchId: number,
    saveName: string,
    analyses?: PlatformSummary[],
  ) {
    const response = await $fetch<ResearchRunResponse>("/api/research/run", {
      method: "POST",
      body: {
        searchId,
        save: true,
        saveName,
        ...(analyses?.length ? { analyses } : {}),
      },
    });
    await refreshDashboardData();
    return response;
  }

  return {
    runSearch,
    analyzeSearch,
    saveResearch,
  };
}
