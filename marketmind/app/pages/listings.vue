<script setup lang="ts">
definePageMeta({ layout: "default" });

const query = ref("");
const condition = ref("Gebraucht");
const extras = ref("");
const desiredPrice = ref<number | undefined>();
const activeTab = ref("kleinanzeigen");
const loading = ref(false);
const generated = ref<Record<string, unknown> | null>(null);
const toast = useToast();

const conditionOptions = ["Neu", "Gebraucht", "Defekt"];

async function generateListing() {
  if (!query.value) return;
  loading.value = true;
  try {
    generated.value = await $fetch("/api/listings/generate", {
      method: "POST",
      body: {
        query: query.value,
        platform: activeTab.value,
        condition: condition.value,
        extras: extras.value,
        desiredPrice: desiredPrice.value,
      },
    });
  } catch {
    toast.add({ title: "Generierung fehlgeschlagen", color: "error" });
  } finally {
    loading.value = false;
  }
}

async function saveListing() {
  if (!generated.value) return;
  await $fetch("/api/listings", {
    method: "POST",
    body: {
      query: query.value,
      platform: activeTab.value,
      title: generated.value.title,
      description: generated.value.description,
      keywords: generated.value.keywords,
      price_suggestion: generated.value.priceSuggestion,
    },
  });
  toast.add({ title: "Anzeige gespeichert", color: "success" });
}

function copyText(text: string) {
  navigator.clipboard.writeText(text);
  toast.add({ title: "Kopiert", color: "success" });
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-highlighted">Anzeigen-Generator</h2>
      <p class="text-muted mt-1">
        Plattform-optimierte Texte für eBay & Kleinanzeigen
      </p>
    </div>

    <UCard>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="Produktname" class="min-w-0 w-full">
          <UInput
            v-model="query"
            data-testid="listing-query"
            placeholder="RTX 3060 12GB"
          />
        </UFormField>
        <UFormField label="Zustand" class="min-w-0 w-full">
          <USelect
            v-model="condition"
            :items="conditionOptions"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Zusatzinfos" class="md:col-span-2">
          <UTextarea
            v-model="extras"
            placeholder="Zubehör, Mängel, Besonderheiten..."
          />
        </UFormField>
        <UFormField label="Wunsch-Verkaufspreis (€)">
          <UInput v-model.number="desiredPrice" type="number" />
        </UFormField>
      </div>
    </UCard>

    <UTabs
      v-model="activeTab"
      data-testid="listing-tabs"
      :items="[
        { label: 'Kleinanzeigen', value: 'kleinanzeigen' },
        { label: 'eBay', value: 'ebay' },
      ]"
    />

    <UButton
      data-testid="generate-listing"
      icon="i-lucide-sparkles"
      :loading="loading"
      @click="generateListing"
    >
      Anzeige generieren
    </UButton>

    <UCard v-if="generated">
      <div class="space-y-4">
        <UFormField label="Titel" class="w-full">
          <div class="flex w-full gap-2">
            <UInput v-model="generated.title" class="min-w-0 flex-1" />
            <UButton
              icon="i-lucide-copy"
              variant="outline"
              @click="copyText(String(generated.title))"
            />
          </div>
        </UFormField>
        <UFormField label="Beschreibung" class="w-full">
          <div class="flex w-full gap-2">
            <UTextarea
              v-model="generated.description"
              :rows="8"
              class="min-w-0 flex-1"
            />
            <UButton
              icon="i-lucide-copy"
              variant="outline"
              @click="copyText(String(generated.description))"
            />
          </div>
        </UFormField>
        <p v-if="generated.priceSuggestion" class="text-sm">
          Preis-Empfehlung: <strong>{{ generated.priceSuggestion }} €</strong>
        </p>
        <p v-if="generated.category" class="text-sm text-muted">
          Kategorie: {{ generated.category }}
        </p>
        <UButton variant="outline" @click="saveListing"> Speichern </UButton>
      </div>
    </UCard>
  </div>
</template>
