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
    return $fetch<ResearchRunResponse>("/api/research/run", {
      method: "POST",
      body: { searchId, analyze: true },
    });
  }

  async function saveResearch(searchId: number, saveName: string) {
    return $fetch<ResearchRunResponse>("/api/research/run", {
      method: "POST",
      body: { searchId, save: true, saveName },
    });
  }

  return {
    runSearch,
    analyzeSearch,
    saveResearch,
  };
}
