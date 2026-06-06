<script setup lang="ts">
const props = defineProps<{
  summary: string;
  platform?: "ebay" | "kleinanzeigen";
  platformLabel?: string;
}>();

const display = computed(() => renderMarkdownDocument(props.summary));
</script>

<template>
  <UCard :data-testid="platform ? `ai-summary-${platform}` : 'ai-summary'">
    <template #header>
      <div class="flex items-center gap-2 min-w-0">
        <UIcon name="i-lucide-sparkles" class="size-5 shrink-0 text-primary" />
        <h3 class="font-semibold text-highlighted truncate">
          {{ display.title ?? "KI-Zusammenfassung" }}
        </h3>
        <UBadge
          v-if="platformLabel"
          variant="subtle"
          color="neutral"
          class="shrink-0 capitalize"
        >
          {{ platformLabel }}
        </UBadge>
      </div>
    </template>

    <MarkdownContent :content="summary" />
  </UCard>
</template>
