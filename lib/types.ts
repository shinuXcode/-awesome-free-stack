export const categories = [
  "Databases & BaaS",
  "Hosting & PaaS",
  "Auth & Security",
  "AI APIs",
  "Storage & CDN",
  "Dev Tools",
  "CMS",
  "Analytics",
  "Frontend & Web Dev",
  "Backend & APIs",
  "Programming Languages",
  "Mobile & Desktop Apps",
  "AI & Machine Learning",
  "Data Science & Analytics",
  "Design & UI/UX",
  "Video Editing & Motion",
  "3D & VFX",
  "Audio & Music",
  "Game Development",
  "Cybersecurity & Ethical Hacking",
  "Reverse Engineering",
  "Operating Systems",
  "Office & Productivity",
  "Open Source Apps",
  "Creator & Social Media",
  "Communities & Forums",
  "Freelancing & Client Management",
  "Project & Idea Management",
  "DevOps & Cloud",
  "Testing & QA",
  "Documentation & Knowledge",
  "Privacy & Utilities",
  "Collaboration & Communication",
  "Education & Learning",
  "Automation & No-Code",
  "Blockchain & Web3",
  "Hardware & IoT",
  "Accessibility",
] as const;

export type Category = (typeof categories)[number];
export type PricingType = "100% Free" | "Freemium" | "Open Source" | "Paid Tier Available" | "Needs Verification";
export type SafetyRank = "A+" | "A" | "B+";
export type TargetAudience = "Beginner" | "Intermediate" | "Professional";
export type ToolBadge = "Top Rated" | "Trending" | "Community Favorite";
export type SortMode = "Recently Added" | "Highest Rated" | "Most Starred" | "Safety Score" | "Alphabetical";

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
    isOpaqueOrOpenSource: "Open Source" | "Closed Source" | "License Unverified";
    certifications: string[];
    dataPrivacyScore: string;
  };
  targetAudience: TargetAudience;
  officialWebsiteUrl: string;
  docsUrl: string;
  githubRepoUrl?: string;
  githubStars?: string;
  sourceVerification?: {
    verifiedAt: string;
    method: "maintainer-review" | "github-api" | "github-api+homepage";
    licenseUrl: string;
    pricingUrl?: string;\n    officialWebsiteUrl?: string;
  };
  badge?: ToolBadge;
  discoveryMetadata?: {
    sourceType: "trending" | "topic";
    sourceUrl: string;
    firstDiscoveredAt: string;
    lastSeenAt: string;
    qualityScore: number;
    trendScore: number;
    starCount: number;
    forkCount: number;
    lastPushedAt: string;
  };
}

export type DevTool = DetailedDevTool;
