import {
  calculateFlip,
  type FlipResult,
  type FlippingScore,
} from "shared/flipping-calculator";
import { refreshAfterAgentCall } from "~/utils/refresh-fetch-data";

export interface FlipAnalysisResult extends FlipResult {
  recommendation: string;
}

export function useFlipping() {
  const loading = ref(false);

  function computeFlip(input: {
    buyPrice: number;
    sellPrice: number;
    shipping: number;
    packaging: number;
  }): FlipAnalysisResult {
    return {
      ...calculateFlip(input),
      recommendation: "",
    };
  }

  function mergeRecommendation(
    calc: FlipResult,
    recommendation: string,
  ): FlipAnalysisResult {
    return { ...calc, recommendation };
  }

  async function analyzeWithAI(input: {
    buyPrice: number;
    sellPrice: number;
    shipping: number;
    packaging: number;
    productName?: string;
  }): Promise<FlipAnalysisResult> {
    loading.value = true;
    try {
      const result = await $fetch<FlipAnalysisResult>("/api/flipping/analyze", {
        method: "POST",
        body: input,
      });
      await refreshAfterAgentCall();
      return result;
    } finally {
      loading.value = false;
    }
  }

  function scoreColor(score: FlippingScore | string | undefined) {
    if (score === "Sehr lohnenswert") return "success";
    if (score === "Solide") return "primary";
    if (score === "Grenzwertig") return "warning";
    return "error";
  }

  return {
    loading,
    computeFlip,
    mergeRecommendation,
    analyzeWithAI,
    scoreColor,
  };
}
