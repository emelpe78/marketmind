import { FETCH_KEYS } from "~/utils/fetch-keys";
import {
  refreshAfterAgentCall,
  refreshListingsData,
} from "~/utils/refresh-fetch-data";

export interface ListingItem {
  id: number;
  query: string;
  platform: string;
  title: string;
  description: string;
  keywords: string | null;
  category: string | null;
  price_suggestion: number | null;
  created_at: string;
}

export interface GeneratedListing {
  platform: string;
  title: string;
  description: string;
  priceSuggestion: number | null;
  category: string | null;
  keywords: string | null;
}

export function useListings() {
  const { data: listings } = useFetch<ListingItem[]>("/api/listings", {
    key: FETCH_KEYS.listings,
  });
  const generating = ref(false);

  async function refreshListings() {
    await refreshListingsData();
  }

  async function saveListing(body: Record<string, unknown>) {
    const result = await $fetch<ListingItem>("/api/listings", {
      method: "POST",
      body,
    });
    await refreshListings();
    return result;
  }

  async function updateListing(id: number, body: Record<string, unknown>) {
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

  async function generateListing(body: Record<string, unknown>) {
    generating.value = true;
    try {
      const result = await $fetch<GeneratedListing>("/api/listings/generate", {
        method: "POST",
        body,
      });
      await refreshAfterAgentCall();
      return result;
    } finally {
      generating.value = false;
    }
  }

  return {
    listings,
    generating,
    refreshListings,
    saveListing,
    updateListing,
    deleteListing,
    generateListing,
  };
}
