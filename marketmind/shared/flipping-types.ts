import type { ListingDetail } from "./listing-detail-types";
import type { PriceStats } from "./price-stats";

export type FlipListingInfo = ListingDetail;

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
