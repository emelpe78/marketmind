<script setup lang="ts">
definePageMeta({ layout: "default" });

import { refreshAllFetchData } from "~/utils/refresh-fetch-data";

const { settings, saving, saveSetting } = await useSettings();
const { databaseInfo, resetDatabase } = await useDatabaseAdmin();

const resettingDatabase = ref(false);
const resetModalOpen = ref(false);
const toast = useToast();

const aiProviderTab = ref("openrouter");

const apiTabItems = [
  { label: "OpenRouter", value: "openrouter" },
  { label: "Lokale KI", value: "local" },
];

watch(
  settings,
  (value) => {
    if (value?.["ai-provider"]) {
      aiProviderTab.value = value["ai-provider"];
    }
  },
  { immediate: true },
);

async function switchAiProvider(value: string | number) {
  const provider = String(value);
  aiProviderTab.value = provider;
  await updateSetting("ai-provider", provider);
}

async function updateSetting(key: string, value: string) {
  try {
    await saveSetting(key, value);
    toast.add({ title: "Gespeichert", description: key, color: "success" });
  } catch {
    toast.add({ title: "Fehler beim Speichern", color: "error" });
  }
}

async function confirmResetDatabase() {
  resettingDatabase.value = true;
  try {
    const result = await resetDatabase();
    resetModalOpen.value = false;
    await refreshAllFetchData();
    toast.add({
      title: "Datenbank zurückgesetzt",
      description: result.path,
      color: "success",
    });
  } catch (error: unknown) {
    const err = error as { data?: { message?: string } };
    toast.add({
      title: err?.data?.message || "Zurücksetzen fehlgeschlagen",
      color: "error",
    });
  } finally {
    resettingDatabase.value = false;
  }
}
</script>

<template>
  <div class="max-w-3xl space-y-8">
    <div>
      <h2 class="text-2xl font-bold text-highlighted">Einstellungen</h2>
      <p class="text-muted mt-1">
        API-Keys, Scraper-Konfiguration, Datenbank und Theme
      </p>
    </div>

    <UCard>
      <template #header>
        <h3 class="font-semibold">API</h3>
      </template>
      <div class="space-y-4">
        <UTabs
          v-model="aiProviderTab"
          data-testid="ai-provider-tabs"
          :items="apiTabItems"
          @update:model-value="switchAiProvider"
        />

        <div
          v-if="aiProviderTab === 'openrouter'"
          class="space-y-4"
          data-testid="openrouter-settings"
        >
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
              data-testid="openrouter-model"
              :model-value="settings?.['default-model'] || ''"
              placeholder="deepseek/deepseek-v4-pro"
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

        <div v-else class="space-y-4" data-testid="local-ai-settings">
          <UFormField
            label="OpenAI API URL"
            hint="OpenAI-kompatible Basis-URL, z. B. Ollama oder LM Studio"
          >
            <UInput
              data-testid="local-ai-url"
              :model-value="settings?.['local-ai-api-url'] || ''"
              placeholder="http://127.0.0.1:11434/v1"
              @blur="
                (e: FocusEvent) =>
                  updateSetting(
                    'local-ai-api-url',
                    (e.target as HTMLInputElement).value,
                  )
              "
            />
          </UFormField>
          <UFormField label="API Key">
            <UInput
              data-testid="local-ai-key"
              :model-value="settings?.['local-ai-api-key'] || ''"
              type="password"
              placeholder="Optional für lokale Server"
              @blur="
                (e: FocusEvent) =>
                  updateSetting(
                    'local-ai-api-key',
                    (e.target as HTMLInputElement).value,
                  )
              "
            />
          </UFormField>
          <UFormField label="Modell">
            <UInput
              data-testid="local-ai-model"
              :model-value="settings?.['local-ai-model'] || ''"
              placeholder="llama3.2"
              @blur="
                (e: FocusEvent) =>
                  updateSetting(
                    'local-ai-model',
                    (e.target as HTMLInputElement).value,
                  )
              "
            />
          </UFormField>
        </div>
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

    <UCard>
      <template #header>
        <h3 class="font-semibold">Datenbank</h3>
      </template>
      <UButton
        color="error"
        variant="outline"
        data-testid="open-reset-database"
        @click="resetModalOpen = true"
      >
        Datenbank zurücksetzen
      </UButton>
    </UCard>

    <UModal v-model:open="resetModalOpen" title="Datenbank zurücksetzen?">
      <template #body>
        <div class="space-y-4 p-4">
          <p class="text-sm text-muted">
            Alle Daten werden unwiderruflich gelöscht: Suchen, Inventar,
            Watchlist, gespeicherte Recherchen, Agents-Verlauf und Einstellungen
            (außer dem Datenbankpfad).
          </p>
          <p class="text-sm">
            Betroffene Datei:
            <span
              class="font-mono text-error break-all"
              data-testid="reset-database-path"
            >
              {{ databaseInfo?.path }}
            </span>
          </p>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" @click="resetModalOpen = false">
              Abbrechen
            </UButton>
            <UButton
              color="error"
              data-testid="confirm-reset-database"
              :loading="resettingDatabase"
              @click="confirmResetDatabase"
            >
              Endgültig löschen
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
