<script setup lang="ts">
definePageMeta({ layout: "default" });

const { data: items, refresh } =
  await useFetch<Array<Record<string, unknown>>>("/api/watchlist");
const loading = ref(false);
const toast = useToast();

const newItem = ref({
  title: "",
  url: "",
  platform: "kleinanzeigen",
  target_price: undefined as number | undefined,
});

async function addItem() {
  if (!newItem.value.title) return;
  await $fetch("/api/watchlist", { method: "POST", body: newItem.value });
  newItem.value = {
    title: "",
    url: "",
    platform: "kleinanzeigen",
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

async function removeItem(id: number) {
  await $fetch(`/api/watchlist/${id}`, { method: "DELETE" });
  await refresh();
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
            <div class="flex items-center gap-2">
              <h3 class="font-semibold">
                {{ item.title }}
              </h3>
              <UBadge
                v-if="item.alertTriggered"
                data-testid="price-alert"
                color="warning"
              >
                Preisalarm!
              </UBadge>
            </div>
            <p class="text-sm text-muted">
              Aktuell: {{ item.current_price ?? "–" }} € · Ziel:
              {{ item.target_price ?? "–" }} €
            </p>
          </div>
          <div class="flex gap-2">
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
              @click="removeItem(item.id as number)"
            />
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
