<script setup lang="ts">
definePageMeta({ layout: "default" });

interface SavedResearchListItem {
  id: number;
  title: string;
  query: string;
  platform: string;
  results: unknown[];
  createdAt: string;
  updatedAt: string;
}

const { data: dashboard, pending, refresh } = await useFetch("/api/dashboard");
const toast = useToast();

const platformLabels: Record<string, string> = {
  ebay: "eBay",
  kleinanzeigen: "Kleinanzeigen",
  both: "Beide",
};

const editItem = ref<SavedResearchListItem | null>(null);
const editModalOpen = computed({
  get: () => editItem.value !== null,
  set: (open: boolean) => {
    if (!open) editItem.value = null;
  },
});
const editTitle = ref("");

const deleteItem = ref<SavedResearchListItem | null>(null);
const deleteModalOpen = computed({
  get: () => deleteItem.value !== null,
  set: (open: boolean) => {
    if (!open) deleteItem.value = null;
  },
});

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("de-DE");
}

function openEditModal(item: SavedResearchListItem) {
  editItem.value = item;
  editTitle.value = item.title;
}

function openDeleteModal(item: SavedResearchListItem) {
  deleteItem.value = item;
}

async function confirmEdit() {
  if (!editItem.value) return;
  if (!editTitle.value.trim()) {
    toast.add({ title: "Titel fehlt", color: "warning" });
    return;
  }

  try {
    await $fetch(`/api/saved-researches/${editItem.value.id}`, {
      method: "PUT",
      body: { title: editTitle.value.trim() },
    });
    editItem.value = null;
    await refresh();
    toast.add({ title: "Recherche aktualisiert", color: "success" });
  } catch {
    toast.add({ title: "Speichern fehlgeschlagen", color: "error" });
  }
}

async function confirmDelete() {
  if (!deleteItem.value) return;

  try {
    await $fetch(`/api/saved-researches/${deleteItem.value.id}`, {
      method: "DELETE",
    });
    deleteItem.value = null;
    await refresh();
    toast.add({ title: "Recherche gelöscht", color: "success" });
  } catch {
    toast.add({ title: "Löschen fehlgeschlagen", color: "error" });
  }
}
</script>

<template>
  <div v-if="pending" class="text-muted">Lade Dashboard...</div>
  <div v-else class="space-y-6">
    <UAlert
      v-if="dashboard && !dashboard.aiConfigured"
      data-testid="ai-setup-hint"
      color="warning"
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

    <UCard
      v-if="dashboard?.savedResearches?.length"
      data-testid="saved-researches"
    >
      <template #header>
        <h3 class="font-semibold">Gespeicherte Recherchen</h3>
      </template>
      <div class="space-y-3">
        <div
          v-for="item in dashboard.savedResearches"
          :key="item.id"
          class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-muted p-4"
        >
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <NuxtLink
                :to="`/research/saved/${item.id}`"
                class="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                data-testid="saved-research-link"
              >
                <span>{{ item.title }}</span>
                <UIcon
                  name="i-lucide-external-link"
                  class="size-4 shrink-0 opacity-80"
                />
              </NuxtLink>
              <UBadge variant="subtle" color="neutral">
                {{ platformLabels[item.platform] ?? item.platform }}
              </UBadge>
            </div>
            <p class="text-sm text-muted mt-1">
              {{ item.query }} · {{ item.results.length }} Ergebnisse ·
              {{ formatDate(item.updatedAt) }}
            </p>
          </div>
          <div class="flex gap-2">
            <UButton
              size="sm"
              variant="outline"
              icon="i-lucide-pencil"
              data-testid="edit-saved-research"
              @click="openEditModal(item)"
            />
            <UButton
              size="sm"
              color="error"
              variant="ghost"
              icon="i-lucide-trash"
              data-testid="delete-saved-research"
              @click="openDeleteModal(item)"
            />
          </div>
        </div>
      </div>
    </UCard>

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
      <UButton to="/flipping" icon="i-lucide-calculator" variant="outline">
        Flipping berechnen
      </UButton>
    </div>

    <UModal
      v-model:open="editModalOpen"
      :title="
        editItem ? `Bearbeiten: ${editItem.title}` : 'Recherche bearbeiten'
      "
    >
      <template v-if="editItem" #body>
        <div class="space-y-4 p-4">
          <UFormField label="Titel" required>
            <UInput
              v-model="editTitle"
              data-testid="edit-saved-research-title"
              autofocus
            />
          </UFormField>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" @click="editItem = null">
              Abbrechen
            </UButton>
            <UButton
              data-testid="confirm-edit-saved-research"
              @click="confirmEdit"
            >
              Speichern
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="deleteModalOpen" title="Recherche löschen?">
      <template v-if="deleteItem" #body>
        <div class="space-y-4 p-4">
          <p class="text-sm text-muted">
            „{{ deleteItem.title }}“ wirklich löschen? Suchergebnisse und
            KI-Analyse gehen dabei verloren.
          </p>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" @click="deleteItem = null">
              Abbrechen
            </UButton>
            <UButton
              color="error"
              data-testid="confirm-delete-saved-research"
              @click="confirmDelete"
            >
              Löschen
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
