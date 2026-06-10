<script setup lang="ts">
import {
  WORKFLOW_HANDOFF_BANNER_LABELS,
  type WorkflowHandoffSource,
} from "shared/workflow-handoff";

const props = defineProps<{
  source?: WorkflowHandoffSource;
}>();

const dismissed = ref(false);

watch(
  () => props.source,
  () => {
    dismissed.value = false;
  },
);

const description = computed(() =>
  props.source ? WORKFLOW_HANDOFF_BANNER_LABELS[props.source] : "",
);

function dismiss() {
  dismissed.value = true;
}
</script>

<template>
  <UAlert
    v-if="source && !dismissed"
    color="primary"
    variant="subtle"
    icon="i-lucide-arrow-right-left"
    title="Workflow-Übergang"
    :description="description"
    data-testid="workflow-handoff-banner"
    :actions="[
      {
        label: 'Schließen',
        color: 'neutral',
        variant: 'solid',
        onClick: dismiss,
      },
    ]"
  />
</template>
