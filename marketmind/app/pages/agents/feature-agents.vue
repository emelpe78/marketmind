<script setup lang="ts">
import { isMetaAgent, PROMPT_GENERATOR_TEMPERATURE } from "shared/agent-meta";
import { formatAgentUsageMode, getAgentUsage } from "shared/agent-usage";

definePageMeta({ layout: "default" });

usePageHead(
  "Feature-Agents",
  "KI-Agents für Preisrecherche, Anzeigen, Flipping und Prompt-Generierung",
);

interface Agent {
  id: number;
  name: string;
  type: string;
  model?: string;
  system_prompt: string;
  temperature: number;
  call_count?: number;
  total_cost_usd?: number;
}

const {
  agents,
  saveAgent: persistAgent,
  formatTemperature,
  formatUsdCost,
  formatCallsLabel,
} = await useAgents();

const editingAgent = ref<Agent | null>(null);
const agentModalOpen = computed({
  get: () => editingAgent.value !== null,
  set: (open: boolean) => {
    if (!open) editingAgent.value = null;
  },
});
const toast = useToast();

async function saveAgent() {
  if (!editingAgent.value?.id) return;
  await persistAgent(editingAgent.value);
  toast.add({ title: "Agent gespeichert", color: "success" });
  editingAgent.value = null;
}

const temperatureMarks = [0, 0.2, 0.4, 0.6, 0.8, 1];

const agentsWithUsage = computed(() =>
  (agents.value ?? []).map((agent) => ({
    agent,
    usage: getAgentUsage(agent.type),
  })),
);
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-highlighted">Feature-Agents</h2>
      <p class="text-muted mt-1">
        KI-Agents für Preisrecherche, Anzeigen, Flipping und Prompt-Generierung
      </p>
    </div>

    <div class="grid gap-4">
      <UCard
        v-for="{ agent, usage } in agentsWithUsage"
        :key="agent.id as number"
      >
        <div class="flex justify-between items-start">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="font-semibold">
                {{ agent.name }}
              </h3>
              <UBadge
                v-if="isMetaAgent(agent.type)"
                color="neutral"
                variant="subtle"
                data-testid="meta-agent-badge"
              >
                Meta-Agent
              </UBadge>
            </div>
            <p class="text-sm text-muted">
              <template v-if="isMetaAgent(agent.type)">
                Meta-Agent · Temp
                {{ formatTemperature(PROMPT_GENERATOR_TEMPERATURE) }} (fest)
              </template>
              <template v-else>
                {{ agent.type }} · Temp
                {{ formatTemperature(agent.temperature) }}
              </template>
            </p>
            <p class="text-sm text-muted mt-0.5">
              {{ formatCallsLabel(agent.call_count) }} · Kosten
              {{ formatUsdCost(agent.total_cost_usd) }}
            </p>
            <div
              v-if="usage"
              class="mt-3 space-y-1 text-sm"
              :data-testid="`agent-usage-${agent.type}`"
            >
              <p class="text-muted">
                <span class="text-default font-medium">Feature:</span>
                <NuxtLink
                  :to="usage.route"
                  class="text-primary hover:underline ml-1"
                >
                  {{ usage.feature }}
                </NuxtLink>
              </p>
              <p class="text-muted">
                <span class="text-default font-medium">Auslöser:</span>
                {{ usage.trigger }}
              </p>
              <p class="text-muted">
                <span class="text-default font-medium">KI-Modus:</span>
                {{ formatAgentUsageMode(usage.mode) }}
              </p>
              <p v-if="usage.note" class="text-xs text-muted italic">
                {{ usage.note }}
              </p>
            </div>
          </div>
          <UButton
            v-if="!isMetaAgent(agent.type)"
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
          <UFormField
            v-if="!isMetaAgent(editingAgent.type)"
            label="System-Prompt"
          >
            <UTextarea v-model="editingAgent.system_prompt" :rows="8" />
          </UFormField>
          <UAlert
            v-else
            color="neutral"
            variant="subtle"
            title="Meta-Agent"
            description="System-Prompt und Temperatur sind für diesen Agent im Code fest definiert und können hier nicht bearbeitet werden."
          />
          <UFormField
            v-if="!isMetaAgent(editingAgent.type)"
            label="Temperatur"
            class="mt-6! mb-6!"
          >
            <div class="space-y-4 py-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted">Aktueller Wert</span>
                <span
                  class="font-semibold tabular-nums text-highlighted"
                  data-testid="agent-temperature-value"
                >
                  {{ formatTemperature(editingAgent.temperature) }}
                </span>
              </div>
              <USlider
                v-model="editingAgent.temperature"
                :min="0"
                :max="1"
                :step="0.1"
              />
              <div class="flex justify-between text-xs text-muted tabular-nums">
                <span v-for="mark in temperatureMarks" :key="mark">
                  {{ formatTemperature(mark) }}
                </span>
              </div>
            </div>
          </UFormField>
          <UButton @click="saveAgent"> Speichern </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
