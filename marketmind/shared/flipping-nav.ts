export const FLIPPING_ICON = "i-lucide-banknote";

export interface FlippingNavItem {
  label: string;
  to: string;
  testId: string;
}

export const FLIPPING_NAV_ITEMS: FlippingNavItem[] = [
  {
    label: "Flipping-Kalkulator",
    to: "/flipping",
    testId: "nav-flipping-calculator",
  },
  {
    label: "Flipping-Analysen",
    to: "/flipping/analyses",
    testId: "nav-flipping-analyses",
  },
];

export const FLIPPING_BASE_PATH = "/flipping";

export function isFlippingRoute(path: string): boolean {
  return (
    path === FLIPPING_BASE_PATH || path.startsWith(`${FLIPPING_BASE_PATH}/`)
  );
}
