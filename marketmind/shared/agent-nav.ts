export interface AgentsNavItem {
  label: string;
  to: string;
  testId: string;
}

export const AGENTS_NAV_ITEMS: AgentsNavItem[] = [
  {
    label: "Feature-Agents",
    to: "/agents/feature-agents",
    testId: "nav-agents-feature",
  },
  {
    label: "System-Prompt-Generator",
    to: "/agents/prompt-generator",
    testId: "nav-agents-prompt-generator",
  },
  {
    label: "Verlauf",
    to: "/agents/history",
    testId: "nav-agents-history",
  },
];

export const AGENTS_BASE_PATH = "/agents";

export function isAgentsRoute(path: string): boolean {
  return path === AGENTS_BASE_PATH || path.startsWith(`${AGENTS_BASE_PATH}/`);
}
