export function useSettings() {
  const { data: settings, refresh } =
    useFetch<Record<string, string>>("/api/settings");
  const saving = ref(false);

  async function saveSetting(key: string, value: string) {
    saving.value = true;
    try {
      await $fetch(`/api/settings/${key}`, {
        method: "PUT",
        body: { value },
      });
      await refresh();
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
      await refresh();
    } finally {
      saving.value = false;
    }
  }

  return { settings, saving, refresh, saveSetting, saveSettings };
}
