<script setup lang="ts">
definePageMeta({ layout: "default" });

const { data: settings, refresh } =
  await useFetch<Record<string, string>>("/api/settings");

const saving = ref(false);
const toast = useToast();

async function updateSetting(key: string, value: string) {
  saving.value = true;
  try {
    await $fetch(`/api/settings/${key}`, { method: "PUT", body: { value } });
    await refresh();
    toast.add({ title: "Gespeichert", description: key, color: "success" });
  } catch {
    toast.add({ title: "Fehler beim Speichern", color: "error" });
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="max-w-3xl space-y-8">
    <div>
      <h2 class="text-2xl font-bold text-highlighted">Einstellungen</h2>
      <p class="text-muted mt-1">API-Keys, Scraper-Konfiguration und Theme</p>
    </div>

    <UCard>
      <template #header>
        <h3 class="font-semibold">API</h3>
      </template>
      <div class="space-y-4">
        <UFormField label="OpenRouter API-Key">
          <UInput
            data-testid="openrouter-key"
            :model-value="settings?.['openrouter-api-key'] || ''"
            type="password"
            placeholder="sk-or-..."
            @blur="
              (e: FocusEvent) =>
                updateSetting(
                  'openrouter-api-key',
                  (e.target as HTMLInputElement).value,
                )
            "
          />
        </UFormField>
        <UFormField label="Default-Modell">
          <UInput
            :model-value="settings?.['default-model'] || ''"
            placeholder="google/gemini-2.5-pro"
            @blur="
              (e: FocusEvent) =>
                updateSetting(
                  'default-model',
                  (e.target as HTMLInputElement).value,
                )
            "
          />
        </UFormField>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h3 class="font-semibold">Scraper</h3>
      </template>
      <div class="grid grid-cols-2 gap-4">
        <UFormField label="Delay Min (Sek.)">
          <UInput
            data-testid="scraper-delay-min"
            :model-value="settings?.['scraper-delay-min'] || '2'"
            type="number"
            @blur="
              (e: FocusEvent) =>
                updateSetting(
                  'scraper-delay-min',
                  (e.target as HTMLInputElement).value,
                )
            "
          />
        </UFormField>
        <UFormField label="Delay Max (Sek.)">
          <UInput
            :model-value="settings?.['scraper-delay-max'] || '5'"
            type="number"
            @blur="
              (e: FocusEvent) =>
                updateSetting(
                  'scraper-delay-max',
                  (e.target as HTMLInputElement).value,
                )
            "
          />
        </UFormField>
        <UFormField label="Cache TTL (Stunden)">
          <UInput
            :model-value="settings?.['scraper-cache-ttl-hours'] || '6'"
            type="number"
            @blur="
              (e: FocusEvent) =>
                updateSetting(
                  'scraper-cache-ttl-hours',
                  (e.target as HTMLInputElement).value,
                )
            "
          />
        </UFormField>
        <UFormField label="Max. Ergebnisse">
          <UInput
            :model-value="settings?.['scraper-max-results'] || '100'"
            type="number"
            @blur="
              (e: FocusEvent) =>
                updateSetting(
                  'scraper-max-results',
                  (e.target as HTMLInputElement).value,
                )
            "
          />
        </UFormField>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h3 class="font-semibold">Watchlist</h3>
      </template>
      <UFormField label="Auto-Scrape Intervall (Stunden)">
        <UInput
          :model-value="settings?.['watchlist-scrape-interval-hours'] || '6'"
          type="number"
          @blur="
            (e: FocusEvent) =>
              updateSetting(
                'watchlist-scrape-interval-hours',
                (e.target as HTMLInputElement).value,
              )
          "
        />
      </UFormField>
    </UCard>
  </div>
</template>
