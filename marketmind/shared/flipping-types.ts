import type { DetectedPlatform } from "./detect-platform";
import type { PriceStats } from "./price-stats";

export interface FlipListingInfo {
  platform: DetectedPlatform | string;
  url: string;
  title: string;
  price: number | null;
  condition: string | null;
  location: string | null;
  category?: string | null;
  description?: string | null;
}

export interface FlipMarketSample {
  title: string;
  price: number;
  platform: string;
  condition: string | null;
}

export interface AnalyzeFlipResult {
  analysis: string;
  query: string;
  listing: FlipListingInfo;
  marketStats: PriceStats;
  marketSamples: FlipMarketSample[];
  savedAnalysisId?: number;
}

export interface SavedFlipAnalysisListItem {
  id: number;
  title: string;
  listingUrl: string;
  listingPlatform: string;
  query: string;
  listing: {
    title: string;
    price: number | null;
    platform: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SavedFlipAnalysisDetail extends SavedFlipAnalysisListItem {
  analysis: string;
  listing: FlipListingInfo;
  marketStats: PriceStats;
  marketSamples: FlipMarketSample[];
}
