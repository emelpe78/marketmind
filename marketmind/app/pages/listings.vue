<script setup lang="ts">
definePageMeta({ layout: "default" });

import type { GeneratedListing, ListingItem } from "~/composables/useListings";

const query = ref("");
const condition = ref("Gebraucht");
const extras = ref("");
const desiredPrice = ref<number | undefined>();
const activeTab = ref("kleinanzeigen");
const saving = ref(false);
const editingId = ref<number | null>(null);
const generated = ref<GeneratedListing | null>(null);
const deleteItem = ref<ListingItem | null>(null);
const deleteModalOpen = computed({
  get: () => deleteItem.value !== null,
  set: (open: boolean) => {
    if (!open) deleteItem.value = null;
  },
});
const toast = useToast();

const {
  listings,
  generating: loading,
  refresh: refreshListings,
  generateListing: runGenerateListing,
  saveListing: persistListing,
  updateListing: persistListingUpdate,
  deleteListing: removeListing,
} = await useListings();

const conditionOptions = ["Neu", "Gebraucht", "Defekt"];

const platformLabels: Record<string, string> = {
  kleinanzeigen: "Kleinanzeigen",
  ebay: "eBay",
};

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

function loadListing(item: ListingItem) {
  editingId.value = item.id;
  query.value = item.query;
  activeTab.value = item.platform;
  generated.value = {
    platform: item.platform,
    title: item.title,
    description: item.description,
    priceSuggestion: item.price_suggestion,
    category: null,
    keywords: item.keywords,
  };
}

function openDeleteModal(item: ListingItem) {
  deleteItem.value = item;
}

async function confirmDelete() {
  if (!deleteItem.value) return;
  try {
    await removeListing(deleteItem.value.id);
    if (editingId.value === deleteItem.value.id) {
      resetEditor();
    }
    deleteItem.value = null;
    toast.add({ title: "Anzeige gelöscht", color: "success" });
  } catch {
    toast.add({ title: "Löschen fehlgeschlagen", color: "error" });
  }
}

function copyText(text: string) {
  navigator.clipboard.writeText(text);
  toast.add({ title: "Kopiert", color: "success" });
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("de-DE");
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
            {{ editingId ? "Anzeige bearbeiten" : "Generierte Anzeige" }}
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

    <UCard v-if="listings?.length" data-testid="saved-listings">
      <template #header>
        <h3 class="font-semibold">Gespeicherte Anzeigen</h3>
      </template>
      <div class="space-y-3">
        <div
          v-for="item in listings"
          :key="item.id"
          class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-muted p-4"
        >
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h4 class="font-semibold">{{ item.title }}</h4>
              <UBadge variant="subtle" color="neutral">
                {{ platformLabels[item.platform] ?? item.platform }}
              </UBadge>
            </div>
            <p class="text-sm text-muted mt-1 line-clamp-2">
              {{ item.description }}
            </p>
            <p class="text-xs text-muted mt-1">
              <span v-if="item.price_suggestion != null">
                {{ formatEuro(item.price_suggestion) }} ·
              </span>
              {{ formatDate(item.created_at) }}
            </p>
          </div>
          <div class="flex gap-2">
            <UButton
              size="sm"
              variant="outline"
              icon="i-lucide-pencil"
              data-testid="edit-listing"
              @click="loadListing(item)"
            />
            <UButton
              size="sm"
              color="error"
              variant="ghost"
              icon="i-lucide-trash"
              data-testid="delete-listing"
              @click="openDeleteModal(item)"
            />
          </div>
        </div>
      </div>
    </UCard>

    <UModal v-model:open="deleteModalOpen" title="Anzeige löschen?">
      <template v-if="deleteItem" #body>
        <div class="space-y-4 p-4">
          <p class="text-sm text-muted">
            „{{ deleteItem.title }}“ wirklich löschen?
          </p>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" @click="deleteItem = null">
              Abbrechen
            </UButton>
            <UButton
              color="error"
              data-testid="confirm-delete-listing"
              @click="confirmDelete"
            >
              Löschen
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
