"use client";
import { motion } from "framer-motion";
import { ArrowUpRight, Copy, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { DevTool } from "../lib/types";
export default function ToolCard({tool,onDetails}:{tool:DevTool;onDetails:(t:DevTool)=>void}) {
 const [copied,setCopied]=useState(false);
 async function copy(){try{await navigator.clipboard.writeText(tool.url);setCopied(true);setTimeout(()=>setCopied(false),1200)}catch{}}
 return <motion.article layout initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:.97}} whileHover={{y:-5,rotateX:1.5,rotateY:-1.5}} transition={{type:"spring",stiffness:280,damping:24}} className="tool-card"><div className="card-top"><span className="category-label">{tool.category}</span>{tool.badge&&<span className="badge">{tool.badge}</span>}</div><button className="tool-title" onClick={()=>onDetails(tool)}>{tool.name}<ArrowUpRight size={17}/></button><p className="tool-description">{tool.description}</p><div className="limit"><span>FREE TIER</span><p>{tool.freeTierLimit}</p></div><div className="card-bottom"><span className="rank"><ShieldCheck size={15}/>{tool.safetyRank} community rank</span><span className="difficulty">{tool.difficulty}</span></div><div className="card-actions"><button onClick={()=>onDetails(tool)} className="button-secondary">Details</button><button onClick={copy} className="button-secondary"><Copy size={14}/>{copied?"Copied":"Copy URL"}</button><a className="button-primary" href={tool.url} target="_blank" rel="noreferrer">Visit <ArrowUpRight size={15}/></a></div></motion.article>
}