import type { SavedResearchListItem } from "shared/research-types";
import { FETCH_KEYS } from "~/utils/fetch-keys";
import {
  refreshDashboardData,
  refreshFetchData,
} from "~/utils/refresh-fetch-data";

export type { SavedResearchListItem } from "shared/research-types";

export async function useSavedResearches() {
  const { data: savedResearches, pending } = await useFetch<
    SavedResearchListItem[]
  >("/api/saved-researches", {
    key: FETCH_KEYS.savedResearches,
  });

  async function refreshSavedResearches() {
    await refreshFetchData(FETCH_KEYS.savedResearches);
  }

  async function updateSavedResearch(id: number, title: string) {
    await $fetch(`/api/saved-researches/${id}`, {
      method: "PUT",
      body: { title },
    });
    await Promise.all([refreshSavedResearches(), refreshDashboardData()]);
  }

  async function deleteSavedResearch(id: number) {
    await $fetch(`/api/saved-researches/${id}`, {
      method: "DELETE",
    });
    await Promise.all([refreshSavedResearches(), refreshDashboardData()]);
  }

  return {
    savedResearches,
    pending,
    refreshSavedResearches,
    updateSavedResearch,
    deleteSavedResearch,
  };
}
