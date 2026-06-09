const AGENT_ICONS: Record<string, string> = {
  research: "i-lucide-search",
  listing: "i-lucide-megaphone",
  analytics: "i-lucide-banknote",
  strategy: "i-lucide-wand-sparkles",
};

export function getAgentIcon(type: string): string {
  return AGENT_ICONS[type] ?? "i-lucide-bot";
}
