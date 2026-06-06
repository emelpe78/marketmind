<script setup lang="ts">
import { renderMarkdownDocument } from "~/utils/render-markdown";

const props = withDefaults(
  defineProps<{
    content: string;
    title?: string | null;
    showTitle?: boolean;
  }>(),
  {
    title: undefined,
    showTitle: false,
  },
);

const display = computed(() => renderMarkdownDocument(props.content));

const heading = computed(
  () => props.title ?? (props.showTitle ? display.value.title : null),
);
</script>

<template>
  <div v-if="display.html" class="markdown-content min-w-0 space-y-3">
    <h3 v-if="heading" class="text-base font-semibold text-highlighted">
      {{ heading }}
    </h3>
    <div v-html="display.html" />
  </div>
</template>
