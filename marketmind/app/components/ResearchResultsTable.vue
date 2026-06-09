<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Column } from "@tanstack/vue-table";

export interface ResearchResultRow {
  title: string;
  price: number;
  url: string;
  platform: string;
  condition?: string | null;
}

const props = defineProps<{
  results: ResearchResultRow[];
  testId?: string;
  sortable?: boolean;
}>();

const sorting = defineModel<{ id: string; desc: boolean }[]>("sorting", {
  default: () => [],
});

const resultColumns: TableColumn<ResearchResultRow>[] = [
  {
    accessorKey: "title",
    header: "Titel",
    meta: {
      class: {
        th: "min-w-0 w-[62%]",
        td: "min-w-0 w-[62%]",
      },
    },
  },
  {
    accessorKey: "price",
    header: "Preis",
    sortingFn: "basic",
    meta: {
      class: {
        th: "w-[11%] text-right",
        td: "w-[11%] px-3 text-right",
      },
    },
  },
  {
    accessorKey: "platform",
    header: "Plattform",
    meta: {
      class: {
        th: "w-[14%]",
        td: "w-[14%] px-3",
      },
    },
  },
  {
    accessorKey: "condition",
    header: "Zustand",
    sortingFn: "alphanumeric",
    meta: {
      class: {
        th: "w-[13%]",
        td: "w-[13%] px-3",
      },
    },
  },
];

function sortIcon(column: Column<ResearchResultRow, unknown>) {
  const direction = column.getIsSorted();
  if (direction === "asc") return "i-lucide-arrow-up-narrow-wide";
  if (direction === "desc") return "i-lucide-arrow-down-wide-narrow";
  return "i-lucide-arrow-up-down";
}

function toggleSort(column: Column<ResearchResultRow, unknown>) {
  column.toggleSorting(column.getIsSorted() === "asc");
}
</script>

<template>
  <UCollapsible
    v-if="results.length"
    :default-open="false"
    :unmount-on-hide="false"
    :data-testid="testId"
    class="w-full rounded-lg border border-muted bg-elevated"
  >
    <template #default="{ open }">
      <UButton
        variant="ghost"
        color="neutral"
        class="w-full justify-between rounded-none px-4 py-3.5"
      >
        <span class="flex min-w-0 flex-1 items-center gap-2">
          <UIcon name="i-lucide-list" class="size-5 shrink-0 text-primary" />
          <span class="truncate font-semibold text-highlighted">
            {{ results.length }} Ergebnisse
          </span>
        </span>
        <UIcon
          name="i-lucide-chevron-down"
          class="size-5 shrink-0 transition-transform duration-200"
          :class="{ 'rotate-180': open }"
        />
      </UButton>
    </template>

    <template #content>
      <div class="min-w-0 border-t border-muted px-4 pb-4 pt-2">
        <UTable
          v-model:sorting="sorting"
          :data="results"
          :columns="resultColumns"
          class="min-w-0"
        >
          <template #title-cell="{ row }">
            <a
              v-if="
                row.original.platform === 'kleinanzeigen' && row.original.url
              "
              :href="row.original.url"
              target="_blank"
              rel="noopener noreferrer"
              class="block min-w-0 whitespace-normal wrap-anywhere leading-snug text-primary hover:underline"
            >
              {{ row.original.title }}
            </a>
            <span
              v-else
              class="block min-w-0 whitespace-normal wrap-anywhere leading-snug"
            >
              {{ row.original.title }}
            </span>
          </template>
          <template v-if="sortable" #price-header="{ column }">
            <div class="flex justify-end">
              <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                label="Preis"
                :icon="sortIcon(column)"
                class="-mx-2.5"
                @click="toggleSort(column)"
              />
            </div>
          </template>
          <template v-if="sortable" #condition-header="{ column }">
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              label="Zustand"
              :icon="sortIcon(column)"
              class="-mx-2.5"
              @click="toggleSort(column)"
            />
          </template>
          <template #price-cell="{ row }">
            <span class="tabular-nums">{{
              formatEuro(row.original.price)
            }}</span>
          </template>
          <template #platform-cell="{ row }">
            <span class="capitalize">{{ row.original.platform }}</span>
          </template>
          <template #condition-cell="{ row }">
            {{ row.original.condition || "–" }}
          </template>
        </UTable>
      </div>
    </template>
  </UCollapsible>
</template>
