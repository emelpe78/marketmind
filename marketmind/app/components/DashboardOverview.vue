<script setup lang="ts">
definePageMeta({ layout: "default" });

const { data: dashboard, pending } = await useFetch("/api/dashboard");
</script>

<template>
  <div v-if="pending" class="text-muted">Lade Dashboard...</div>
  <div v-else class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard>
        <p class="text-sm text-muted">Letzte Suchen</p>
        <p class="text-2xl font-bold text-highlighted">
          {{ dashboard?.recentSearches?.length ?? 0 }}
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
          {{ (dashboard?.inventorySummary?.totalProfit ?? 0).toFixed(2) }} €
        </p>
      </UCard>
      <UCard>
        <p class="text-sm text-muted">Token-Kosten</p>
        <p class="text-2xl font-bold text-highlighted">
          ${{ (dashboard?.tokenCosts ?? 0).toFixed(4) }}
        </p>
      </UCard>
    </div>

    <UCard v-if="dashboard?.recentSearches?.length">
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
      <UButton to="/flipping" icon="i-lucide-calculator" variant="outline">
        Flipping berechnen
      </UButton>
    </div>
  </div>
</template>
