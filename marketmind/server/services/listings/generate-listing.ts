import type Database from "better-sqlite3";
import { runAgent } from "../ai/run-agent";
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
}

export async function generateListing(
  db: Database.Database,
  input: GenerateListingInput,
) {
  const marketStats = input.searchId
    ? getSearchStats(db, input.searchId)
    : null;

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
