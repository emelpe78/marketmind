<script setup lang="ts">
import {
  platformLabelFor,
  PLATFORM_LABELS,
  RESEARCH_PLATFORM_OPTIONS,
} from "shared/platform-labels";
import { buildListingsRoute } from "shared/workflow-handoff";

definePageMeta({ layout: "default" });

const {
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
  canSave,
  runSearch: executeSearch,
  analyze: executeAnalyze,
  save: executeSave,
} = useResearch();

const sorting = ref<{ id: string; desc: boolean }[]>([]);
const toast = useToast();

const platformLabels = PLATFORM_LABELS;
const platformOptions = [...RESEARCH_PLATFORM_OPTIONS];

const listingsHandoffRoute = computed(() => {
  if (!searchId.value || results.value.length === 0) return null;
  return buildListingsRoute({
    q: query.value.trim(),
    platform: platform.value,
    searchId: searchId.value,
    from: "research",
  });
});

async function runSearch() {
  try {
    const response = await executeSearch();
    if (!response) return;
    if (response.results.length === 0) {
      toast.add({
        title: "Keine Ergebnisse gefunden",
        description:
          "Suchbegriff prüfen oder andere Plattform wählen. eBay blockiert ggf. automatische Anfragen.",
        color: "warning",
      });
    } else {
      toast.add({
        title: "Suche abgeschlossen",
        description: `${response.results.length} Ergebnisse`,
        color: "success",
      });
    }
  } catch (error: unknown) {
    const err = error as {
      data?: { message?: string };
      statusMessage?: string;
    };
    const message =
      err?.data?.message || err?.statusMessage || "Suche fehlgeschlagen";
    toast.add({ title: message, color: "error" });
  }
}

async function analyzeSearch() {
  try {
    await executeAnalyze();
  } catch {
    toast.add({ title: "Analyse fehlgeschlagen", color: "error" });
  }
}

async function saveResearch() {
  try {
    const saved = await executeSave();
    if (!saved) return;
    toast.add({
      title: "Recherche gespeichert",
      description: "Unter Preisrecherche → Gespeicherte Recherchen aufrufbar.",
      color: "success",
    });
    if (saved.savedResearchId) {
      await navigateTo(`/research/saved/${saved.savedResearchId}`);
    }
  } catch {
    toast.add({ title: "Speichern fehlgeschlagen", color: "error" });
  }
}
</script>

<template>
  <div class="space-y-6 min-w-0 max-w-full">
    <div>
      <h2 class="text-2xl font-bold text-highlighted">Preisrecherche</h2>
      <p class="text-muted mt-1">
        Marktpreise auf eBay.de und Kleinanzeigen.de ermitteln
      </p>
    </div>

    <UCard>
      <form
        class="flex flex-col gap-4 sm:flex-row sm:items-end"
        @submit.prevent="runSearch"
      >
        <UFormField label="Suchbegriff" class="min-w-0 flex-1">
          <UInput
            v-model="query"
            data-testid="search-query"
            placeholder="z.B. RTX 3060 12GB"
          />
        </UFormField>
        <UFormField label="Plattform" class="min-w-0 w-full flex-1">
          <USelect v-model="platform" :items="platformOptions" class="w-full" />
        </UFormField>
        <UButton
          type="submit"
          data-testid="search-submit"
          icon="i-lucide-search"
          class="shrink-0 sm:mb-0"
          :loading="loading"
        >
          Suchen
        </UButton>
      </form>
    </UCard>

    <AiStatusBar />

    <div
      v-if="stats"
      data-testid="stats-dashboard"
      class="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      <UCard>
        <p class="text-sm text-muted">Minimum</p>
        <p class="text-xl font-bold">
          {{ formatEuro(stats.min) }}
        </p>
      </UCard>
      <UCard>
        <p class="text-sm text-muted">Maximum</p>
        <p class="text-xl font-bold">
          {{ formatEuro(stats.max) }}
        </p>
      </UCard>
      <UCard>
        <p class="text-sm text-muted">Durchschnitt</p>
        <p class="text-xl font-bold">
          {{ formatEuro(stats.avg) }}
        </p>
      </UCard>
      <UCard>
        <p class="text-sm text-muted">Median</p>
        <p class="text-xl font-bold">
          {{ formatEuro(stats.median) }}
        </p>
      </UCard>
    </div>

    <UAlert
      v-if="stats && (stats.count as number) === 0"
      color="warning"
      icon="i-lucide-search-x"
      title="Keine Ergebnisse"
      description="Für diesen Suchbegriff wurden keine Anzeigen gefunden. Bei eBay kann ein Zugriffsblock (403) vorliegen – Kleinanzeigen oder Proxy in den Einstellungen versuchen."
    />

    <div
      v-if="results.length && searchId"
      class="flex flex-wrap justify-end gap-2"
    >
      <UButton
        v-if="listingsHandoffRoute"
        :to="listingsHandoffRoute"
        variant="outline"
        icon="i-lucide-file-text"
        data-testid="handoff-listings"
      >
        Anzeige erstellen
      </UButton>
      <UButton
        variant="outline"
        icon="i-lucide-sparkles"
        :loading="analyzing"
        data-testid="analyze-search"
        @click="analyzeSearch"
      >
        {{ hasAnalysis ? "Analyse aktualisieren" : "KI-Analyse" }}
      </UButton>
      <UButton
        icon="i-lucide-bookmark"
        :loading="saving"
        :disabled="!canSave"
        data-testid="save-research"
        @click="saveResearch"
      >
        Recherche speichern
      </UButton>
    </div>

    <ResearchAnalysisList
      v-if="summaries.length"
      :items="
        summaries.map((item) => ({
          summary: item.summary,
          platform: item.platform,
          platformLabel: platformLabelFor(
            PLATFORM_LABELS as Record<string, string>,
            item.platform,
            item.platform,
          ),
        }))
      "
    />

    <ResearchResultsTable
      v-if="results.length"
      v-model:sorting="sorting"
      :results="results"
      sortable
      test-id="results-table"
    />
  </div>
</template>
