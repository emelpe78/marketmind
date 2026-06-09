<script setup lang="ts">
const props = defineProps<{
  to?: string;
  testId?: string;
}>();

const linkClass =
  "block rounded-lg transition-colors hover:bg-elevated/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
</script>

<template>
  <NuxtLink
    v-if="props.to"
    :to="props.to"
    :class="linkClass"
    :data-testid="testId"
  >
    <UCard :ui="{ root: 'h-full cursor-pointer' }">
      <slot />
    </UCard>
  </NuxtLink>
  <UCard v-else :data-testid="testId">
    <slot />
  </UCard>
</template>
