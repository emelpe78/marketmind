import type { AnalyzeFlipResult } from "shared/flipping-types";
import { refreshAfterAgentCall } from "~/utils/refresh-fetch-data";

export type FlipAnalysisResult = AnalyzeFlipResult;
export type { FlipListingInfo, FlipMarketSample } from "shared/flipping-types";

export function useFlipping() {
  const { runWithAiStatus } = useAiStatus();
  const loading = ref(false);

  async function analyze(url: string): Promise<FlipAnalysisResult> {
    loading.value = true;
    try {
      return await runWithAiStatus("flipping-analyze", async () => {
        const result = await $fetch<FlipAnalysisResult>(
          "/api/flipping/analyze",
          {
            method: "POST",
            body: { url },
          },
        );
        await refreshAfterAgentCall();
        return result;
      });
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    analyze,
  };
}
