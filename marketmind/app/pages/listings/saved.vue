<script setup lang="ts">
definePageMeta({ layout: "default" });

usePageHead(
  "Gespeicherte Anzeigen",
  "Gespeicherte Texte bearbeiten, ins Inventar übernehmen oder löschen",
);

import type { InventoryCreatePrefill } from "shared/inventory-types";
import { buildInventoryPrefillFromListing } from "shared/inventory-prefill";
import type { ListingItem } from "~/composables/useListings";
import { useInventory } from "~/composables/useInventory";
import { formatDateTime } from "shared/format-datetime";
import { platformLabelFor, PLATFORM_LABELS } from "shared/platform-labels";

const deleteItem = ref<ListingItem | null>(null);
const deleteModalOpen = computed({
  get: () => deleteItem.value !== null,
  set: (open: boolean) => {
    if (!open) deleteItem.value = null;
  },
});

const editItem = ref<ListingItem | null>(null);
const editModalOpen = computed({
  get: () => editItem.value !== null,
  set: (open: boolean) => {
    if (!open) editItem.value = null;
  },
});
const editForm = reactive({
  query: "",
  platform: "kleinanzeigen",
  title: "",
  description: "",
  price_suggestion: undefined as number | undefined,
  category: "",
  keywords: "",
});
const saving = ref(false);
const inventoryModalOpen = ref(false);
const inventoryPrefill = ref<InventoryCreatePrefill>({});
const inventoryTitleSuffix = ref<string | undefined>();
const toast = useToast();

const {
  listings,
  updateListing: persistListingUpdate,
  deleteListing: removeListing,
} = await useListings();

const { todayIsoDate, normalizeInventoryPlatform } = await useInventory();

const platformOptions = [
  { label: "Kleinanzeigen", value: "kleinanzeigen" },
  { label: "eBay", value: "ebay" },
];

function openInventoryModal(item: ListingItem) {
  inventoryTitleSuffix.value = item.title;
  inventoryPrefill.value = buildInventoryPrefillFromListing(item, {
    todayIsoDate,
    normalizePlatform: normalizeInventoryPlatform,
  });
  inventoryModalOpen.value = true;
}

function openEditModal(item: ListingItem) {
  editItem.value = item;
  editForm.query = item.query;
  editForm.platform = item.platform;
  editForm.title = item.title;
  editForm.description = item.description;
  editForm.price_suggestion = item.price_suggestion ?? undefined;
  editForm.category = item.category ?? "";
  editForm.keywords = item.keywords ?? "";
}

async function saveEdit() {
  if (!editItem.value) return;
  if (!editForm.title.trim() || !editForm.description.trim()) {
    toast.add({
      title: "Titel und Beschreibung erforderlich",
      color: "warning",
    });
    return;
  }

  saving.value = true;
  try {
    await persistListingUpdate(editItem.value.id, {
      query: editForm.query.trim() || editForm.title.trim(),
      platform: editForm.platform,
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      price_suggestion: editForm.price_suggestion ?? null,
      category: editForm.category?.trim() || null,
      keywords: editForm.keywords?.trim() || null,
    });
    editItem.value = null;
    toast.add({ title: "Anzeige aktualisiert", color: "success" });
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

function openDeleteModal(item: ListingItem) {
  deleteItem.value = item;
}

async function confirmDelete() {
  if (!deleteItem.value) return;
  try {
    await removeListing(deleteItem.value.id);
    deleteItem.value = null;
    toast.add({ title: "Anzeige gelöscht", color: "success" });
  } catch {
    toast.add({ title: "Löschen fehlgeschlagen", color: "error" });
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-2xl font-bold text-highlighted">Gespeicherte Anzeigen</h2>
        <p class="text-muted mt-1">
          Gespeicherte Texte bearbeiten, ins Inventar übernehmen oder löschen
        </p>
      </div>
      <UButton to="/listings" icon="i-lucide-sparkles" variant="outline">
        Neue Anzeige generieren
      </UButton>
    </div>

    <UCard v-if="listings?.length" data-testid="saved-listings">
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
                {{
                  platformLabelFor(
                    PLATFORM_LABELS as Record<string, string>,
                    item.platform,
                    item.platform,
                  )
                }}
              </UBadge>
            </div>
            <p class="text-sm text-muted mt-1 line-clamp-2">
              {{ item.description }}
            </p>
            <p class="text-xs text-muted mt-3">
              <span v-if="item.price_suggestion != null">
                {{ formatEuro(item.price_suggestion) }} ·
              </span>
              {{ formatDateTime(item.created_at) }}
            </p>
          </div>
          <div class="flex gap-2">
            <UButton
              size="sm"
              variant="outline"
              icon="i-lucide-package-plus"
              aria-label="Ins Inventar aufnehmen"
              data-testid="add-listing-to-inventory"
              @click="openInventoryModal(item)"
            />
            <UButton
              size="sm"
              variant="outline"
              icon="i-lucide-pencil"
              data-testid="edit-listing"
              @click="openEditModal(item)"
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

    <UCard v-else data-testid="saved-listings-empty">
      <div class="py-8 text-center space-y-3">
        <p class="text-muted">Noch keine Anzeigen gespeichert.</p>
        <UButton to="/listings" icon="i-lucide-sparkles">
          Anzeige generieren
        </UButton>
      </div>
    </UCard>

    <InventoryCreateModal
      v-model:open="inventoryModalOpen"
      :prefill="inventoryPrefill"
      :title-suffix="inventoryTitleSuffix"
    />

    <UModal
      v-model:open="editModalOpen"
      :title="editItem ? `Anzeige bearbeiten: ${editItem.title}` : 'Anzeige bearbeiten'"
    >
      <template v-if="editItem" #body>
        <div class="space-y-4 p-4">
          <UFormField label="Produktname">
            <UInput
              v-model="editForm.query"
              data-testid="edit-listing-query"
            />
          </UFormField>
          <UFormField label="Plattform">
            <USelect
              v-model="editForm.platform"
              :items="platformOptions"
              data-testid="edit-listing-platform"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Titel" required>
            <UInput
              v-model="editForm.title"
              data-testid="edit-listing-title"
              autofocus
            />
          </UFormField>
          <UFormField label="Beschreibung" required>
            <UTextarea
              v-model="editForm.description"
              data-testid="edit-listing-description"
              :rows="8"
            />
          </UFormField>
          <UFormField label="Preis-Empfehlung (€)">
            <UInput
              v-model.number="editForm.price_suggestion"
              data-testid="edit-listing-price"
              type="number"
              min="0"
              step="0.01"
            />
          </UFormField>
          <UFormField label="Kategorie">
            <UInput
              v-model="editForm.category"
              data-testid="edit-listing-category"
            />
          </UFormField>
          <UFormField label="Keywords">
            <UInput
              v-model="editForm.keywords"
              data-testid="edit-listing-keywords"
            />
          </UFormField>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" @click="editItem = null">
              Abbrechen
            </UButton>
            <UButton
              data-testid="confirm-edit-listing"
              :loading="saving"
              @click="saveEdit"
            >
              Speichern
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

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
