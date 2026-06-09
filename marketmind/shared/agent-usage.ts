export interface AgentUsage {
  feature: string;
  route: string;
  trigger: string;
  mode: "required" | "optional";
  note?: string;
}

export const AGENT_USAGE: Record<string, AgentUsage> = {
  research: {
    feature: "Preisrecherche",
    route: "/research",
    trigger: "Nach einer Suche über „KI-Analyse“ bzw. „Analyse aktualisieren“",
    mode: "required",
  },
  listing: {
    feature: "Anzeigen",
    route: "/listings",
    trigger: "Beim Klick auf „Anzeige generieren“",
    mode: "required",
  },
  analytics: {
    feature: "Flipping",
    route: "/flipping",
    trigger: "Beim Klick auf „Flipping analysieren“",
    mode: "required",
  },
  strategy: {
    feature: "System-Prompt-Generator",
    route: "/agents/prompt-generator",
    trigger: "Beim Klick auf „Prompt generieren“",
    mode: "required",
    note: "Meta-Agent: Standard-Prompt im Code, Zuweisung über die Prompt-Bibliothek möglich.",
  },
};

export function getAgentUsage(type: string): AgentUsage | undefined {
  return AGENT_USAGE[type];
}

export function formatAgentUsageMode(mode: AgentUsage["mode"]): string {
  return mode === "required" ? "Erforderlich" : "Optional";
}
