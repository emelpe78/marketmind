<script setup lang="ts">
definePageMeta({ layout: "default" });

const { data: agents, refresh } =
  await useFetch<Array<Record<string, unknown>>>("/api/agents");
const { data: prompts, refresh: refreshPrompts } = await useFetch<
  Array<Record<string, unknown>>
>("/api/prompt-library");
const { data: history } =
  await useFetch<Array<Record<string, unknown>>>("/api/agent-history");

const editingAgent = ref<Record<string, unknown> | null>(null);
const agentModalOpen = computed({
  get: () => editingAgent.value !== null,
  set: (open: boolean) => {
    if (!open) editingAgent.value = null;
  },
});
const promptDescription = ref("");
const generatedPrompt = ref("");
const loading = ref(false);
const toast = useToast();

async function saveAgent() {
  if (!editingAgent.value?.id) return;
  await $fetch(`/api/agents/${editingAgent.value.id}`, {
    method: "PUT",
    body: editingAgent.value,
  });
  await refresh();
  toast.add({ title: "Agent gespeichert", color: "success" });
  editingAgent.value = null;
}

async function generatePrompt() {
  if (!promptDescription.value) return;
  loading.value = true;
  try {
    const result = await $fetch<{ prompt: string }>(
      "/api/agents/generate-prompt",
      {
        method: "POST",
        body: { description: promptDescription.value },
      },
    );
    generatedPrompt.value = result.prompt;
  } catch {
    toast.add({ title: "Prompt-Generierung fehlgeschlagen", color: "error" });
  } finally {
    loading.value = false;
  }
}

async function savePromptToLibrary() {
  if (!generatedPrompt.value) return;
  await $fetch("/api/prompt-library", {
    method: "POST",
    body: {
      name: promptDescription.value.slice(0, 50),
      prompt: generatedPrompt.value,
      category: "Generiert",
    },
  });
  await refreshPrompts();
  toast.add({ title: "In Bibliothek gespeichert", color: "success" });
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-highlighted">Agent-Manager</h2>
      <p class="text-muted mt-1">
        KI-Agents konfigurieren und System-Prompts verwalten
      </p>
    </div>

    <div class="grid gap-4">
      <UCard v-for="agent in agents" :key="agent.id as number">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-semibold">
              {{ agent.name }}
            </h3>
            <p class="text-sm text-muted">
              {{ agent.type }} · Temp {{ agent.temperature }}
            </p>
          </div>
          <UButton
            data-testid="edit-agent"
            variant="outline"
            size="sm"
            @click="editingAgent = { ...agent }"
          >
            Bearbeiten
          </UButton>
        </div>
      </UCard>
    </div>

    <UModal v-model:open="agentModalOpen" title="Agent bearbeiten">
      <template v-if="editingAgent" #body>
        <div class="space-y-4 p-4">
          <UFormField label="Name">
            <UInput v-model="editingAgent.name" />
          </UFormField>
          <UFormField label="Modell">
            <UInput
              v-model="editingAgent.model"
              placeholder="Fallback: Default-Modell"
            />
          </UFormField>
          <UFormField label="System-Prompt">
            <UTextarea v-model="editingAgent.system_prompt" :rows="8" />
          </UFormField>
          <UFormField label="Temperatur">
            <USlider
              v-model="editingAgent.temperature"
              :min="0"
              :max="1"
              :step="0.1"
            />
          </UFormField>
          <UButton @click="saveAgent"> Speichern </UButton>
        </div>
      </template>
    </UModal>

    <UCard>
      <template #header>
        <h3 class="font-semibold">System-Prompt-Generator</h3>
      </template>
      <div class="space-y-4">
        <UFormField label="Beschreibe das Ziel des Agents">
          <UTextarea
            v-model="promptDescription"
            data-testid="prompt-description"
            :rows="3"
          />
        </UFormField>
        <UButton
          data-testid="generate-prompt"
          icon="i-lucide-sparkles"
          :loading="loading"
          @click="generatePrompt"
        >
          Prompt generieren
        </UButton>
        <UTextarea
          v-if="generatedPrompt"
          v-model="generatedPrompt"
          data-testid="generated-prompt"
          class="w-full"
          :rows="6"
        />
        <UButton
          v-if="generatedPrompt"
          variant="outline"
          @click="savePromptToLibrary"
        >
          In Bibliothek speichern
        </UButton>
      </div>
    </UCard>

    <UCard v-if="prompts?.length">
      <template #header>
        <h3 class="font-semibold">Prompt-Bibliothek</h3>
      </template>
      <UTable
        :data="prompts"
        :columns="[
          { accessorKey: 'name', header: 'Name' },
          { accessorKey: 'category', header: 'Kategorie' },
          { accessorKey: 'created_at', header: 'Erstellt' },
        ]"
      />
    </UCard>

    <UCard v-if="history?.length">
      <template #header>
        <h3 class="font-semibold">Verlauf</h3>
      </template>
      <UTable
        :data="history.slice(0, 10)"
        :columns="[
          { accessorKey: 'agent_id', header: 'Agent' },
          { accessorKey: 'tokens_used', header: 'Tokens' },
          { accessorKey: 'cost_usd', header: 'Kosten ($)' },
          { accessorKey: 'created_at', header: 'Datum' },
        ]"
      />
    </UCard>
  </div>
</template>
