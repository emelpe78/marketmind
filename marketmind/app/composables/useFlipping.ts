import { refreshAfterAgentCall } from "~/utils/refresh-fetch-data";

export interface FlipListingInfo {
  platform: string;
  url: string;
  title: string;
  price: number | null;
  condition: string | null;
  location: string | null;
}

export interface FlipMarketSample {
  title: string;
  price: number;
  platform: string;
  condition: string | null;
}

export interface FlipAnalysisResult {
  analysis: string;
  query: string;
  listing: FlipListingInfo;
  marketStats: {
    min: number;
    max: number;
    avg: number;
    median: number;
    count: number;
  };
  marketSamples: FlipMarketSample[];
}

export function useFlipping() {
  const loading = ref(false);

  async function analyze(url: string): Promise<FlipAnalysisResult> {
    loading.value = true;
    try {
      const result = await $fetch<FlipAnalysisResult>("/api/flipping/analyze", {
        method: "POST",
        body: { url },
      });
      await refreshAfterAgentCall();
      return result;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    analyze,
  };
}
