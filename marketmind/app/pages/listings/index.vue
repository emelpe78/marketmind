<script setup lang="ts">
definePageMeta({ layout: "default" });

import type { GeneratedListing } from "~/composables/useListings";

const query = ref("");
const condition = ref("Gebraucht");
const extras = ref("");
const desiredPrice = ref<number | undefined>();
const activeTab = ref("kleinanzeigen");
const saving = ref(false);
const editingId = ref<number | null>(null);
const generated = ref<GeneratedListing | null>(null);
const toast = useToast();

const {
  generating: loading,
  generateListing: runGenerateListing,
  saveListing: persistListing,
  updateListing: persistListingUpdate,
} = await useListings();

const conditionOptions = ["Neu", "Gebraucht", "Defekt"];

function resetEditor() {
  editingId.value = null;
  generated.value = null;
}

async function generateListing() {
  if (!query.value) return;
  try {
    generated.value = await runGenerateListing({
      query: query.value,
      platform: activeTab.value,
      condition: condition.value,
      extras: extras.value,
      desiredPrice: desiredPrice.value,
    });
    editingId.value = null;
  } catch {
    toast.add({ title: "Generierung fehlgeschlagen", color: "error" });
  }
}

function buildSavePayload() {
  if (!generated.value) return null;
  return {
    query: query.value.trim() || generated.value.title,
    platform: activeTab.value,
    title: String(generated.value.title).trim(),
    description: String(generated.value.description).trim(),
    keywords: generated.value.keywords,
    category: generated.value.category,
    price_suggestion: generated.value.priceSuggestion,
  };
}

async function saveListing() {
  const payload = buildSavePayload();
  if (!payload?.title || !payload.description) {
    toast.add({
      title: "Titel und Beschreibung erforderlich",
      color: "warning",
    });
    return;
  }

  saving.value = true;
  try {
    if (editingId.value) {
      await persistListingUpdate(editingId.value, payload);
      toast.add({ title: "Anzeige aktualisiert", color: "success" });
    } else {
      const saved = await persistListing(payload);
      editingId.value = saved.id;
      toast.add({ title: "Anzeige gespeichert", color: "success" });
    }
  } catch (error: unknown) {
    const err = error as { data?: { message?: string } };
    toast.add({
      title: err?.data?.message || "Speichern fehlgeschlagen",
      color: "error",
    });
  } finally {
    saving.value = false;
  }
}

function copyText(text: string) {
  navigator.clipboard.writeText(text);
  toast.add({ title: "Kopiert", color: "success" });
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-highlighted">Anzeigen-Generator</h2>
      <p class="text-muted mt-1">
        Plattform-optimierte Texte für eBay & Kleinanzeigen
      </p>
    </div>

    <UCard>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="Produktname" class="min-w-0 w-full">
          <UInput
            v-model="query"
            data-testid="listing-query"
            placeholder="RTX 3060 12GB"
          />
        </UFormField>
        <UFormField label="Zustand" class="min-w-0 w-full">
          <USelect
            v-model="condition"
            :items="conditionOptions"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Zusatzinfos" class="md:col-span-2">
          <UTextarea
            v-model="extras"
            placeholder="Zubehör, Mängel, Besonderheiten..."
          />
        </UFormField>
        <UFormField label="Wunsch-Verkaufspreis (€)">
          <UInput v-model.number="desiredPrice" type="number" />
        </UFormField>
      </div>
    </UCard>

    <UTabs
      v-model="activeTab"
      data-testid="listing-tabs"
      :items="[
        { label: 'Kleinanzeigen', value: 'kleinanzeigen' },
        { label: 'eBay', value: 'ebay' },
      ]"
    />

    <UButton
      data-testid="generate-listing"
      icon="i-lucide-sparkles"
      :loading="loading"
      @click="generateListing"
    >
      Anzeige generieren
    </UButton>

    <UCard v-if="generated" data-testid="generated-listing">
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h3 class="font-semibold">
            {{ editingId ? "Gespeicherte Anzeige" : "Generierte Anzeige" }}
          </h3>
          <UButton
            v-if="editingId"
            size="xs"
            variant="ghost"
            @click="resetEditor"
          >
            Neu generieren
          </UButton>
        </div>
      </template>
      <div class="space-y-4">
        <UFormField label="Titel" class="w-full">
          <div class="flex w-full gap-2">
            <UInput
              v-model="generated.title"
              data-testid="listing-title"
              class="min-w-0 flex-1"
            />
            <UButton
              icon="i-lucide-copy"
              variant="outline"
              @click="copyText(String(generated.title))"
            />
          </div>
        </UFormField>
        <UFormField label="Beschreibung" class="w-full">
          <div class="flex w-full gap-2">
            <UTextarea
              v-model="generated.description"
              data-testid="listing-description"
              :rows="8"
              class="min-w-0 flex-1"
            />
            <UButton
              icon="i-lucide-copy"
              variant="outline"
              @click="copyText(String(generated.description))"
            />
          </div>
        </UFormField>
        <p v-if="generated.priceSuggestion != null" class="text-sm">
          Preis-Empfehlung:
          <strong>{{ formatEuro(generated.priceSuggestion) }}</strong>
        </p>
        <p v-if="generated.category" class="text-sm text-muted">
          Kategorie: {{ generated.category }}
        </p>
        <UButton
          data-testid="save-listing"
          :loading="saving"
          @click="saveListing"
        >
          {{ editingId ? "Änderungen speichern" : "Speichern" }}
        </UButton>
      </div>
    </UCard>
  </div>
</template>
