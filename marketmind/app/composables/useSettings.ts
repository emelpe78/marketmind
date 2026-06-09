import { FETCH_KEYS } from "~/utils/fetch-keys";
import { refreshFetchData } from "~/utils/refresh-fetch-data";

export function useSettings() {
  const { data: settings } = useFetch<Record<string, string>>("/api/settings", {
    key: FETCH_KEYS.settings,
  });
  const saving = ref(false);

  async function refreshSettings() {
    await refreshFetchData(FETCH_KEYS.settings, FETCH_KEYS.dashboard);
  }

  async function saveSetting(key: string, value: string) {
    saving.value = true;
    try {
      await $fetch(`/api/settings/${key}`, {
        method: "PUT",
        body: { value },
      });
      await refreshSettings();
    } finally {
      saving.value = false;
    }
  }

  async function saveSettings(updates: Record<string, string>) {
    saving.value = true;
    try {
      await Promise.all(
        Object.entries(updates).map(([key, value]) =>
          $fetch(`/api/settings/${key}`, { method: "PUT", body: { value } }),
        ),
      );
      await refreshSettings();
    } finally {
      saving.value = false;
    }
  }

  return {
    settings,
    saving,
    refreshSettings,
    saveSetting,
    saveSettings,
  };
}
