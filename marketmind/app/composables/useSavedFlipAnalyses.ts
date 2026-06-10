import type { SavedFlipAnalysisDetail } from "shared/flipping-types";
import { FETCH_KEYS } from "~/utils/fetch-keys";
import { refreshFlippingData } from "~/utils/refresh-fetch-data";

export type {
  SavedFlipAnalysisDetail,
  SavedFlipAnalysisListItem,
} from "shared/flipping-types";

export function useSavedFlipAnalyses() {
  const {
    data: analyses,
    pending,
    refresh,
  } = useFetch<import("shared/flipping-types").SavedFlipAnalysisListItem[]>(
    "/api/saved-flip-analyses",
    {
      key: FETCH_KEYS.savedFlipAnalyses,
    },
  );

  async function saveFromUrl(
    url: string,
    title?: string,
  ): Promise<SavedFlipAnalysisDetail> {
    const saved = await $fetch<SavedFlipAnalysisDetail>(
      "/api/saved-flip-analyses/from-url",
      {
        method: "POST",
        body: { url, title },
      },
    );
    await refreshFlippingData();
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
    saveFromUrl,
    updateAnalysis,
    deleteAnalysis,
  };
}
