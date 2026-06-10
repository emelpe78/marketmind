<script setup lang="ts">
import type { InventoryCreatePrefill } from "shared/inventory-types";
import type { InventoryPlatform } from "shared/detect-platform";
import {
  INVENTORY_PLATFORM_OPTIONS,
  useInventory,
} from "~/composables/useInventory";

export type { InventoryCreatePrefill };

const open = defineModel<boolean>("open", { default: false });

const props = defineProps<{
  titleSuffix?: string;
  prefill?: InventoryCreatePrefill;
}>();

const emit = defineEmits<{
  created: [];
}>();

const toast = useToast();
const { createItem, todayIsoDate, normalizeInventoryPlatform } =
  await useInventory();

const form = reactive({
  title: "",
  buy_price: undefined as number | undefined,
  buy_platform: "kleinanzeigen" as InventoryPlatform,
  buy_date: "",
  sell_price: undefined as number | undefined,
  sell_platform: "kleinanzeigen" as InventoryPlatform,
  notes: "",
});

const saving = ref(false);

const modalTitle = computed(() =>
  props.titleSuffix
    ? `Ins Inventar aufnehmen: ${props.titleSuffix}`
    : "Ins Inventar aufnehmen",
);

function resetForm(prefill: InventoryCreatePrefill = {}) {
  form.title = prefill.title ?? "";
  form.buy_price = prefill.buy_price;
  form.buy_platform = prefill.buy_platform ?? "kleinanzeigen";
  form.buy_date = prefill.buy_date ?? todayIsoDate();
  form.sell_price = prefill.sell_price;
  form.sell_platform = prefill.sell_platform ?? "kleinanzeigen";
  form.notes = prefill.notes ?? "";
}

watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) resetForm(props.prefill);
  },
);

watch(
  () => props.prefill,
  (prefill) => {
    if (open.value) resetForm(prefill);
  },
  { deep: true },
);

async function confirmCreate() {
  if (!form.title.trim()) {
    toast.add({
      title: "Titel fehlt",
      description: "Bitte einen Titel eingeben.",
      color: "warning",
    });
    return;
  }

  saving.value = true;
  try {
    await createItem({
      title: form.title.trim(),
      buy_price: form.buy_price ?? null,
      buy_platform: normalizeInventoryPlatform(form.buy_platform),
      buy_date: form.buy_date || null,
      sell_price: form.sell_price ?? null,
      sell_platform: normalizeInventoryPlatform(form.sell_platform),
      sell_date: null,
      status: "gekauft",
      notes: form.notes.trim() || null,
    });
    open.value = false;
    emit("created");
    toast.add({ title: "Artikel ins Inventar aufgenommen", color: "success" });
  } catch {
    toast.add({
      title: "Inventar-Eintrag konnte nicht angelegt werden",
      color: "error",
    });
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <UModal v-model:open="open" :title="modalTitle">
    <template #body>
      <div class="space-y-4 p-4">
        <UFormField label="Titel" required>
          <UInput
            v-model="form.title"
            data-testid="inventory-create-title"
            autofocus
          />
        </UFormField>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UFormField label="Einkaufspreis (€)">
            <UInput
              v-model.number="form.buy_price"
              data-testid="inventory-create-buy-price"
              type="number"
              min="0"
              step="0.01"
            />
          </UFormField>
          <UFormField label="Einkaufsdatum">
            <UInput
              v-model="form.buy_date"
              data-testid="inventory-create-buy-date"
              type="date"
            />
          </UFormField>
          <UFormField label="Einkaufsplattform">
            <USelect
              v-model="form.buy_platform"
              :items="INVENTORY_PLATFORM_OPTIONS"
              value-key="value"
              data-testid="inventory-create-buy-platform"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Ziel-Verkaufspreis (€)">
            <UInput
              v-model.number="form.sell_price"
              data-testid="inventory-create-sell-price"
              type="number"
              min="0"
              step="0.01"
            />
          </UFormField>
          <UFormField label="Verkaufsplattform" class="sm:col-span-2">
            <USelect
              v-model="form.sell_platform"
              :items="INVENTORY_PLATFORM_OPTIONS"
              value-key="value"
              data-testid="inventory-create-sell-platform"
              class="w-full"
            />
          </UFormField>
        </div>
        <UFormField label="Notizen">
          <UTextarea
            v-model="form.notes"
            data-testid="inventory-create-notes"
            :rows="6"
          />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton variant="outline" @click="open = false">Abbrechen</UButton>
          <UButton
            data-testid="confirm-inventory-create"
            icon="i-lucide-package-plus"
            :loading="saving"
            @click="confirmCreate"
          >
            Ins Inventar aufnehmen
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
