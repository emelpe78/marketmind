import type { PriceStats } from "./price-stats";

export interface ResearchRunResultRow {
  title: string;
  price: number;
  url: string;
  platform: string;
  condition?: string | null;
}

export interface ResearchRunSummary {
  platform: "ebay" | "kleinanzeigen";
  summary: string;
}

export interface ResearchRunResult {
  searchId: number;
  results: ResearchRunResultRow[];
  stats: PriceStats;
  summaries?: ResearchRunSummary[];
  savedResearchId?: number;
}

export interface SavedResearchListItem {
  id: number;
  title: string;
  query: string;
  platform: string;
  resultsCount: number;
  createdAt: string;
  updatedAt: string;
}
