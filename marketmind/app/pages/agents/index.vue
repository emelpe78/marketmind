<script setup lang="ts">
definePageMeta({ layout: "default" });

usePageHead("Feature-Agents");

await navigateTo("/agents/feature-agents", { replace: true });
</script>
