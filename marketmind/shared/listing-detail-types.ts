import type { DetectedPlatform } from "./detect-platform";

export interface ListingDetail {
  platform: DetectedPlatform;
  url: string;
  title: string;
  price: number | null;
  description: string | null;
  condition: string | null;
  location: string | null;
  category: string | null;
}
