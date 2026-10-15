#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const file = path.resolve(process.argv[2] || "data/tools.json");
const categories = new Set(["Databases & BaaS","Hosting & PaaS","Auth & Security","AI APIs","Storage & CDN","Dev Tools"]);
const ranks = new Set(["A+","A","B+"]), difficulties = new Set(["Beginner","Intermediate","Pro"]), badges = new Set(["Community Pick","Popular","Hot"]);
const required = ["id","name","category","description","url","freeTierLimit","noCreditCardRequired","safetyRank","difficulty"];
function fail(msg){ console.error("✗ "+msg); process.exitCode=1; }
let data;
try { data=JSON.parse(fs.readFileSync(file,"utf8")); } catch(e){ fail("Invalid JSON in "+file+": "+e.message); process.exit(); }
if(!Array.isArray(data)){ fail("Root must be an array."); process.exit(); }
const ids=new Set(), names=new Set();
data.forEach((t,i)=>{
 const at="tools["+i+"]";
 if(!t || typeof t!=="object" || Array.isArray(t)){ fail(at+" must be an object"); return; }
 for(const k of required) if(!(k in t)) fail(at+" missing "+k);
 for(const k of ["id","name","description","url","freeTierLimit"]) if(typeof t[k]!=="string" || !t[k].trim()) fail(at+"."+k+" must be a non-empty string");
 if(typeof t.id==="string"){ if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(t.id)) fail(at+".id must be kebab-case"); if(ids.has(t.id)) fail("Duplicate id: "+t.id); ids.add(t.id); }
 if(typeof t.name==="string"){ const n=t.name.toLowerCase(); if(names.has(n)) fail("Duplicate name: "+t.name); names.add(n); }
 if(!categories.has(t.category)) fail(at+".category is invalid");
 if(typeof t.url!=="string" || !/^https:\/\//i.test(t.url)) fail(at+".url must use HTTPS");
 if(typeof t.noCreditCardRequired!=="boolean") fail(at+".noCreditCardRequired must be boolean");
 if(!ranks.has(t.safetyRank)) fail(at+".safetyRank is invalid");
 if(!difficulties.has(t.difficulty)) fail(at+".difficulty is invalid");
 if(t.badge!==undefined && !badges.has(t.badge)) fail(at+".badge is invalid");
});
if(!process.exitCode) console.log("✓ Validated "+data.length+" tools ("+ids.size+" unique IDs).");