<script setup lang="ts">
definePageMeta({ layout: "default" });

const { data: items, refresh } =
  await useFetch<Array<Record<string, unknown>>>("/api/watchlist");
const loading = ref(false);
const toast = useToast();

const platformLabels: Record<string, string> = {
  kleinanzeigen: "Kleinanzeigen",
  ebay: "eBay",
};

function getPlatformLabel(item: Record<string, unknown>): string | null {
  const platform =
    detectPlatformFromUrl(String(item.url ?? "")) ??
    (item.platform === "ebay" || item.platform === "kleinanzeigen"
      ? item.platform
      : null);
  return platform ? (platformLabels[platform] ?? null) : null;
}

const newItem = ref({
  title: "",
  url: "",
  target_price: undefined as number | undefined,
});

const editItem = ref<Record<string, unknown> | null>(null);
const editModalOpen = computed({
  get: () => editItem.value !== null,
  set: (open: boolean) => {
    if (!open) editItem.value = null;
  },
});
const editForm = reactive({
  title: "",
  url: "",
  target_price: undefined as number | undefined,
});

const editPlatformLabel = computed(() => {
  const platform = detectPlatformFromUrl(editForm.url);
  return platform ? (platformLabels[platform] ?? null) : null;
});

const deleteItem = ref<Record<string, unknown> | null>(null);
const deleteModalOpen = computed({
  get: () => deleteItem.value !== null,
  set: (open: boolean) => {
    if (!open) deleteItem.value = null;
  },
});

function openEditModal(item: Record<string, unknown>) {
  editItem.value = item;
  editForm.title = String(item.title ?? "");
  editForm.url = String(item.url ?? "");
  editForm.target_price =
    item.target_price != null ? Number(item.target_price) : undefined;
}

async function saveEdit() {
  if (!editItem.value?.id) return;
  if (!editForm.title.trim()) {
    toast.add({
      title: "Titel fehlt",
      description: "Bitte einen Titel eingeben.",
      color: "warning",
    });
    return;
  }

  const url = editForm.url.trim() || null;

  try {
    await $fetch(`/api/watchlist/${editItem.value.id}`, {
      method: "PUT",
      body: {
        title: editForm.title.trim(),
        url,
        target_price: editForm.target_price ?? null,
        current_price: editItem.value.current_price ?? null,
        alert_active: editItem.value.alert_active ?? 1,
        status: editItem.value.status ?? "aktiv",
      },
    });
    editItem.value = null;
    await refresh();
    toast.add({ title: "Eintrag aktualisiert", color: "success" });
  } catch {
    toast.add({
      title: "Speichern fehlgeschlagen",
      color: "error",
    });
  }
}

async function addItem() {
  if (!newItem.value.title) return;
  await $fetch("/api/watchlist", {
    method: "POST",
    body: {
      title: newItem.value.title,
      url: newItem.value.url.trim() || null,
      target_price: newItem.value.target_price,
    },
  });
  newItem.value = {
    title: "",
    url: "",
    target_price: undefined,
  };
  await refresh();
  toast.add({ title: "Artikel hinzugefügt", color: "success" });
}

async function scrapeItem(id: number) {
  loading.value = true;
  try {
    await $fetch(`/api/watchlist/${id}/scrape`, { method: "POST" });
    await refresh();
  } finally {
    loading.value = false;
  }
}

async function scrapeAll() {
  loading.value = true;
  try {
    await $fetch("/api/watchlist/scrape-all", { method: "POST" });
    await refresh();
    toast.add({ title: "Alle aktualisiert", color: "success" });
  } finally {
    loading.value = false;
  }
}

function openDeleteModal(item: Record<string, unknown>) {
  deleteItem.value = item;
}

async function confirmDelete() {
  if (!deleteItem.value?.id) return;

  try {
    await $fetch(`/api/watchlist/${deleteItem.value.id}`, { method: "DELETE" });
    deleteItem.value = null;
    await refresh();
    toast.add({ title: "Eintrag gelöscht", color: "success" });
  } catch {
    toast.add({ title: "Löschen fehlgeschlagen", color: "error" });
  }
}

function currentPriceClass(item: Record<string, unknown>): string {
  const current = Number(item.current_price);
  const target = Number(item.target_price);
  if (!Number.isFinite(current) || !Number.isFinite(target)) return "";
  return current <= target
    ? "text-success font-medium"
    : "text-error font-medium";
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-start">
      <div>
        <h2 class="text-2xl font-bold text-highlighted">Watchlist</h2>
        <p class="text-muted mt-1">
          Artikel beobachten und Preisalarme erhalten
        </p>
      </div>
      <UButton
        data-testid="scrape-all"
        icon="i-lucide-refresh-cw"
        variant="outline"
        :loading="loading"
        @click="scrapeAll"
      >
        Alle aktualisieren
      </UButton>
    </div>

    <UCard>
      <div class="grid md:grid-cols-4 gap-4">
        <UFormField label="Titel">
          <UInput v-model="newItem.title" data-testid="watchlist-title" />
        </UFormField>
        <UFormField label="URL">
          <UInput v-model="newItem.url" />
        </UFormField>
        <UFormField label="Zielpreis (€)">
          <UInput v-model.number="newItem.target_price" type="number" />
        </UFormField>
        <UFormField label="&nbsp;">
          <UButton data-testid="add-watchlist" block @click="addItem">
            Hinzufügen
          </UButton>
        </UFormField>
      </div>
    </UCard>

    <div class="space-y-3">
      <UCard
        v-for="item in items"
        :key="item.id as number"
        :class="{ 'ring-2 ring-warning': item.alertTriggered }"
      >
        <div class="flex justify-between items-center">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="font-semibold">
                <a
                  v-if="item.url"
                  :href="String(item.url)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 text-primary hover:underline"
                  data-testid="watchlist-title-link"
                >
                  <span>{{ item.title }}</span>
                  <UIcon
                    name="i-lucide-external-link"
                    class="size-4 shrink-0 opacity-80"
                  />
                </a>
                <span v-else>{{ item.title }}</span>
              </h3>
              <UBadge
                v-if="getPlatformLabel(item)"
                variant="subtle"
                color="neutral"
                data-testid="watchlist-platform"
              >
                {{ getPlatformLabel(item) }}
              </UBadge>
              <UBadge
                v-if="item.alertTriggered"
                data-testid="price-alert"
                color="warning"
              >
                Preisalarm!
              </UBadge>
            </div>
            <p class="text-sm text-muted">
              Aktuell:
              <span :class="currentPriceClass(item)">
                {{
                  item.current_price != null
                    ? formatEuro(item.current_price)
                    : "–"
                }}
              </span>
              · Ziel:
              {{
                item.target_price != null ? formatEuro(item.target_price) : "–"
              }}
            </p>
          </div>
          <div class="flex gap-2">
            <UButton
              size="sm"
              variant="outline"
              icon="i-lucide-pencil"
              data-testid="edit-watchlist"
              @click="openEditModal(item)"
            />
            <UButton
              size="sm"
              variant="outline"
              icon="i-lucide-refresh-cw"
              :loading="loading"
              @click="scrapeItem(item.id as number)"
            />
            <UButton
              size="sm"
              color="error"
              variant="ghost"
              icon="i-lucide-trash"
              data-testid="delete-watchlist"
              @click="openDeleteModal(item)"
            />
          </div>
        </div>
      </UCard>
    </div>

    <UModal
      v-model:open="editModalOpen"
      :title="editItem ? `Bearbeiten: ${editItem.title}` : 'Eintrag bearbeiten'"
    >
      <template v-if="editItem" #body>
        <div class="space-y-4 p-4">
          <UFormField label="Titel" required>
            <UInput
              v-model="editForm.title"
              data-testid="edit-watchlist-title"
              autofocus
            />
          </UFormField>
          <UFormField label="URL">
            <UInput v-model="editForm.url" data-testid="edit-watchlist-url" />
          </UFormField>
          <p v-if="editPlatformLabel" class="text-sm text-muted">
            Plattform:
            <UBadge variant="subtle" color="neutral" class="ml-1">
              {{ editPlatformLabel }}
            </UBadge>
          </p>
          <p v-else-if="editForm.url.trim()" class="text-sm text-warning">
            Plattform konnte aus der URL nicht erkannt werden.
          </p>
          <UFormField label="Zielpreis (€)">
            <UInput
              v-model.number="editForm.target_price"
              data-testid="edit-watchlist-target-price"
              type="number"
              min="0"
              step="0.01"
            />
          </UFormField>
          <p v-if="editItem.current_price != null" class="text-sm text-muted">
            Aktueller Preis:
            <span :class="currentPriceClass(editItem)" class="font-medium">
              {{ formatEuro(editItem.current_price) }}
            </span>
            (wird beim Aktualisieren neu ermittelt)
          </p>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" @click="editItem = null">
              Abbrechen
            </UButton>
            <UButton data-testid="confirm-edit-watchlist" @click="saveEdit">
              Speichern
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="deleteModalOpen" title="Eintrag löschen?">
      <template v-if="deleteItem" #body>
        <div class="space-y-4 p-4">
          <p>
            „{{ deleteItem.title }}“ wirklich aus der Watchlist entfernen? Die
            Preishistorie wird ebenfalls gelöscht.
          </p>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" @click="deleteItem = null">
              Abbrechen
            </UButton>
            <UButton
              color="error"
              data-testid="confirm-delete-watchlist"
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
