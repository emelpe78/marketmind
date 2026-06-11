<script setup lang="ts">
const { state } = useAiStatus();
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 -translate-y-1"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-1"
  >
    <div
      v-if="state.active"
      data-testid="ai-status-bar"
      class="rounded-lg border border-muted bg-elevated px-4 py-3 space-y-2"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div class="flex items-center gap-3 min-w-0">
        <UIcon
          name="i-lucide-sparkles"
          class="size-4 shrink-0 text-primary animate-pulse"
          aria-hidden="true"
        />
        <span class="text-sm text-default truncate">{{ state.message }}</span>
      </div>
      <UProgress
        :model-value="state.progress"
        animation="carousel"
        size="xs"
        color="primary"
      />
    </div>
  </Transition>
</template>
