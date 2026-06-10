<script setup lang="ts">
import { formatDateTime } from "shared/format-datetime";
import {
  platformLabelFor,
  RESEARCH_PLATFORM_LABELS,
} from "shared/platform-labels";
import type { SavedResearchListItem } from "~/composables/useSavedResearches";

definePageMeta({ layout: "default" });

const {
  savedResearches,
  pending,
  updateSavedResearch,
  deleteSavedResearch,
} = await useSavedResearches();
const toast = useToast();

const editItem = ref<SavedResearchListItem | null>(null);
const editModalOpen = computed({
  get: () => editItem.value !== null,
  set: (open: boolean) => {
    if (!open) editItem.value = null;
  },
});
const editTitle = ref("");

const deleteItem = ref<SavedResearchListItem | null>(null);
const deleteModalOpen = computed({
  get: () => deleteItem.value !== null,
  set: (open: boolean) => {
    if (!open) deleteItem.value = null;
  },
});

function openEditModal(item: SavedResearchListItem) {
  editItem.value = item;
  editTitle.value = item.title;
}

function openDeleteModal(item: SavedResearchListItem) {
  deleteItem.value = item;
}

async function confirmEdit() {
  if (!editItem.value) return;
  if (!editTitle.value.trim()) {
    toast.add({ title: "Titel fehlt", color: "warning" });
    return;
  }

  try {
    await updateSavedResearch(editItem.value.id, editTitle.value.trim());
    editItem.value = null;
    toast.add({ title: "Recherche aktualisiert", color: "success" });
  } catch {
    toast.add({ title: "Speichern fehlgeschlagen", color: "error" });
  }
}

async function confirmDelete() {
  if (!deleteItem.value) return;

  try {
    await deleteSavedResearch(deleteItem.value.id);
    deleteItem.value = null;
    toast.add({ title: "Recherche gelöscht", color: "success" });
  } catch {
    toast.add({ title: "Löschen fehlgeschlagen", color: "error" });
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-2xl font-bold text-highlighted">
          Gespeicherte Recherchen
        </h2>
        <p class="text-muted mt-1">
          Gespeicherte Suchergebnisse und KI-Analysen aufrufen, bearbeiten oder
          löschen
        </p>
      </div>
      <UButton to="/research" icon="i-lucide-search" variant="outline">
        Neue Recherche
      </UButton>
    </div>

    <div v-if="pending" class="text-muted">Lade Recherchen...</div>

    <UCard
      v-else-if="savedResearches?.length"
      data-testid="saved-researches"
    >
      <div class="space-y-3">
        <div
          v-for="item in savedResearches"
          :key="item.id"
          class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-muted p-4"
        >
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <NuxtLink
                :to="`/research/saved/${item.id}`"
                class="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                data-testid="saved-research-link"
              >
                <span>{{ item.title }}</span>
                <UIcon
                  name="i-lucide-external-link"
                  class="size-4 shrink-0 opacity-80"
                />
              </NuxtLink>
              <UBadge variant="subtle" color="neutral">
                {{
                  platformLabelFor(
                    RESEARCH_PLATFORM_LABELS as Record<string, string>,
                    item.platform,
                    item.platform,
                  )
                }}
              </UBadge>
            </div>
            <p class="text-sm text-muted mt-1">
              {{ item.query }} · {{ item.resultsCount }} Ergebnisse ·
              {{ formatDateTime(item.updatedAt) }}
            </p>
          </div>
          <div class="flex gap-2">
            <UButton
              size="sm"
              variant="outline"
              icon="i-lucide-pencil"
              data-testid="edit-saved-research"
              @click="openEditModal(item)"
            />
            <UButton
              size="sm"
              color="error"
              variant="ghost"
              icon="i-lucide-trash"
              data-testid="delete-saved-research"
              @click="openDeleteModal(item)"
            />
          </div>
        </div>
      </div>
    </UCard>

    <UCard v-else data-testid="saved-researches-empty">
      <div class="py-8 text-center space-y-3">
        <p class="text-muted">Noch keine Recherchen gespeichert.</p>
        <UButton to="/research" icon="i-lucide-search">
          Preisrecherche starten
        </UButton>
      </div>
    </UCard>

    <UModal
      v-model:open="editModalOpen"
      :title="
        editItem ? `Bearbeiten: ${editItem.title}` : 'Recherche bearbeiten'
      "
    >
      <template v-if="editItem" #body>
        <div class="space-y-4 p-4">
          <UFormField label="Titel" required>
            <UInput
              v-model="editTitle"
              data-testid="edit-saved-research-title"
              autofocus
            />
          </UFormField>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" @click="editItem = null">
              Abbrechen
            </UButton>
            <UButton
              data-testid="confirm-edit-saved-research"
              @click="confirmEdit"
            >
              Speichern
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="deleteModalOpen" title="Recherche löschen?">
      <template v-if="deleteItem" #body>
        <div class="space-y-4 p-4">
          <p class="text-sm text-muted">
            „{{ deleteItem.title }}“ wirklich löschen? Suchergebnisse und
            KI-Analyse gehen dabei verloren.
          </p>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" @click="deleteItem = null">
              Abbrechen
            </UButton>
            <UButton
              color="error"
              data-testid="confirm-delete-saved-research"
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
