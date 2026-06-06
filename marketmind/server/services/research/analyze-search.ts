import type Database from "better-sqlite3";
import { chatCompletion } from "../openrouter/client";
import {
  getAgentByType,
  resolveAgentModel,
  logAgentHistory,
} from "../openrouter/agents";

export type AnalysisPlatform = "ebay" | "kleinanzeigen";

export interface PlatformAnalysis {
  platform: AnalysisPlatform;
  summary: string;
}

const PLATFORM_LABEL: Record<AnalysisPlatform, string> = {
  ebay: "eBay.de",
  kleinanzeigen: "Kleinanzeigen.de",
};

export function platformsForSearch(platform: string): AnalysisPlatform[] {
  if (platform === "both") return ["ebay", "kleinanzeigen"];
  if (platform === "ebay") return ["ebay"];
  return ["kleinanzeigen"];
}

export async function analyzeSearchByPlatform(
  db: Database.Database,
  searchId: number,
  search: { query: string; platform: string },
  apiKey: string,
  defaultModel: string,
): Promise<{ summaries: PlatformAnalysis[]; tokensUsed: number }> {
  const agent = getAgentByType(db, "research");
  const model = resolveAgentModel(agent, defaultModel);
  const stmt = db.prepare(
    `SELECT title, price, condition, platform
     FROM search_results
     WHERE search_id = ? AND platform = ? AND price > 0
     ORDER BY price ASC
     LIMIT 20`,
  );

  const summaries: PlatformAnalysis[] = [];
  let tokensUsed = 0;

  for (const platform of platformsForSearch(search.platform)) {
    const results = stmt.all(searchId, platform);
    if (!results.length) continue;

    const label = PLATFORM_LABEL[platform];
    const userInput = `Analysiere Marktdaten für "${search.query}" ausschließlich von ${label}. Ignoriere andere Plattformen.\n${JSON.stringify(results, null, 2)}`;
    const completion = await chatCompletion(
      apiKey,
      model,
      [
        { role: "system", content: agent.system_prompt },
        { role: "user", content: userInput },
      ],
      agent.temperature,
    );

    logAgentHistory(
      db,
      agent.id,
      userInput,
      completion.content,
      completion.tokensUsed,
      completion.costUsd,
    );

    summaries.push({ platform, summary: completion.content });
    tokensUsed += completion.tokensUsed;
  }

  return { summaries, tokensUsed };
}
