<script setup lang="ts">
import type { InventoryCreatePrefill } from "shared/inventory-types";
import type { InventoryItem } from "shared/inventory-types";
import { formatPlatformLabel } from "shared/platform-labels";
import { formatDateTime } from "shared/format-datetime";
import {
  buildListingsPrefillFromInventory,
  buildListingsRoute,
} from "shared/workflow-handoff";

definePageMeta({ layout: "default" });

usePageHead("Inventar", "Gekaufte und verkaufte Artikel verwalten");

const {
  items,
  summary,
  todayIsoDate,
  buildInventoryPayload,
  updateItem: updateInventoryItem,
  deleteItem: deleteInventoryItem,
  normalizeInventoryPlatform,
} = await useInventory();
const toast = useToast();

const platformOptions = INVENTORY_PLATFORM_OPTIONS;

function formatPlatform(value: unknown): string {
  return formatPlatformLabel(value);
}

function formatDate(value: unknown): string {
  if (!value) return "–";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("de-DE");
}

type Platform = "kleinanzeigen" | "ebay" | "sonstige";

function getItemProfit(item: InventoryItem): number | null {
  if (item.profit != null) return Number(item.profit);
  return null;
}

const createModalOpen = ref(false);
const createPrefill = ref<InventoryCreatePrefill>({});

const sellItem = ref<InventoryItem | null>(null);
const sellModalOpen = computed({
  get: () => sellItem.value !== null,
  set: (open: boolean) => {
    if (!open) sellItem.value = null;
  },
});
const sellForm = reactive({
  sell_price: undefined as number | undefined,
  sell_platform: "kleinanzeigen" as Platform,
  sell_date: todayIsoDate(),
});

const editItem = ref<InventoryItem | null>(null);
const editModalOpen = computed({
  get: () => editItem.value !== null,
  set: (open: boolean) => {
    if (!open) editItem.value = null;
  },
});
const editForm = reactive({
  title: "",
  buy_price: undefined as number | undefined,
  buy_platform: "kleinanzeigen" as Platform,
  buy_date: "",
  sell_price: undefined as number | undefined,
  sell_platform: "kleinanzeigen" as Platform,
  sell_date: "",
  notes: "",
});

const deleteItem = ref<InventoryItem | null>(null);
const deleteModalOpen = computed({
  get: () => deleteItem.value !== null,
  set: (open: boolean) => {
    if (!open) deleteItem.value = null;
  },
});

function openCreateModal() {
  createPrefill.value = {};
  createModalOpen.value = true;
}

function openSellModal(item: InventoryItem) {
  sellItem.value = item;
  sellForm.sell_price = undefined;
  sellForm.sell_platform =
    normalizeInventoryPlatform(item.buy_platform) ?? "kleinanzeigen";
  sellForm.sell_date = todayIsoDate();
}

function openEditModal(item: InventoryItem) {
  editItem.value = item;
  editForm.title = item.title;
  editForm.buy_price = item.buy_price ?? undefined;
  editForm.buy_platform =
    normalizeInventoryPlatform(item.buy_platform) ?? "kleinanzeigen";
  editForm.buy_date = item.buy_date ?? "";
  editForm.sell_price = item.sell_price ?? undefined;
  editForm.sell_platform =
    normalizeInventoryPlatform(item.sell_platform) ?? "kleinanzeigen";
  editForm.sell_date = item.sell_date ?? todayIsoDate();
  editForm.notes = item.notes ?? "";
}

function openDeleteModal(item: InventoryItem) {
  deleteItem.value = item;
}

async function confirmEdit() {
  if (!editItem.value?.id) return;
  if (!editForm.title.trim()) {
    toast.add({
      title: "Titel fehlt",
      description: "Bitte einen Titel eingeben.",
      color: "warning",
    });
    return;
  }
  if (editForm.sell_price == null || editForm.sell_price < 0) {
    toast.add({
      title: "Verkaufspreis fehlt",
      description: "Bitte einen gültigen Verkaufspreis eingeben.",
      color: "warning",
    });
    return;
  }

  try {
    await updateInventoryItem(Number(editItem.value.id), {
      title: editForm.title.trim(),
      buy_price: editForm.buy_price ?? null,
      buy_platform: normalizeInventoryPlatform(editForm.buy_platform),
      buy_date: editForm.buy_date || null,
      sell_price: editForm.sell_price,
      sell_platform: normalizeInventoryPlatform(editForm.sell_platform),
      sell_date: editForm.sell_date || null,
      status: "verkauft",
      notes: editForm.notes.trim() || null,
    });
    editItem.value = null;
    toast.add({ title: "Artikel aktualisiert", color: "success" });
  } catch {
    toast.add({
      title: "Änderungen konnten nicht gespeichert werden",
      color: "error",
    });
  }
}

async function confirmSell() {
  if (!sellItem.value?.id) return;
  if (sellForm.sell_price == null || sellForm.sell_price < 0) {
    toast.add({
      title: "Verkaufspreis fehlt",
      description: "Bitte einen gültigen Verkaufspreis eingeben.",
      color: "warning",
    });
    return;
  }

  try {
    await updateInventoryItem(
      Number(sellItem.value.id),
      buildInventoryPayload(sellItem.value, {
        status: "verkauft",
        sell_price: sellForm.sell_price,
        sell_platform: normalizeInventoryPlatform(sellForm.sell_platform),
        sell_date: sellForm.sell_date,
      }),
    );
    sellItem.value = null;
    toast.add({ title: "Als verkauft markiert", color: "success" });
  } catch {
    toast.add({
      title: "Verkauf konnte nicht gespeichert werden",
      color: "error",
    });
  }
}

async function confirmDelete() {
  if (!deleteItem.value?.id) return;
  await deleteInventoryItem(Number(deleteItem.value.id));
  deleteItem.value = null;
  toast.add({ title: "Artikel gelöscht", color: "success" });
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-2xl font-bold text-highlighted">Inventar</h2>
        <p class="text-muted mt-1">Gekaufte und verkaufte Artikel verwalten</p>
      </div>
      <UButton
        icon="i-lucide-package-plus"
        data-testid="add-inventory"
        @click="openCreateModal"
      >
        Artikel hinzufügen
      </UButton>
    </div>

    <div v-if="summary" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <UCard>
        <p class="text-sm text-muted">Gesamtgewinn</p>
        <p class="text-xl font-bold" data-testid="total-profit">
          {{ formatEuro(summary.totalProfit ?? 0) }}
        </p>
      </UCard>
      <UCard>
        <p class="text-sm text-muted">Ø Marge</p>
        <p class="text-xl font-bold">
          {{ formatPercent(summary.avgMargin ?? 0) }}
        </p>
      </UCard>
      <UCard v-if="summary.bestFlip">
        <p class="text-sm text-muted">Bester Flip</p>
        <p class="text-sm font-semibold">
          {{ (summary.bestFlip as { title: string }).title }}
        </p>
      </UCard>
      <UCard v-if="summary.worstFlip">
        <p class="text-sm text-muted">Schlechtester Flip</p>
        <p class="text-sm font-semibold">
          {{ (summary.worstFlip as { title: string }).title }}
        </p>
      </UCard>
    </div>

    <UCard v-if="items?.length" data-testid="inventory-list">
      <div class="space-y-3">
        <div
          v-for="item in items"
          :key="String(item.id)"
          class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-muted p-4"
        >
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h4 class="font-semibold">{{ item.title }}</h4>
              <UBadge
                variant="subtle"
                :color="item.status === 'verkauft' ? 'success' : 'neutral'"
              >
                {{ item.status === "verkauft" ? "Verkauft" : "Gekauft" }}
              </UBadge>
              <UBadge v-if="item.buy_platform" variant="subtle" color="neutral">
                Einkauf: {{ formatPlatform(item.buy_platform) }}
              </UBadge>
              <UBadge
                v-if="item.sell_platform"
                variant="subtle"
                color="neutral"
              >
                Verkauf: {{ formatPlatform(item.sell_platform) }}
              </UBadge>
            </div>
            <p v-if="item.notes" class="text-sm text-muted mt-1 line-clamp-2">
              {{ item.notes }}
            </p>
            <p class="text-xs text-muted mt-3">
              <template v-if="item.buy_price != null">
                Einkauf {{ formatEuro(item.buy_price) }}
                <span v-if="item.buy_date">
                  · {{ formatDate(item.buy_date) }}
                </span>
              </template>
              <template
                v-if="item.status === 'verkauft' && item.sell_price != null"
              >
                <span v-if="item.buy_price != null"> · </span>
                Verkauf {{ formatEuro(item.sell_price) }}
                <span
                  v-if="getItemProfit(item) != null"
                  class="font-medium"
                  :class="{
                    'text-success': (getItemProfit(item) ?? 0) > 0,
                    'text-error': (getItemProfit(item) ?? 0) < 0,
                    'text-muted': getItemProfit(item) === 0,
                  }"
                >
                  ({{ formatEuroDelta(getItemProfit(item)!) }})
                </span>
                <span v-if="item.sell_date">
                  · {{ formatDate(item.sell_date) }}
                </span>
              </template>
              <template v-else-if="item.sell_price != null">
                <span v-if="item.buy_price != null"> · </span>
                Ziel {{ formatEuro(item.sell_price) }}
              </template>
              <span v-if="item.created_at">
                · {{ formatDateTime(item.created_at) }}
              </span>
            </p>
          </div>
          <div class="flex gap-2">
            <UButton
              v-if="item.status !== 'verkauft'"
              size="sm"
              variant="outline"
              icon="i-lucide-file-text"
              :to="buildListingsRoute(buildListingsPrefillFromInventory(item))"
              data-testid="handoff-listings-from-inventory"
            >
              Anzeige erstellen
            </UButton>
            <UButton
              v-if="item.status !== 'verkauft'"
              size="sm"
              variant="outline"
              data-testid="mark-sold"
              @click="openSellModal(item)"
            >
              Verkauft
            </UButton>
            <UButton
              v-if="item.status === 'verkauft'"
              size="sm"
              variant="outline"
              icon="i-lucide-pencil"
              data-testid="edit-inventory"
              @click="openEditModal(item)"
            >
              Bearbeiten
            </UButton>
            <UButton
              size="sm"
              color="error"
              variant="ghost"
              icon="i-lucide-trash"
              data-testid="delete-inventory"
              @click="openDeleteModal(item)"
            />
          </div>
        </div>
      </div>
    </UCard>

    <UCard v-else data-testid="inventory-empty">
      <div class="py-8 text-center space-y-3">
        <p class="text-muted">Noch keine Artikel im Inventar.</p>
        <UButton
          icon="i-lucide-package-plus"
          data-testid="add-inventory-empty"
          @click="openCreateModal"
        >
          Artikel hinzufügen
        </UButton>
      </div>
    </UCard>

    <InventoryCreateModal
      v-model:open="createModalOpen"
      :prefill="createPrefill"
    />

    <UModal
      v-model:open="sellModalOpen"
      :title="sellItem ? `Verkauf: ${sellItem.title}` : 'Verkauf erfassen'"
    >
      <template v-if="sellItem" #body>
        <div class="space-y-4 p-4">
          <p v-if="sellItem.buy_price != null" class="text-sm text-muted">
            Einkaufspreis:
            <span class="font-medium text-default">
              {{ formatEuro(sellItem.buy_price) }}
            </span>
            <span v-if="sellItem.buy_platform" class="capitalize">
              ({{ sellItem.buy_platform }})
            </span>
          </p>
          <UFormField label="Verkaufspreis (€)" required>
            <UInput
              v-model.number="sellForm.sell_price"
              data-testid="sell-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="z.B. 150"
              autofocus
            />
          </UFormField>
          <UFormField label="Verkaufsplattform" class="w-full">
            <div class="flex flex-wrap gap-2" data-testid="sell-platform">
              <UButton
                v-for="option in platformOptions"
                :key="option.value"
                type="button"
                :variant="
                  sellForm.sell_platform === option.value ? 'solid' : 'outline'
                "
                @click="sellForm.sell_platform = option.value as Platform"
              >
                {{ option.label }}
              </UButton>
            </div>
          </UFormField>
          <UFormField label="Verkaufsdatum">
            <UInput v-model="sellForm.sell_date" type="date" />
          </UFormField>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" @click="sellItem = null">
              Abbrechen
            </UButton>
            <UButton data-testid="confirm-sell" @click="confirmSell">
              Als verkauft speichern
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="editModalOpen"
      :title="editItem ? `Bearbeiten: ${editItem.title}` : 'Artikel bearbeiten'"
    >
      <template v-if="editItem" #body>
        <div class="space-y-4 p-4">
          <UFormField label="Titel" required>
            <UInput
              v-model="editForm.title"
              data-testid="edit-inventory-title"
              autofocus
            />
          </UFormField>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UFormField label="Einkaufspreis (€)">
              <UInput
                v-model.number="editForm.buy_price"
                data-testid="edit-inventory-buy-price"
                type="number"
                min="0"
                step="0.01"
              />
            </UFormField>
            <UFormField label="Einkaufsdatum">
              <UInput
                v-model="editForm.buy_date"
                data-testid="edit-inventory-buy-date"
                type="date"
              />
            </UFormField>
            <UFormField label="Einkaufsplattform">
              <USelect
                v-model="editForm.buy_platform"
                :items="platformOptions"
                value-key="value"
                data-testid="edit-inventory-buy-platform"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Verkaufspreis (€)" required>
              <UInput
                v-model.number="editForm.sell_price"
                data-testid="edit-inventory-sell-price"
                type="number"
                min="0"
                step="0.01"
              />
            </UFormField>
            <UFormField label="Verkaufsdatum">
              <UInput
                v-model="editForm.sell_date"
                data-testid="edit-inventory-sell-date"
                type="date"
              />
            </UFormField>
            <UFormField label="Verkaufsplattform" class="sm:col-span-2">
              <USelect
                v-model="editForm.sell_platform"
                :items="platformOptions"
                value-key="value"
                data-testid="edit-inventory-sell-platform"
                class="w-full"
              />
            </UFormField>
          </div>
          <UFormField label="Notizen">
            <UTextarea
              v-model="editForm.notes"
              data-testid="edit-inventory-notes"
              :rows="4"
            />
          </UFormField>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" @click="editItem = null">
              Abbrechen
            </UButton>
            <UButton data-testid="confirm-edit-inventory" @click="confirmEdit">
              Speichern
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="deleteModalOpen" title="Artikel löschen?">
      <template v-if="deleteItem" #body>
        <div class="space-y-4 p-4">
          <p class="text-sm text-muted">
            „{{ deleteItem.title }}“ wirklich aus dem Inventar entfernen? Diese
            Aktion kann nicht rückgängig gemacht werden.
          </p>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" @click="deleteItem = null">
              Abbrechen
            </UButton>
            <UButton
              color="error"
              data-testid="confirm-delete"
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
