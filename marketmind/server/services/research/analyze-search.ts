import type Database from "better-sqlite3";
import type { ResearchRunSummary } from "shared/research-types";
import { runAgent } from "../ai/run-agent";
import { findPricedResultsForPlatform } from "../searches/repository";
import { buildResearchUserPrompt } from "./prompts";

export type AnalysisPlatform = "ebay" | "kleinanzeigen";

export type PlatformAnalysis = ResearchRunSummary;

export function platformsForSearch(platform: string): AnalysisPlatform[] {
  if (platform === "both") return ["ebay", "kleinanzeigen"];
  if (platform === "ebay") return ["ebay"];
  return ["kleinanzeigen"];
}

export async function analyzeSearchByPlatform(
  db: Database.Database,
  searchId: number,
  search: { query: string; platform: string },
): Promise<{ summaries: PlatformAnalysis[]; tokensUsed: number }> {
  const summaries: PlatformAnalysis[] = [];
  let tokensUsed = 0;

  for (const platform of platformsForSearch(search.platform)) {
    const results = findPricedResultsForPlatform(db, searchId, platform);
    if (!results.length) continue;

    const userInput = buildResearchUserPrompt(search.query, platform, results);

    const { content, tokensUsed: used } = await runAgent(db, {
      agentType: "research",
      userInput,
      mode: "required",
    });

    summaries.push({ platform, summary: content });
    tokensUsed += used;
  }

  return { summaries, tokensUsed };
}
