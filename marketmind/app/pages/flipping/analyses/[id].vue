<script setup lang="ts">
import type { InventoryCreatePrefill } from "shared/inventory-types";
import { buildInventoryPrefillFromFlipListing } from "shared/inventory-prefill";
import { formatDateTime } from "shared/format-datetime";
import { platformLabelFor, PLATFORM_LABELS } from "shared/platform-labels";
import {
  buildListingsPrefillFromFlip,
  buildListingsRoute,
  canBuildListingsFromFlipListing,
} from "shared/workflow-handoff";
import type { SavedFlipAnalysisDetail } from "~/composables/useSavedFlipAnalyses";

definePageMeta({ layout: "default" });

const route = useRoute();
const savedAnalysisId = String(route.params.id);

const {
  data: saved,
  pending,
  error,
} = await useFetch<SavedFlipAnalysisDetail>(
  `/api/saved-flip-analyses/${savedAnalysisId}`,
);

usePageHead(
  computed(() => saved.value?.title ?? "Gespeicherte Analyse"),
  "Gespeicherte Flipping-Analyse mit Kalkulation und Empfehlung",
);

const { todayIsoDate, normalizeInventoryPlatform } = await useInventory();
const inventoryModalOpen = ref(false);
const inventoryPrefill = ref<InventoryCreatePrefill>({});
const inventoryTitleSuffix = ref<string | undefined>();

function openInventoryModal() {
  if (!saved.value) return;
  inventoryTitleSuffix.value = saved.value.listing.title;
  inventoryPrefill.value = buildInventoryPrefillFromFlipListing(
    saved.value.listing,
    {
      todayIsoDate,
      normalizePlatform: normalizeInventoryPlatform,
      savedFlipAnalysisId: saved.value.id,
    },
  );
  inventoryModalOpen.value = true;
}

const listingsHandoffRoute = computed(() => {
  if (!saved.value || !canBuildListingsFromFlipListing(saved.value.listing)) {
    return null;
  }
  return buildListingsRoute(
    buildListingsPrefillFromFlip(saved.value, {
      savedFlipAnalysisId: saved.value.id,
      from: "flip-saved",
    }),
  );
});

const listingPlatformLabel = computed(() => {
  const platform = saved.value?.listing.platform;
  if (!platform) return "";
  return platformLabelFor(
    PLATFORM_LABELS as Record<string, string>,
    platform,
    platform,
  );
});
</script>

<template>
  <div class="space-y-6 min-w-0 max-w-full">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <UButton
          to="/flipping/analyses"
          variant="ghost"
          color="neutral"
          icon="i-lucide-arrow-left"
          class="mb-2 -ml-2"
        >
          Flipping-Analysen
        </UButton>
        <h2 class="text-2xl font-bold text-highlighted">
          {{ saved?.title ?? "Gespeicherte Analyse" }}
        </h2>
        <p v-if="saved" class="text-muted mt-1">
          {{ saved.query }} · {{ listingPlatformLabel }} ·
          {{ formatDateTime(saved.createdAt) }}
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
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
          icon="i-lucide-package-plus"
          data-testid="handoff-inventory"
          @click="openInventoryModal"
        >
          Ins Inventar
        </UButton>
        <UButton to="/flipping" variant="outline" icon="i-lucide-banknote">
          Neue Analyse
        </UButton>
      </div>
    </div>

    <div v-if="pending" class="text-muted">Lade Analyse...</div>
    <UAlert
      v-else-if="error"
      color="error"
      icon="i-lucide-circle-alert"
      title="Analyse nicht gefunden"
      description="Der Eintrag wurde gelöscht oder existiert nicht."
    />

    <template v-else-if="saved">
      <UCard data-testid="saved-flip-listing">
        <template #header>
          <div class="flex flex-wrap items-center gap-2 min-w-0">
            <h3 class="font-semibold text-highlighted truncate">
              {{ saved.listing.title }}
            </h3>
            <UBadge
              variant="subtle"
              color="neutral"
              class="shrink-0 capitalize"
            >
              {{ listingPlatformLabel }}
            </UBadge>
          </div>
        </template>
        <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div v-if="saved.listing.price != null">
            <span class="text-muted">Anzeigenpreis:</span>
            <span class="ms-1 font-semibold tabular-nums">
              {{ formatEuro(saved.listing.price) }}
            </span>
          </div>
          <div v-if="saved.listing.condition">
            <span class="text-muted">Zustand:</span>
            <span class="ms-1">{{ saved.listing.condition }}</span>
          </div>
          <div v-if="saved.listing.location">
            <span class="text-muted">Standort:</span>
            <span class="ms-1">{{ saved.listing.location }}</span>
          </div>
          <a
            :href="saved.listing.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary hover:underline"
          >
            Anzeige öffnen
          </a>
        </div>
      </UCard>

      <div
        v-if="saved.marketStats.count > 0"
        data-testid="saved-flip-market-stats"
        class="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <UCard>
          <p class="text-sm text-muted">Minimum</p>
          <p class="text-xl font-bold tabular-nums">
            {{ formatEuro(saved.marketStats.min) }}
          </p>
        </UCard>
        <UCard>
          <p class="text-sm text-muted">Maximum</p>
          <p class="text-xl font-bold tabular-nums">
            {{ formatEuro(saved.marketStats.max) }}
          </p>
        </UCard>
        <UCard>
          <p class="text-sm text-muted">Durchschnitt</p>
          <p class="text-xl font-bold tabular-nums">
            {{ formatEuro(saved.marketStats.avg) }}
          </p>
        </UCard>
        <UCard>
          <p class="text-sm text-muted">Median</p>
          <p class="text-xl font-bold tabular-nums">
            {{ formatEuro(saved.marketStats.median) }}
          </p>
        </UCard>
      </div>

      <ResearchAnalysisSummary
        data-testid="saved-flip-analysis"
        :summary="saved.analysis"
      />
    </template>

    <InventoryCreateModal
      v-model:open="inventoryModalOpen"
      :prefill="inventoryPrefill"
      :title-suffix="inventoryTitleSuffix"
    />
  </div>
</template>
