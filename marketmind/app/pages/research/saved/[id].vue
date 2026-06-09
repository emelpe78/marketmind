<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import {
  platformLabelFor,
  RESEARCH_PLATFORM_LABELS,
} from "shared/platform-labels";

definePageMeta({ layout: "default" });

interface SavedResearchResult {
  title: string;
  price: number;
  url: string;
  platform: string;
  condition?: string | null;
}

interface PlatformSummary {
  platform: "ebay" | "kleinanzeigen";
  summary: string;
}

interface SavedResearch {
  id: number;
  title: string;
  query: string;
  platform: string;
  stats: Record<string, unknown>;
  results: SavedResearchResult[];
  analyses: PlatformSummary[];
  createdAt: string;
}

const route = useRoute();
const savedResearchId = String(route.params.id);

const {
  data: saved,
  pending,
  error,
} = await useFetch<SavedResearch>(`/api/saved-researches/${savedResearchId}`);

const platformLabels = RESEARCH_PLATFORM_LABELS;

const resultColumns: TableColumn<SavedResearchResult>[] = [
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
    meta: {
      class: {
        th: "w-[13%]",
        td: "w-[13%] px-3",
      },
    },
  },
];

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("de-DE");
}
</script>

<template>
  <div class="space-y-6 min-w-0 max-w-full">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <UButton
          to="/"
          variant="ghost"
          color="neutral"
          icon="i-lucide-arrow-left"
          class="mb-2 -ml-2"
        >
          Dashboard
        </UButton>
        <h2 class="text-2xl font-bold text-highlighted">
          {{ saved?.title ?? "Gespeicherte Recherche" }}
        </h2>
        <p v-if="saved" class="text-muted mt-1">
          {{ saved.query }} ·
          {{
            platformLabelFor(
              RESEARCH_PLATFORM_LABELS as Record<string, string>,
              saved.platform,
              saved.platform,
            )
          }}
          ·
          {{ formatDate(saved.createdAt) }}
        </p>
      </div>
      <UButton to="/research" variant="outline" icon="i-lucide-search">
        Neue Recherche
      </UButton>
    </div>

    <div v-if="pending" class="text-muted">Lade Recherche...</div>
    <UAlert
      v-else-if="error"
      color="error"
      icon="i-lucide-circle-alert"
      title="Recherche nicht gefunden"
      description="Der Eintrag wurde gelöscht oder existiert nicht."
    />

    <template v-else-if="saved">
      <div
        data-testid="saved-stats-dashboard"
        class="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <UCard>
          <p class="text-sm text-muted">Minimum</p>
          <p class="text-xl font-bold">{{ formatEuro(saved.stats.min) }}</p>
        </UCard>
        <UCard>
          <p class="text-sm text-muted">Maximum</p>
          <p class="text-xl font-bold">{{ formatEuro(saved.stats.max) }}</p>
        </UCard>
        <UCard>
          <p class="text-sm text-muted">Durchschnitt</p>
          <p class="text-xl font-bold">{{ formatEuro(saved.stats.avg) }}</p>
        </UCard>
        <UCard>
          <p class="text-sm text-muted">Median</p>
          <p class="text-xl font-bold">{{ formatEuro(saved.stats.median) }}</p>
        </UCard>
      </div>

      <div v-if="saved.analyses.length" class="space-y-4">
        <ResearchAnalysisSummary
          v-for="item in saved.analyses"
          :key="item.platform"
          :summary="item.summary"
          :platform="item.platform"
          :platform-label="
            platformLabelFor(
              RESEARCH_PLATFORM_LABELS as Record<string, string>,
              item.platform,
              item.platform,
            )
          "
        />
      </div>

      <UCard
        v-if="saved.results.length"
        class="min-w-0"
        data-testid="saved-results-table"
      >
        <template #header>
          <h3 class="font-semibold">{{ saved.results.length }} Ergebnisse</h3>
        </template>
        <UTable :data="saved.results" :columns="resultColumns">
          <template #title-cell="{ row }">
            <a
              v-if="
                row.original.platform === 'kleinanzeigen' && row.original.url
              "
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
          <template #price-cell="{ row }">
            <span class="tabular-nums">{{
              formatEuro(row.original.price)
            }}</span>
          </template>
          <template #platform-cell="{ row }">
            <span class="capitalize">{{ row.original.platform }}</span>
          </template>
          <template #condition-cell="{ row }">
            {{ row.original.condition || "–" }}
          </template>
        </UTable>
      </UCard>
    </template>
  </div>
</template>
