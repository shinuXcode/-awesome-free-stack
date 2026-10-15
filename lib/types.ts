export const categories = [
  "Databases & BaaS",
  "Hosting & PaaS",
  "Auth & Security",
  "AI APIs",
  "Storage & CDN",
  "Dev Tools",
  "CMS",
  "Analytics",
] as const;

export type Category = (typeof categories)[number];
export type PricingType = "100% Free" | "Freemium" | "Open Source" | "Paid Tier Available";
export type SafetyRank = "A+" | "A" | "B+";
export type TargetAudience = "Beginner" | "Intermediate" | "Professional";
export type ToolBadge = "Top Rated" | "Trending" | "Community Favorite";
export type SortMode = "Highest Rated" | "Most Starred" | "Safety Score" | "Alphabetical";

export interface DetailedDevTool {
  id: string;
  name: string;
  logoUrl: string;
  category: Category;
  tagline: string;
  description: string;
  howItWorks: string;
  howToUseGuide: string[];
  pricingType: PricingType;
  freeTierLimit: string;
  noCreditCardRequired: boolean;
  creditCardRequiredAtSignup: boolean;
  userRating: number;
  totalReviewsCount: number;
  safetyRank: SafetyRank;
  securityDetails: {
    isOpaqueOrOpenSource: "Open Source" | "Closed Source";
    certifications: string[];
    dataPrivacyScore: string;
  };
  targetAudience: TargetAudience;
  officialWebsiteUrl: string;
  docsUrl: string;
  githubRepoUrl?: string;
  githubStars?: string;
  badge?: ToolBadge;
}

export type DevTool = DetailedDevTool;
