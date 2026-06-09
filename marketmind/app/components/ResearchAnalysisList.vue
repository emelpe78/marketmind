<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";
import {
  renderMarkdownDocument,
  stripPlatformSuffixFromTitle,
} from "~/utils/render-markdown";

export interface ResearchAnalysisListItem {
  summary: string;
  platform?: "ebay" | "kleinanzeigen";
  platformLabel?: string;
}

const props = defineProps<{
  items: ResearchAnalysisListItem[];
}>();

function itemValue(item: ResearchAnalysisListItem, index: number): string {
  return item.platform ?? `analysis-${index}`;
}

const accordionItems = computed<AccordionItem[]>(() =>
  props.items.map((item, index) => {
    const value = itemValue(item, index);
    const display = renderMarkdownDocument(item.summary);
    return {
      label:
        stripPlatformSuffixFromTitle(display.title) ?? "KI-Zusammenfassung",
      icon: "i-lucide-sparkles",
      value,
      slot: value,
    };
  }),
);

const itemsByValue = computed(() => {
  const map = new Map<string, ResearchAnalysisListItem>();
  for (const [index, item] of props.items.entries()) {
    map.set(itemValue(item, index), item);
  }
  return map;
});

function lookupItem(
  value: string | number | undefined,
): ResearchAnalysisListItem | undefined {
  if (value === undefined) return undefined;
  return itemsByValue.value.get(String(value));
}
</script>

<template>
  <UAccordion
    v-if="items.length"
    type="multiple"
    :items="accordionItems"
    :default-value="[]"
    :unmount-on-hide="false"
    data-testid="research-analysis-accordion"
    class="rounded-lg border border-muted bg-elevated"
    :ui="{
      item: 'border-muted px-4',
      body: 'pb-4',
    }"
  >
    <template #default="{ item }">
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <span class="truncate font-semibold text-highlighted">
          {{ item.label }}
        </span>
        <UBadge
          v-if="lookupItem(item.value)?.platformLabel"
          variant="subtle"
          color="neutral"
          class="shrink-0 capitalize"
        >
          {{ lookupItem(item.value)?.platformLabel }}
        </UBadge>
      </div>
    </template>

    <template
      v-for="entry in accordionItems"
      :key="`${entry.value}-body`"
      #[`${entry.slot}-body`]
    >
      <div
        v-if="lookupItem(entry.value)"
        :data-testid="
          lookupItem(entry.value)?.platform
            ? `ai-summary-${lookupItem(entry.value)?.platform}`
            : 'ai-summary'
        "
      >
        <AnalysisSectionTabs :content="lookupItem(entry.value)!.summary" />
      </div>
    </template>
  </UAccordion>
</template>
