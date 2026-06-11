<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { formatDateTime } from "shared/format-datetime";
import {
  platformLabelFor,
  PLATFORM_LABELS,
} from "shared/platform-labels";
import type { SavedFlipAnalysisListItem } from "~/composables/useSavedFlipAnalyses";

definePageMeta({ layout: "default" });

usePageHead(
  "Flipping-Analysen",
  "Gespeicherte KI-Analysen zu Anzeigen",
);

const { analyses, pending, deleteAnalysis } = useSavedFlipAnalyses();
const toast = useToast();

const deleteItem = ref<SavedFlipAnalysisListItem | null>(null);
const deleteModalOpen = computed({
  get: () => deleteItem.value !== null,
  set: (open: boolean) => {
    if (!open) deleteItem.value = null;
  },
});

const columns: TableColumn<SavedFlipAnalysisListItem>[] = [
  {
    accessorKey: "title",
    header: "Titel",
    meta: {
      class: {
        th: "min-w-0 w-[44%]",
        td: "min-w-0 w-[44%]",
      },
    },
  },
  {
    accessorKey: "listingPlatform",
    header: "Plattform",
    meta: {
      class: {
        th: "w-[14%]",
        td: "w-[14%] px-3",
      },
    },
  },
  {
    id: "price",
    header: "Preis",
    meta: {
      class: {
        th: "w-[12%] text-right",
        td: "w-[12%] px-3 text-right",
      },
    },
  },
  {
    accessorKey: "createdAt",
    header: "Gespeichert",
    meta: {
      class: {
        th: "w-[18%]",
        td: "w-[18%] px-3",
      },
    },
  },
  {
    id: "actions",
    header: "",
    meta: {
      class: {
        th: "w-[12%] text-right",
        td: "w-[12%] px-3 text-right",
      },
    },
  },
];

function openAnalysis(item: SavedFlipAnalysisListItem) {
  navigateTo(`/flipping/analyses/${item.id}`);
}

function openDeleteModal(
  event: Event,
  item: SavedFlipAnalysisListItem,
) {
  event.stopPropagation();
  deleteItem.value = item;
}

async function confirmDelete() {
  if (!deleteItem.value) return;
  try {
    await deleteAnalysis(deleteItem.value.id);
    deleteItem.value = null;
    toast.add({ title: "Analyse gelöscht", color: "success" });
  } catch {
    toast.add({ title: "Löschen fehlgeschlagen", color: "error" });
  }
}
</script>

<template>
  <div class="space-y-6 min-w-0 max-w-full">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-highlighted">Flipping-Analysen</h2>
        <p class="text-muted mt-1">Gespeicherte KI-Analysen zu Anzeigen</p>
      </div>
      <UButton to="/flipping" icon="i-lucide-banknote" variant="outline">
        Neue Analyse
      </UButton>
    </div>

    <div v-if="pending" class="text-muted">Lade Analysen...</div>

    <UAlert
      v-else-if="!analyses?.length"
      color="neutral"
      variant="subtle"
      icon="i-lucide-bookmark"
      title="Noch keine Analysen"
      description="Im Flipping-Kalkulator eine Anzeige analysieren und speichern."
    />

    <UCard v-else class="min-w-0" data-testid="flip-analyses-table">
      <UTable :data="analyses" :columns="columns">
        <template #title-cell="{ row }">
          <button
            type="button"
            class="block min-w-0 w-full text-left whitespace-normal wrap-anywhere leading-snug text-primary hover:underline"
            @click="openAnalysis(row.original)"
          >
            {{ row.original.title }}
          </button>
        </template>
        <template #listingPlatform-cell="{ row }">
          <span class="capitalize">
            {{
              platformLabelFor(
                PLATFORM_LABELS as Record<string, string>,
                row.original.listingPlatform,
                row.original.listingPlatform,
              )
            }}
          </span>
        </template>
        <template #price-cell="{ row }">
          <span class="tabular-nums">
            {{
              row.original.listing.price != null
                ? formatEuro(row.original.listing.price)
                : "–"
            }}
          </span>
        </template>
        <template #createdAt-cell="{ row }">
          {{ formatDateTime(row.original.createdAt) }}
        </template>
        <template #actions-cell="{ row }">
          <UButton
            icon="i-lucide-trash-2"
            color="neutral"
            variant="ghost"
            size="sm"
            aria-label="Löschen"
            data-testid="flip-analysis-delete"
            @click="openDeleteModal($event, row.original)"
          />
        </template>
      </UTable>
    </UCard>

    <UModal v-model:open="deleteModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="font-semibold text-highlighted">Analyse löschen?</h3>
          </template>
          <p class="text-sm text-muted">
            „{{ deleteItem?.title }}“ wird dauerhaft entfernt.
          </p>
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="outline"
                @click="deleteModalOpen = false"
              >
                Abbrechen
              </UButton>
              <UButton color="error" @click="confirmDelete">Löschen</UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
