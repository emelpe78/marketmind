export type AiActionId =
  | "research-search"
  | "research-analyze"
  | "flipping-analyze"
  | "listing-generate"
  | "prompt-generate"
  | "watchlist-scrape"
  | "watchlist-scrape-all";

export interface AiActionDefinition {
  label: string;
  steps: string[];
  stepIntervalMs?: number;
}

export const AI_ACTIONS: Record<AiActionId, AiActionDefinition> = {
  "research-search": {
    label: "Preisrecherche",
    steps: [
      "Anzeigen werden gesucht…",
      "eBay.de wird durchsucht…",
      "Kleinanzeigen.de wird durchsucht…",
      "Preise werden ausgewertet…",
    ],
    stepIntervalMs: 4000,
  },
  "research-analyze": {
    label: "Preisrecherche-KI",
    steps: [
      "Marktdaten werden ausgewertet…",
      "KI analysiert Preisspanne und Trends…",
      "Analyse wird zusammengestellt…",
    ],
    stepIntervalMs: 5000,
  },
  "flipping-analyze": {
    label: "Flipping-Analyse",
    steps: [
      "Anzeige wird geladen…",
      "Marktpreise werden ermittelt…",
      "KI bewertet Flipping-Potenzial…",
    ],
    stepIntervalMs: 4500,
  },
  "listing-generate": {
    label: "Anzeigen-Generator",
    steps: ["Marktdaten werden geladen…", "Anzeigentext wird generiert…"],
    stepIntervalMs: 4000,
  },
  "prompt-generate": {
    label: "Prompt-Generator",
    steps: ["System-Prompt wird generiert…"],
  },
  "watchlist-scrape": {
    label: "Watchlist",
    steps: ["Anzeige wird aktualisiert…"],
  },
  "watchlist-scrape-all": {
    label: "Watchlist",
    steps: [
      "Watchlist wird aktualisiert…",
      "Preise werden abgefragt…",
      "Ergebnisse werden gespeichert…",
    ],
    stepIntervalMs: 3500,
  },
};

export interface AiStatusState {
  active: boolean;
  message: string;
  progress: number | null;
  actionId: AiActionId | null;
}
