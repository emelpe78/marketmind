<script setup lang="ts">
import type { FlipAnalysisResult } from "~/composables/useFlipping";
import { platformLabelFor, PLATFORM_LABELS } from "shared/platform-labels";

definePageMeta({ layout: "default" });

const url = ref("");
const result = ref<FlipAnalysisResult | null>(null);
const { loading, analyze } = useFlipping();
const { saveAnalysis } = useSavedFlipAnalyses();
const saving = ref(false);
const toast = useToast();

async function runAnalysis() {
  const value = url.value.trim();
  if (!value) {
    toast.add({
      title: "URL fehlt",
      description: "Anzeigen-URL von eBay oder Kleinanzeigen eingeben.",
      color: "warning",
    });
    return;
  }

  result.value = null;
  try {
    result.value = await analyze(value);
  } catch (error: unknown) {
    const err = error as {
      data?: { message?: string };
      statusMessage?: string;
    };
    const message =
      err?.data?.message || err?.statusMessage || "Analyse fehlgeschlagen";
    toast.add({ title: message, color: "error" });
  }
}

async function saveCurrentAnalysis() {
  if (!result.value) return;
  saving.value = true;
  try {
    const saved = await saveAnalysis(result.value);
    toast.add({
      title: "Analyse gespeichert",
      description: "Unter „Flipping-Analysen“ aufrufbar.",
      color: "success",
    });
    await navigateTo(`/flipping/analyses/${saved.id}`);
  } catch {
    toast.add({ title: "Speichern fehlgeschlagen", color: "error" });
  } finally {
    saving.value = false;
  }
}

const listingPlatformLabel = computed(() => {
  const platform = result.value?.listing.platform;
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
    <div>
      <h2 class="text-2xl font-bold text-highlighted">Flipping-Kalkulator</h2>
      <p class="text-muted mt-1">
        Flipping-Potenzial einer Anzeige per KI bewerten
      </p>
    </div>

    <UCard>
      <form
        class="flex flex-col gap-4 sm:flex-row sm:items-end"
        @submit.prevent="runAnalysis"
      >
        <UFormField
          label="Anzeigen-URL"
          class="min-w-0 flex-1"
          hint="eBay.de oder Kleinanzeigen.de"
        >
          <UInput
            v-model="url"
            data-testid="flip-input"
            type="url"
            placeholder="https://www.kleinanzeigen.de/s-anzeige/…"
          />
        </UFormField>
        <UButton
          type="submit"
          data-testid="flip-analyze"
          icon="i-lucide-sparkles"
          class="shrink-0"
          :loading="loading"
        >
          Flipping analysieren
        </UButton>
      </form>
    </UCard>

    <div v-if="result?.analysis" class="flex flex-wrap justify-end gap-2">
      <UButton
        icon="i-lucide-bookmark"
        data-testid="flip-save"
        :loading="saving"
        @click="saveCurrentAnalysis"
      >
        Analyse speichern
      </UButton>
    </div>

    <UCard v-if="result" data-testid="flip-listing">
      <template #header>
        <div class="flex flex-wrap items-center gap-2 min-w-0">
          <h3 class="font-semibold text-highlighted truncate">
            {{ result.listing.title }}
          </h3>
          <UBadge variant="subtle" color="neutral" class="shrink-0 capitalize">
            {{ listingPlatformLabel }}
          </UBadge>
        </div>
      </template>
      <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div v-if="result.listing.price != null">
          <span class="text-muted">Anzeigenpreis:</span>
          <span class="ms-1 font-semibold tabular-nums">
            {{ formatEuro(result.listing.price) }}
          </span>
        </div>
        <div v-if="result.listing.condition">
          <span class="text-muted">Zustand:</span>
          <span class="ms-1">{{ result.listing.condition }}</span>
        </div>
        <div v-if="result.listing.location">
          <span class="text-muted">Standort:</span>
          <span class="ms-1">{{ result.listing.location }}</span>
        </div>
        <a
          :href="result.listing.url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary hover:underline"
        >
          Anzeige öffnen
        </a>
      </div>
    </UCard>

    <div
      v-if="result && result.marketStats.count > 0"
      data-testid="flip-market-stats"
      class="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      <UCard>
        <p class="text-sm text-muted">Minimum</p>
        <p class="text-xl font-bold tabular-nums">
          {{ formatEuro(result.marketStats.min) }}
        </p>
      </UCard>
      <UCard>
        <p class="text-sm text-muted">Maximum</p>
        <p class="text-xl font-bold tabular-nums">
          {{ formatEuro(result.marketStats.max) }}
        </p>
      </UCard>
      <UCard>
        <p class="text-sm text-muted">Durchschnitt</p>
        <p class="text-xl font-bold tabular-nums">
          {{ formatEuro(result.marketStats.avg) }}
        </p>
      </UCard>
      <UCard>
        <p class="text-sm text-muted">Median</p>
        <p class="text-xl font-bold tabular-nums">
          {{ formatEuro(result.marketStats.median) }}
        </p>
      </UCard>
    </div>

    <ResearchAnalysisSummary
      v-if="result?.analysis"
      data-testid="flip-analysis"
      :summary="result.analysis"
    />
  </div>
</template>
