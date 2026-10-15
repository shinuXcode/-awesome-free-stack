export const categories = ["Databases & BaaS","Hosting & PaaS","Auth & Security","AI APIs","Storage & CDN","Dev Tools"] as const;
export type Category = typeof categories[number];
export type SafetyRank = "A+" | "A" | "B+";
export type Difficulty = "Beginner" | "Intermediate" | "Pro";
export interface DevTool { id:string; name:string; category:Category; description:string; url:string; freeTierLimit:string; noCreditCardRequired:boolean; safetyRank:SafetyRank; difficulty:Difficulty; badge?:"Community Pick"|"Popular"|"Hot"; }