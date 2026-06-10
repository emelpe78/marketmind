import type Database from "better-sqlite3";
import type { PriceStats } from "shared/price-stats";
import { runAgent } from "../ai/run-agent";
import { getSavedFlipAnalysis } from "../flipping/saved-flip-analysis";
import { getSavedResearch } from "../research/saved-research";
import { getSearchStats } from "../searches/repository";
import { buildListingUserPrompt } from "./prompts";
import { parseListingGeneration } from "./parse-generation";

export interface GenerateListingInput {
  query: string;
  platform: "kleinanzeigen" | "ebay";
  condition: string;
  extras?: string;
  desiredPrice?: number;
  searchId?: number;
  savedResearchId?: number;
  savedFlipAnalysisId?: number;
}

export function resolveListingMarketStats(
  db: Database.Database,
  input: Pick<
    GenerateListingInput,
    "searchId" | "savedResearchId" | "savedFlipAnalysisId"
  >,
): PriceStats | null {
  if (input.searchId) {
    return getSearchStats(db, input.searchId);
  }
  if (input.savedResearchId) {
    return getSavedResearch(db, input.savedResearchId)?.stats ?? null;
  }
  if (input.savedFlipAnalysisId) {
    return (
      getSavedFlipAnalysis(db, input.savedFlipAnalysisId)?.marketStats ?? null
    );
  }
  return null;
}

export async function generateListing(
  db: Database.Database,
  input: GenerateListingInput,
) {
  const marketStats = resolveListingMarketStats(db, input);

  const userInput = buildListingUserPrompt({
    query: input.query,
    platform: input.platform,
    condition: input.condition,
    extras: input.extras,
    desiredPrice: input.desiredPrice,
    marketStats,
  });

  const { content } = await runAgent(db, {
    agentType: "listing",
    userInput,
    mode: "required",
  });

  const parsed = parseListingGeneration(content, {
    query: input.query,
    desiredPrice: input.desiredPrice ?? null,
  });

  return {
    platform: input.platform,
    ...parsed,
  };
}
