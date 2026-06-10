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

export interface ListingFormState {
  query: string;
  platform: string;
}

export interface ListingCreatePayload {
  query: string;
  platform: string;
  title: string;
  description: string;
  keywords: string | null;
  category: string | null;
  price_suggestion: number | null;
}

export interface ListingGenerateInput {
  query: string;
  platform: string;
  condition?: string;
  extras?: string;
  desiredPrice?: number;
  searchId?: number;
  savedResearchId?: number;
  savedFlipAnalysisId?: number;
}

export function toListingCreatePayload(
  generated: GeneratedListing,
  form: ListingFormState,
): ListingCreatePayload {
  return {
    query: form.query.trim() || generated.title,
    platform: form.platform,
    title: String(generated.title).trim(),
    description: String(generated.description).trim(),
    keywords: generated.keywords,
    category: generated.category,
    price_suggestion: generated.priceSuggestion,
  };
}
