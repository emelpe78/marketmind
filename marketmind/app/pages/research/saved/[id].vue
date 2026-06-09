<script setup lang="ts">
import { formatDateTime } from "shared/format-datetime";
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

</script>

<template>
  <div class="space-y-6 min-w-0 max-w-full">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <UButton
          to="/research/saved"
          variant="ghost"
          color="neutral"
          icon="i-lucide-arrow-left"
          class="mb-2 -ml-2"
        >
          Gespeicherte Recherchen
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
          {{ formatDateTime(saved.createdAt) }}
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

      <ResearchAnalysisList
        v-if="saved.analyses.length"
        :items="
          saved.analyses.map((item) => ({
            summary: item.summary,
            platform: item.platform,
            platformLabel: platformLabelFor(
              RESEARCH_PLATFORM_LABELS as Record<string, string>,
              item.platform,
              item.platform,
            ),
          }))
        "
      />

      <ResearchResultsTable
        v-if="saved.results.length"
        :results="saved.results"
        test-id="saved-results-table"
      />
    </template>
  </div>
</template>
