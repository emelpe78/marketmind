export const RESEARCH_ICON = "i-lucide-search";

export interface ResearchNavItem {
  label: string;
  to: string;
  testId: string;
}

export const RESEARCH_NAV_ITEMS: ResearchNavItem[] = [
  {
    label: "Recherche",
    to: "/research",
    testId: "nav-research-run",
  },
  {
    label: "Gespeicherte Recherchen",
    to: "/research/saved",
    testId: "nav-research-saved",
  },
];

export const RESEARCH_BASE_PATH = "/research";

export function isResearchRoute(path: string): boolean {
  return (
    path === RESEARCH_BASE_PATH || path.startsWith(`${RESEARCH_BASE_PATH}/`)
  );
}
