<script setup lang="ts">
import { formatPlatformLabel } from "shared/platform-labels";

definePageMeta({ layout: "default" });

const {
  items,
  summary,
  refreshInventory,
  todayIsoDate,
  buildInventoryPayload,
  createItem: createInventoryItem,
  updateItem: updateInventoryItem,
  deleteItem: deleteInventoryItem,
  normalizePlatform,
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

type Platform = "kleinanzeigen" | "ebay";

function getItemProfit(item: Record<string, unknown>): number | null {
  if (item.profit != null) return Number(item.profit);
  return null;
}

const newItem = ref({
  title: "",
  buy_price: undefined as number | undefined,
  buy_platform: "kleinanzeigen" as "kleinanzeigen" | "ebay",
  buy_date: todayIsoDate(),
  status: "gekauft",
});

const sellItem = ref<Record<string, unknown> | null>(null);
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

const deleteItem = ref<Record<string, unknown> | null>(null);
const deleteModalOpen = computed({
  get: () => deleteItem.value !== null,
  set: (open: boolean) => {
    if (!open) deleteItem.value = null;
  },
});

function openSellModal(item: Record<string, unknown>) {
  sellItem.value = item;
  sellForm.sell_price = undefined;
  sellForm.sell_platform =
    normalizePlatform(item.buy_platform) ?? "kleinanzeigen";
  sellForm.sell_date = todayIsoDate();
}

function openDeleteModal(item: Record<string, unknown>) {
  deleteItem.value = item;
}

async function addItem() {
  if (!newItem.value.title) return;
  await createInventoryItem({
    ...newItem.value,
    buy_platform: normalizePlatform(newItem.value.buy_platform),
  });
  newItem.value = {
    title: "",
    buy_price: undefined,
    buy_platform: "kleinanzeigen",
    buy_date: todayIsoDate(),
    status: "gekauft",
  };
  toast.add({ title: "Artikel hinzugefügt", color: "success" });
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
        sell_platform: normalizePlatform(sellForm.sell_platform),
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
    <div>
      <h2 class="text-2xl font-bold text-highlighted">Inventar</h2>
      <p class="text-muted mt-1">Gekaufte und verkaufte Artikel verwalten</p>
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

    <UCard>
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end">
        <UFormField label="Titel" class="min-w-0 flex-1">
          <UInput v-model="newItem.title" data-testid="inventory-title" />
        </UFormField>
        <UFormField label="Einkaufspreis (€)" class="min-w-0 flex-1">
          <UInput v-model.number="newItem.buy_price" type="number" />
        </UFormField>
        <UFormField label="Einkaufsdatum" class="min-w-0 flex-1">
          <UInput
            v-model="newItem.buy_date"
            data-testid="inventory-buy-date"
            type="date"
          />
        </UFormField>
        <UFormField label="Einkaufsplattform" class="min-w-0 flex-1">
          <USelect
            v-model="newItem.buy_platform"
            :items="platformOptions"
            value-key="value"
            class="w-full"
          />
        </UFormField>
        <UButton data-testid="add-inventory" class="shrink-0" @click="addItem">
          Hinzufügen
        </UButton>
      </div>
    </UCard>

    <UTable
      v-if="items?.length"
      class="min-w-0"
      :data="items"
      :columns="[
        {
          accessorKey: 'title',
          header: 'Titel',
          meta: {
            class: { th: 'min-w-0 w-[18%]', td: 'min-w-0 w-[18%]' },
          },
        },
        {
          accessorKey: 'buy_price',
          header: 'Einkauf (€)',
          meta: { class: { th: 'w-[9%]', td: 'w-[9%]' } },
        },
        {
          accessorKey: 'buy_date',
          header: 'Einkaufsdatum',
          meta: { class: { th: 'w-[10%]', td: 'w-[10%]' } },
        },
        {
          accessorKey: 'buy_platform',
          header: 'Einkaufsplattform',
          meta: { class: { th: 'w-[10%]', td: 'w-[10%]' } },
        },
        {
          accessorKey: 'sell_price',
          header: 'Verkauf (€)',
          meta: { class: { th: 'w-[12%]', td: 'w-[12%]' } },
        },
        {
          accessorKey: 'sell_platform',
          header: 'Verkaufsplattform',
          meta: { class: { th: 'w-[10%]', td: 'w-[10%]' } },
        },
        {
          accessorKey: 'sell_date',
          header: 'Verkaufsdatum',
          meta: { class: { th: 'w-[10%]', td: 'w-[10%]' } },
        },
        {
          accessorKey: 'status',
          header: 'Status',
          meta: { class: { th: 'w-[8%]', td: 'w-[8%]' } },
        },
        {
          id: 'actions',
          header: 'Aktionen',
          meta: { class: { th: 'w-[13%]', td: 'w-[13%]' } },
        },
      ]"
    >
      <template #title-cell="{ row }">
        <span
          class="block min-w-0 whitespace-normal wrap-anywhere leading-snug"
        >
          {{ row.original.title }}
        </span>
      </template>
      <template #buy_date-cell="{ row }">
        {{ formatDate(row.original.buy_date) }}
      </template>
      <template #buy_price-cell="{ row }">
        <span class="tabular-nums">
          {{
            row.original.buy_price != null
              ? formatEuro(row.original.buy_price)
              : "–"
          }}
        </span>
      </template>
      <template #buy_platform-cell="{ row }">
        {{ formatPlatform(row.original.buy_platform) }}
      </template>
      <template #sell_price-cell="{ row }">
        <span
          v-if="row.original.sell_price != null"
          class="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 tabular-nums"
        >
          <span>{{ formatEuro(row.original.sell_price) }}</span>
          <span
            v-if="getItemProfit(row.original) != null"
            class="text-sm font-medium"
            :class="{
              'text-success': (getItemProfit(row.original) ?? 0) > 0,
              'text-error': (getItemProfit(row.original) ?? 0) < 0,
              'text-muted': getItemProfit(row.original) === 0,
            }"
          >
            {{ formatEuroDelta(getItemProfit(row.original)!) }}
          </span>
        </span>
        <span v-else>–</span>
      </template>
      <template #sell_platform-cell="{ row }">
        {{ formatPlatform(row.original.sell_platform) }}
      </template>
      <template #sell_date-cell="{ row }">
        {{ formatDate(row.original.sell_date) }}
      </template>
      <template #actions-cell="{ row }">
        <div class="flex gap-1">
          <UButton
            v-if="row.original.status !== 'verkauft'"
            size="xs"
            variant="outline"
            data-testid="mark-sold"
            @click="openSellModal(row.original)"
          >
            Verkauft
          </UButton>
          <UButton
            size="xs"
            color="error"
            variant="ghost"
            icon="i-lucide-trash"
            data-testid="delete-inventory"
            @click="openDeleteModal(row.original)"
          />
        </div>
      </template>
    </UTable>

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
