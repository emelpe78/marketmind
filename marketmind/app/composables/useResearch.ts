import type { PriceStats } from "shared/price-stats";
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
  const query = ref("");
  const platform = ref<"ebay" | "kleinanzeigen" | "both">("both");
  const loading = ref(false);
  const analyzing = ref(false);
  const saving = ref(false);
  const searchId = ref<number | null>(null);
  const stats = ref<PriceStats | null>(null);
  const summaries = ref<ResearchRunSummary[]>([]);
  const results = ref<SearchResult[]>([]);

  const hasAnalysis = computed(() => summaries.value.length > 0);
  const canAnalyze = computed(
    () => searchId.value != null && results.value.length > 0,
  );
  const canSave = computed(
    () =>
      searchId.value != null &&
      stats.value != null &&
      results.value.length > 0 &&
      hasAnalysis.value,
  );

  async function runSearch() {
    if (!query.value.trim()) return null;

    loading.value = true;
    summaries.value = [];
    try {
      const response = await $fetch<ResearchRunResponse>("/api/research/run", {
        method: "POST",
        body: { query: query.value, platform: platform.value },
      });
      searchId.value = response.searchId;
      results.value = response.results;
      stats.value = response.stats;
      return response;
    } finally {
      loading.value = false;
    }
  }

  async function analyze() {
    if (!searchId.value) return null;

    analyzing.value = true;
    try {
      const response = await $fetch<ResearchRunResponse>("/api/research/run", {
        method: "POST",
        body: { searchId: searchId.value, analyze: true },
      });
      summaries.value = response.summaries ?? [];
      await refreshAfterAgentCall();
      return response;
    } finally {
      analyzing.value = false;
    }
  }

  async function save(saveName?: string) {
    if (!searchId.value || !canSave.value) return null;

    saving.value = true;
    try {
      const response = await $fetch<ResearchRunResponse>("/api/research/run", {
        method: "POST",
        body: {
          searchId: searchId.value,
          save: true,
          saveName: saveName ?? query.value.trim(),
        },
      });
      await refreshResearchData();
      return response;
    } finally {
      saving.value = false;
    }
  }

  return {
    query,
    platform,
    loading,
    analyzing,
    saving,
    searchId,
    stats,
    summaries,
    results,
    hasAnalysis,
    canAnalyze,
    canSave,
    runSearch,
    analyze,
    save,
  };
}
