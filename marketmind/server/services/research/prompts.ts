import type { AnalysisPlatform } from "./analyze-search";

const PLATFORM_LABEL: Record<AnalysisPlatform, string> = {
  ebay: "eBay.de",
  kleinanzeigen: "Kleinanzeigen.de",
};

export function buildResearchUserPrompt(
  query: string,
  platform: AnalysisPlatform,
  results: unknown[],
): string {
  const label = PLATFORM_LABEL[platform];
  return `Analysiere Marktdaten für "${query}" ausschließlich von ${label}. Ignoriere andere Plattformen.\n${JSON.stringify(results, null, 2)}`;
}
