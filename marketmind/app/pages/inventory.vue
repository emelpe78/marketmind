<script setup lang="ts">
definePageMeta({ layout: "default" });

const { data: items, refresh } =
  await useFetch<Array<Record<string, unknown>>>("/api/inventory");
const { data: summary } = await useFetch<Record<string, unknown>>(
  "/api/inventory/summary",
);
const toast = useToast();

const newItem = ref({
  title: "",
  buy_price: undefined as number | undefined,
  buy_platform: "kleinanzeigen",
  status: "gekauft",
});

async function addItem() {
  if (!newItem.value.title) return;
  await $fetch("/api/inventory", { method: "POST", body: newItem.value });
  newItem.value = {
    title: "",
    buy_price: undefined,
    buy_platform: "kleinanzeigen",
    status: "gekauft",
  };
  await refresh();
  toast.add({ title: "Artikel hinzugefügt", color: "success" });
}

async function markSold(item: Record<string, unknown>) {
  await $fetch(`/api/inventory/${item.id}`, {
    method: "PUT",
    body: {
      ...item,
      status: "verkauft",
      sell_price: item.sell_price || item.buy_price,
      sell_platform: item.sell_platform || "kleinanzeigen",
      sell_date: new Date().toISOString().slice(0, 10),
    },
  });
  await refresh();
}

async function removeItem(id: number) {
  await $fetch(`/api/inventory/${id}`, { method: "DELETE" });
  await refresh();
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
          {{ ((summary.totalProfit as number) ?? 0).toFixed(2) }} €
        </p>
      </UCard>
      <UCard>
        <p class="text-sm text-muted">Ø Marge</p>
        <p class="text-xl font-bold">
          {{ ((summary.avgMargin as number) ?? 0).toFixed(1) }} %
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
      <div class="grid md:grid-cols-4 gap-4">
        <UFormField label="Titel">
          <UInput v-model="newItem.title" data-testid="inventory-title" />
        </UFormField>
        <UFormField label="Einkaufspreis (€)">
          <UInput v-model.number="newItem.buy_price" type="number" />
        </UFormField>
        <UFormField label="Plattform">
          <UInput v-model="newItem.buy_platform" />
        </UFormField>
        <UFormField label="&nbsp;">
          <UButton data-testid="add-inventory" block @click="addItem">
            Hinzufügen
          </UButton>
        </UFormField>
      </div>
    </UCard>

    <UTable
      v-if="items?.length"
      :data="items"
      :columns="[
        { accessorKey: 'title', header: 'Titel' },
        { accessorKey: 'buy_price', header: 'Einkauf (€)' },
        { accessorKey: 'sell_price', header: 'Verkauf (€)' },
        { accessorKey: 'profit', header: 'Gewinn (€)' },
        { accessorKey: 'status', header: 'Status' },
        { id: 'actions', header: 'Aktionen' },
      ]"
    >
      <template #actions-cell="{ row }">
        <div class="flex gap-1">
          <UButton
            v-if="row.original.status !== 'verkauft'"
            size="xs"
            variant="outline"
            @click="markSold(row.original)"
          >
            Verkauft
          </UButton>
          <UButton
            size="xs"
            color="error"
            variant="ghost"
            icon="i-lucide-trash"
            @click="removeItem(row.original.id as number)"
          />
        </div>
      </template>
    </UTable>
  </div>
</template>
