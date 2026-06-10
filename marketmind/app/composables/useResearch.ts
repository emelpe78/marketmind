import type {
  ResearchRunResult,
  ResearchRunSummary,
} from "shared/research-types";
import {
  refreshAfterAgentCall,
  refreshResearchData,
} from "~/utils/refresh-fetch-data";

export type { ResearchRunSummary as PlatformSummary };

export type SearchResult = ResearchRunResult["results"][number];
export type ResearchRunResponse = ResearchRunResult;

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

  async function saveResearch(searchId: number, saveName: string) {
    const response = await $fetch<ResearchRunResponse>("/api/research/run", {
      method: "POST",
      body: {
        searchId,
        save: true,
        saveName,
      },
    });
    await refreshResearchData();
    return response;
  }

  return {
    runSearch,
    analyzeSearch,
    saveResearch,
  };
}
