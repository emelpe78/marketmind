export interface ListingItem {
  id: number;
  query: string;
  platform: string;
  title: string;
  description: string;
  keywords: string | null;
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
  const { data: listings, refresh } = useFetch<ListingItem[]>("/api/listings");
  const generating = ref(false);

  async function saveListing(body: Record<string, unknown>) {
    const result = await $fetch<ListingItem>("/api/listings", {
      method: "POST",
      body,
    });
    await refresh();
    return result;
  }

  async function updateListing(id: number, body: Record<string, unknown>) {
    const result = await $fetch<ListingItem>(`/api/listings/${id}`, {
      method: "PUT",
      body,
    });
    await refresh();
    return result;
  }

  async function deleteListing(id: number) {
    await $fetch(`/api/listings/${id}`, { method: "DELETE" });
    await refresh();
  }

  async function generateListing(body: Record<string, unknown>) {
    generating.value = true;
    try {
      return await $fetch<GeneratedListing>("/api/listings/generate", {
        method: "POST",
        body,
      });
    } finally {
      generating.value = false;
    }
  }

  return {
    listings,
    generating,
    refresh,
    saveListing,
    updateListing,
    deleteListing,
    generateListing,
  };
}
