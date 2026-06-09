import type Database from "better-sqlite3";
import { runAgent } from "../ai/run-agent";

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
): Promise<{ summaries: PlatformAnalysis[]; tokensUsed: number }> {
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
