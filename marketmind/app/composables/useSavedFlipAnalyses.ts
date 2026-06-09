import type { FlipAnalysisResult } from "~/composables/useFlipping";
import { FETCH_KEYS } from "~/utils/fetch-keys";
import { refreshFetchData } from "~/utils/refresh-fetch-data";

export interface SavedFlipAnalysisListItem {
  id: number;
  title: string;
  listingUrl: string;
  listingPlatform: string;
  query: string;
  listing: {
    title: string;
    price: number | null;
    platform: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SavedFlipAnalysisDetail extends SavedFlipAnalysisListItem {
  analysis: string;
  listing: {
    platform: string;
    url: string;
    title: string;
    price: number | null;
    condition: string | null;
    location: string | null;
  };
  marketStats: {
    min: number;
    max: number;
    avg: number;
    median: number;
    count: number;
  };
  marketSamples: Array<{
    title: string;
    price: number;
    platform: string;
    condition: string | null;
  }>;
}

export function useSavedFlipAnalyses() {
  const {
    data: analyses,
    pending,
    refresh,
  } = useFetch<SavedFlipAnalysisListItem[]>("/api/saved-flip-analyses", {
    key: FETCH_KEYS.savedFlipAnalyses,
  });

  async function saveAnalysis(
    result: FlipAnalysisResult,
    title?: string,
  ): Promise<SavedFlipAnalysisDetail> {
    const saved = await $fetch<SavedFlipAnalysisDetail>(
      "/api/saved-flip-analyses",
      {
        method: "POST",
        body: {
          title,
          listingUrl: result.listing.url,
          listingPlatform: result.listing.platform,
          query: result.query,
          analysis: result.analysis,
          listing: result.listing,
          marketStats: result.marketStats,
          marketSamples: result.marketSamples,
        },
      },
    );
    await refreshFetchData(FETCH_KEYS.savedFlipAnalyses);
    return saved;
  }

  async function updateAnalysis(id: number, title: string) {
    const updated = await $fetch<SavedFlipAnalysisDetail>(
      `/api/saved-flip-analyses/${id}`,
      {
        method: "PUT",
        body: { title },
      },
    );
    await refresh();
    return updated;
  }

  async function deleteAnalysis(id: number) {
    await $fetch(`/api/saved-flip-analyses/${id}`, { method: "DELETE" });
    await refresh();
  }

  return {
    analyses,
    pending,
    refresh,
    saveAnalysis,
    updateAnalysis,
    deleteAnalysis,
  };
}
