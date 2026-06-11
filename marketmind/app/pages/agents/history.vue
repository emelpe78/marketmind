<script setup lang="ts">
import { formatAiProvider, formatUsdCost } from "shared/format-agent";
import { formatDateTime } from "shared/format-datetime";

definePageMeta({ layout: "default" });

usePageHead(
  "Verlauf",
  "Letzte KI-Aufrufe mit Tokens, Kosten und Zeitstempel",
);

const { agents, history } = await useAgents();

const agentNameById = computed(() => {
  const map = new Map<number, string>();
  for (const agent of agents.value ?? []) {
    map.set(agent.id, agent.name);
  }
  return map;
});

const historyRows = computed(() =>
  (history.value ?? []).map((row) => ({
    ...row,
    agent_name:
      agentNameById.value.get(Number(row.agent_id)) ?? `Agent #${row.agent_id}`,
  })),
);
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-highlighted">Verlauf</h2>
      <p class="text-muted mt-1">
        Letzte KI-Aufrufe mit Tokens, Kosten und Zeitstempel
      </p>
    </div>

    <UCard
      v-if="historyRows.length"
      class="min-w-0"
      data-testid="agent-history"
    >
      <UTable
        :data="historyRows"
        :columns="[
          { accessorKey: 'agent_name', header: 'Agent' },
          { accessorKey: 'provider', header: 'Provider' },
          { accessorKey: 'tokens_used', header: 'Tokens' },
          { accessorKey: 'cost_usd', header: 'Kosten' },
          { accessorKey: 'created_at', header: 'Datum' },
        ]"
      >
        <template #provider-cell="{ row }">
          <span class="text-sm">
            {{
              formatAiProvider(
                (row.original as Record<string, unknown>).provider,
              )
            }}
          </span>
        </template>
        <template #cost_usd-cell="{ row }">
          <span class="tabular-nums text-sm">
            {{
              formatUsdCost(
                (row.original as Record<string, unknown>).cost_usd,
              )
            }}
          </span>
        </template>
        <template #created_at-cell="{ row }">
          <span class="tabular-nums text-sm">
            {{
              formatDateTime(
                (row.original as Record<string, unknown>).created_at,
              )
            }}
          </span>
        </template>
      </UTable>
    </UCard>

    <UAlert
      v-else
      color="neutral"
      variant="subtle"
      title="Noch keine Einträge"
      description="Sobald Feature-Agents oder der Prompt-Generator genutzt werden, erscheinen die Aufrufe hier."
    />
  </div>
</template>
