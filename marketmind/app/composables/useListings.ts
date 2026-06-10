import type {
  GeneratedListing,
  ListingCreatePayload,
  ListingGenerateInput,
  ListingItem,
} from "shared/listings-types";
import { toListingCreatePayload } from "shared/listings-types";
import { FETCH_KEYS } from "~/utils/fetch-keys";
import {
  refreshAfterAgentCall,
  refreshListingsData,
} from "~/utils/refresh-fetch-data";

export type {
  GeneratedListing,
  ListingCreatePayload,
  ListingGenerateInput,
  ListingItem,
} from "shared/listings-types";

export function useListings() {
  const query = ref("");
  const condition = ref("Gebraucht");
  const extras = ref("");
  const desiredPrice = ref<number | undefined>();
  const activeTab = ref("kleinanzeigen");
  const saving = ref(false);
  const editingId = ref<number | null>(null);
  const generated = ref<GeneratedListing | null>(null);

  const { data: listings } = useFetch<ListingItem[]>("/api/listings", {
    key: FETCH_KEYS.listings,
  });
  const generating = ref(false);

  const canSave = computed(() => {
    const value = generated.value;
    return Boolean(value?.title?.trim() && value?.description?.trim());
  });

  async function refreshListings() {
    await refreshListingsData();
  }

  async function saveListing(body: ListingCreatePayload) {
    const result = await $fetch<ListingItem>("/api/listings", {
      method: "POST",
      body,
    });
    await refreshListings();
    return result;
  }

  async function updateListing(id: number, body: ListingCreatePayload) {
    const result = await $fetch<ListingItem>(`/api/listings/${id}`, {
      method: "PUT",
      body,
    });
    await refreshListings();
    return result;
  }

  async function deleteListing(id: number) {
    await $fetch(`/api/listings/${id}`, { method: "DELETE" });
    await refreshListings();
  }

  async function generate() {
    if (!query.value.trim()) return null;

    generating.value = true;
    try {
      const result = await $fetch<GeneratedListing>("/api/listings/generate", {
        method: "POST",
        body: {
          query: query.value,
          platform: activeTab.value,
          condition: condition.value,
          extras: extras.value,
          desiredPrice: desiredPrice.value,
        } satisfies ListingGenerateInput,
      });
      generated.value = result;
      editingId.value = null;
      await refreshAfterAgentCall();
      return result;
    } finally {
      generating.value = false;
    }
  }

  function buildSavePayload(): ListingCreatePayload | null {
    if (!generated.value) return null;
    return toListingCreatePayload(generated.value, {
      query: query.value,
      platform: activeTab.value,
    });
  }

  function resetEditor() {
    editingId.value = null;
    generated.value = null;
  }

  async function save() {
    const payload = buildSavePayload();
    if (!payload?.title || !payload.description) return null;

    saving.value = true;
    try {
      if (editingId.value) {
        await updateListing(editingId.value, payload);
        return { mode: "update" as const, id: editingId.value };
      }
      const saved = await saveListing(payload);
      editingId.value = saved.id;
      return { mode: "create" as const, id: saved.id };
    } finally {
      saving.value = false;
    }
  }

  return {
    query,
    condition,
    extras,
    desiredPrice,
    activeTab,
    saving,
    editingId,
    generated,
    canSave,
    listings,
    generating,
    refreshListings,
    saveListing,
    updateListing,
    deleteListing,
    generate,
    buildSavePayload,
    resetEditor,
    save,
  };
}
