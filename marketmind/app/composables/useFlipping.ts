import {
  calculateFlip,
  type FlipResult,
  type FlippingScore,
} from "shared/flipping-calculator";

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
      return await $fetch<FlipAnalysisResult>("/api/flipping/analyze", {
        method: "POST",
        body: input,
      });
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
