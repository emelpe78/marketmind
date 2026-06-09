export const LISTINGS_ICON = "i-lucide-file-text";

export interface ListingsNavItem {
  label: string;
  to: string;
  testId: string;
}

export const LISTINGS_NAV_ITEMS: ListingsNavItem[] = [
  {
    label: "Anzeigen-Generator",
    to: "/listings",
    testId: "nav-listings-generator",
  },
  {
    label: "Gespeicherte Anzeigen",
    to: "/listings/saved",
    testId: "nav-listings-saved",
  },
];

export const LISTINGS_BASE_PATH = "/listings";

export function isListingsRoute(path: string): boolean {
  return (
    path === LISTINGS_BASE_PATH || path.startsWith(`${LISTINGS_BASE_PATH}/`)
  );
}
