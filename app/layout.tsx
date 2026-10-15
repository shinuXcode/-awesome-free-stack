import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"awesome-free-stack — Zero-Dollar Developer Tools",description:"Discover developer tools with useful free tiers, clear limits, and community-maintained notes.",openGraph:{title:"awesome-free-stack",description:"The Ultimate Zero-Dollar Stack for Developers & Creators."}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}