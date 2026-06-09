export const FETCH_KEYS = {
  agents: "marketmind:agents",
  promptLibrary: "marketmind:prompt-library",
  agentHistory: "marketmind:agent-history",
  inventory: "marketmind:inventory",
  inventorySummary: "marketmind:inventory-summary",
  watchlist: "marketmind:watchlist",
  dashboard: "marketmind:dashboard",
  database: "marketmind:database",
  settings: "marketmind:settings",
  listings: "marketmind:listings",
} as const;

export type FetchKey = (typeof FETCH_KEYS)[keyof typeof FETCH_KEYS];

export const AGENTS_FETCH_KEYS = [
  FETCH_KEYS.agents,
  FETCH_KEYS.promptLibrary,
  FETCH_KEYS.agentHistory,
] as const;
