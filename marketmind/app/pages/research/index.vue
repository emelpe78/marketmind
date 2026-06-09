<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Column } from "@tanstack/vue-table";
import {
  platformLabelFor,
  PLATFORM_LABELS,
  RESEARCH_PLATFORM_OPTIONS,
} from "shared/platform-labels";
import type { PlatformSummary, SearchResult } from "~/composables/useResearch";

definePageMeta({ layout: "default" });

const {
  runSearch: fetchResearch,
  analyzeSearch: requestAnalyze,
  saveResearch: requestSave,
} = useResearch();

const query = ref("");
const platform = ref<"ebay" | "kleinanzeigen" | "both">("both");
const loading = ref(false);
const analyzing = ref(false);
const saving = ref(false);
const searchId = ref<number | null>(null);
const stats = ref<Record<string, unknown> | null>(null);
const summaries = ref<PlatformSummary[]>([]);
const results = ref<SearchResult[]>([]);
const sorting = ref<{ id: string; desc: boolean }[]>([]);
const toast = useToast();

async function runSearch() {
  if (!query.value.trim()) return;
  loading.value = true;
  summaries.value = [];
  sorting.value = [];
  try {
    const response = await fetchResearch(query.value, platform.value);
    searchId.value = response.searchId;
    results.value = response.results;
    stats.value = response.stats;
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
  } finally {
    loading.value = false;
  }
}

async function analyzeSearch() {
  if (!searchId.value) return;
  analyzing.value = true;
  try {
    const response = await requestAnalyze(searchId.value);
    summaries.value = response.summaries ?? [];
  } catch {
    toast.add({ title: "Analyse fehlgeschlagen", color: "error" });
  } finally {
    analyzing.value = false;
  }
}

async function saveResearch() {
  if (!searchId.value || !stats.value || results.value.length === 0) return;
  saving.value = true;
  try {
    const saved = await requestSave(
      searchId.value,
      query.value.trim(),
      summaries.value,
    );
    toast.add({
      title: "Recherche gespeichert",
      description: "Im Dashboard unter „Gespeicherte Recherchen“ aufrufbar.",
      color: "success",
    });
    if (saved.savedResearchId) {
      await navigateTo(`/research/saved/${saved.savedResearchId}`);
    }
  } catch {
    toast.add({ title: "Speichern fehlgeschlagen", color: "error" });
  } finally {
    saving.value = false;
  }
}

const platformLabels = PLATFORM_LABELS;

const hasAnalysis = computed(() => summaries.value.length > 0);

const platformOptions = [...RESEARCH_PLATFORM_OPTIONS];

function sortIcon(column: Column<SearchResult, unknown>) {
  const direction = column.getIsSorted();
  if (direction === "asc") return "i-lucide-arrow-up-narrow-wide";
  if (direction === "desc") return "i-lucide-arrow-down-wide-narrow";
  return "i-lucide-arrow-up-down";
}

function toggleSort(column: Column<SearchResult, unknown>) {
  column.toggleSorting(column.getIsSorted() === "asc");
}

const resultColumns: TableColumn<SearchResult>[] = [
  {
    accessorKey: "title",
    header: "Titel",
    meta: {
      class: {
        th: "min-w-0 w-[62%]",
        td: "min-w-0 w-[62%]",
      },
    },
  },
  {
    accessorKey: "price",
    header: "Preis",
    sortingFn: "basic",
    meta: {
      class: {
        th: "w-[11%] text-right",
        td: "w-[11%] px-3 text-right",
      },
    },
  },
  {
    accessorKey: "platform",
    header: "Plattform",
    meta: {
      class: {
        th: "w-[14%]",
        td: "w-[14%] px-3",
      },
    },
  },
  {
    accessorKey: "condition",
    header: "Zustand",
    sortingFn: "alphanumeric",
    meta: {
      class: {
        th: "w-[13%]",
        td: "w-[13%] px-3",
      },
    },
  },
];
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
        data-testid="save-research"
        @click="saveResearch"
      >
        Recherche speichern
      </UButton>
    </div>

    <div v-if="summaries.length" class="space-y-4">
      <ResearchAnalysisSummary
        v-for="item in summaries"
        :key="item.platform"
        :summary="item.summary"
        :platform="item.platform"
        :platform-label="
          platformLabelFor(
            PLATFORM_LABELS as Record<string, string>,
            item.platform,
            item.platform,
          )
        "
      />
    </div>

    <UCard v-if="results.length" class="min-w-0" data-testid="results-table">
      <template #header>
        <h3 class="font-semibold">{{ results.length }} Ergebnisse</h3>
      </template>
      <UTable
        v-model:sorting="sorting"
        :data="results"
        :columns="resultColumns"
      >
        <template #title-cell="{ row }">
          <a
            v-if="row.original.platform === 'kleinanzeigen' && row.original.url"
            :href="row.original.url"
            target="_blank"
            rel="noopener noreferrer"
            class="block min-w-0 whitespace-normal wrap-anywhere leading-snug text-primary hover:underline"
          >
            {{ row.original.title }}
          </a>
          <span
            v-else
            class="block min-w-0 whitespace-normal wrap-anywhere leading-snug"
          >
            {{ row.original.title }}
          </span>
        </template>
        <template #price-header="{ column }">
          <div class="flex justify-end">
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              label="Preis"
              :icon="sortIcon(column)"
              class="-mx-2.5"
              @click="toggleSort(column)"
            />
          </div>
        </template>
        <template #condition-header="{ column }">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            label="Zustand"
            :icon="sortIcon(column)"
            class="-mx-2.5"
            @click="toggleSort(column)"
          />
        </template>
        <template #price-cell="{ row }">
          <span class="tabular-nums">{{ formatEuro(row.original.price) }}</span>
        </template>
        <template #platform-cell="{ row }">
          <span class="capitalize">{{ row.original.platform }}</span>
        </template>
        <template #condition-cell="{ row }">
          {{ row.original.condition || "–" }}
        </template>
      </UTable>
    </UCard>
  </div>
</template>
