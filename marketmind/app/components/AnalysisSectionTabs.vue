<script setup lang="ts">
import { parseMarkdownSections } from "~/utils/render-markdown";

const props = defineProps<{
  content: string;
}>();

const parsed = computed(() => parseMarkdownSections(props.content));
const activeTab = ref("0");

const tabItems = computed(() =>
  parsed.value.sections.map((section, index) => ({
    label: section.label,
    value: String(index),
  })),
);

const activeSection = computed(() => {
  const index = Number(activeTab.value);
  return parsed.value.sections[index];
});

watch(
  tabItems,
  (items) => {
    if (!items.some((item) => item.value === activeTab.value)) {
      activeTab.value = items[0]?.value ?? "0";
    }
  },
  { immediate: true },
);
</script>

<template>
  <div v-if="parsed.hasSections" class="min-w-0">
    <div
      v-if="parsed.preambleHtml"
      class="markdown-content mb-4 space-y-2 text-sm"
      v-html="parsed.preambleHtml"
    />

    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
      <UTabs
        v-model="activeTab"
        orientation="vertical"
        variant="link"
        color="neutral"
        :content="false"
        :items="tabItems"
        class="w-full shrink-0 sm:w-56"
        data-testid="analysis-section-tabs"
        :ui="{
          root: 'items-stretch',
          list: 'w-full',
          trigger: 'justify-start text-left',
        }"
      />

      <div
        v-if="activeSection"
        class="markdown-content min-w-0 flex-1 space-y-2 rounded-lg border border-default bg-elevated/30 p-4"
        data-testid="analysis-section-content"
      >
        <h3 class="text-sm font-semibold text-highlighted">
          {{ activeSection.label }}
        </h3>
        <div v-html="activeSection.html" />
      </div>
    </div>
  </div>

  <MarkdownContent v-else :content="content" />
</template>
