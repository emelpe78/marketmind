<script setup lang="ts">
definePageMeta({ layout: "default" });

const { dashboard, pending } = await useDashboard();
</script>

<template>
  <div v-if="pending" class="text-muted">Lade Dashboard...</div>
  <div v-else class="space-y-6">
    <UAlert
      v-if="dashboard && !dashboard.aiConfigured"
      data-testid="ai-setup-hint"
      color="warning"
      variant="subtle"
      icon="i-lucide-sparkles"
      title="KI-Provider konfigurieren"
      description="Nach dem ersten Start oder einem Datenbank-Reset sind die KI-Funktionen noch nicht nutzbar. Hinterlege unter Einstellungen → API entweder OpenRouter oder eine lokale OpenAI-kompatible KI."
    >
      <template #actions>
        <UButton to="/settings" size="sm" color="neutral" variant="solid">
          Zu den Einstellungen
        </UButton>
      </template>
    </UAlert>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard>
        <p class="text-sm text-muted">Gespeicherte Recherchen</p>
        <p class="text-2xl font-bold text-highlighted">
          {{ dashboard?.savedResearches?.length ?? 0 }}
        </p>
      </UCard>
      <UCard>
        <p class="text-sm text-muted">Watchlist-Alerts</p>
        <p class="text-2xl font-bold text-warning">
          {{ dashboard?.watchlistAlerts ?? 0 }}
        </p>
      </UCard>
      <UCard>
        <p class="text-sm text-muted">Gesamtgewinn</p>
        <p class="text-2xl font-bold text-success">
          {{ formatEuro(dashboard?.inventorySummary?.totalProfit ?? 0) }}
        </p>
      </UCard>
      <UCard>
        <p class="text-sm text-muted">Token-Kosten</p>
        <p class="text-2xl font-bold text-highlighted">
          ${{ (dashboard?.tokenCosts ?? 0).toFixed(4) }}
        </p>
      </UCard>
    </div>

    <UCard v-if="dashboard?.recentSearches?.length" class="min-w-0">
      <template #header>
        <h3 class="font-semibold">Letzte Suchen</h3>
      </template>
      <UTable
        :data="dashboard.recentSearches"
        :columns="[
          { accessorKey: 'query', header: 'Suchbegriff' },
          { accessorKey: 'platform', header: 'Plattform' },
          { accessorKey: 'results_count', header: 'Ergebnisse' },
          { accessorKey: 'timestamp', header: 'Datum' },
        ]"
      />
    </UCard>

    <div class="flex gap-3">
      <UButton to="/research" icon="i-lucide-search"> Preisrecherche </UButton>
      <UButton to="/listings" icon="i-lucide-file-text" variant="outline">
        Anzeige erstellen
      </UButton>
      <UButton to="/flipping" icon="i-lucide-banknote" variant="outline">
        Flipping analysieren
      </UButton>
    </div>
  </div>
</template>
