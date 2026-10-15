#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const file = path.resolve(process.argv[2] || "data/tools.json");

const categories = new Set([
  "Databases & BaaS", "Hosting & PaaS", "Auth & Security", "AI APIs",
  "Storage & CDN", "Dev Tools", "CMS", "Analytics",
]);
const pricingTypes = new Set(["100% Free", "Freemium", "Open Source", "Paid Tier Available"]);
const safetyRanks = new Set(["A+", "A", "B+"]);
const audiences = new Set(["Beginner", "Intermediate", "Professional"]);
const sourceTypes = new Set(["Open Source", "Closed Source"]);
const badges = new Set(["Top Rated", "Trending", "Community Favorite"]);
const requiredStringFields = [
  "id", "name", "logoUrl", "tagline", "description", "howItWorks",
  "freeTierLimit", "officialWebsiteUrl", "docsUrl",
];
const rootFields = new Set([
  ...requiredStringFields, "category", "howToUseGuide", "pricingType",
  "noCreditCardRequired", "creditCardRequiredAtSignup", "userRating",
  "totalReviewsCount", "safetyRank", "securityDetails", "targetAudience",
  "githubRepoUrl", "githubStars", "badge",
]);
const securityFields = new Set(["isOpaqueOrOpenSource", "certifications", "dataPrivacyScore"]);
let errors = [];

function issue(location, message) {
  errors.push(`✗ ${location}: ${message}`);
}
function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
function isHttpsUrl(value) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}
function checkKnownKeys(object, known, location) {
  for (const key of Object.keys(object)) {
    if (!known.has(key)) issue(location, `unexpected field "${key}" (schema is strict)`);
  }
}
function validateTool(tool, index, ids, names) {
  const location = `tools[${index}]`;
  if (!tool || typeof tool !== "object" || Array.isArray(tool)) {
    issue(location, "must be an object");
    return;
  }
  checkKnownKeys(tool, rootFields, location);

  for (const field of requiredStringFields) {
    if (!isNonEmptyString(tool[field])) issue(`${location}.${field}`, "must be a non-empty string");
  }

  if (typeof tool.id === "string" && tool.id.trim()) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tool.id)) issue(`${location}.id`, "must be kebab-case");
    if (ids.has(tool.id)) issue(`${location}.id`, `duplicate id "${tool.id}"`);
    ids.add(tool.id);
  }
  if (typeof tool.name === "string" && tool.name.trim()) {
    const normalizedName = tool.name.trim().toLowerCase();
    if (names.has(normalizedName)) issue(`${location}.name`, `duplicate name "${tool.name}"`);
    names.add(normalizedName);
  }

  if (!categories.has(tool.category)) issue(`${location}.category`, "is not an allowed category");
  if (!pricingTypes.has(tool.pricingType)) issue(`${location}.pricingType`, "is not an allowed pricing type");
  if (!safetyRanks.has(tool.safetyRank)) issue(`${location}.safetyRank`, "must be A+, A, or B+");
  if (!audiences.has(tool.targetAudience)) issue(`${location}.targetAudience`, "is not an allowed skill level");

  for (const field of ["logoUrl", "officialWebsiteUrl", "docsUrl"]) {
    if (tool[field] !== undefined && !isHttpsUrl(tool[field])) issue(`${location}.${field}`, "must be a valid HTTPS URL");
  }
  if (tool.githubRepoUrl !== undefined &&
      (!isHttpsUrl(tool.githubRepoUrl) || !/^https:\/\/github\.com\//i.test(tool.githubRepoUrl))) {
    issue(`${location}.githubRepoUrl`, "must be a valid HTTPS GitHub repository URL");
  }
  if (tool.githubStars !== undefined && !isNonEmptyString(tool.githubStars)) {
    issue(`${location}.githubStars`, "must be a non-empty string when supplied");
  }
  if (tool.badge !== undefined && !badges.has(tool.badge)) issue(`${location}.badge`, "is not an allowed badge");
  if (typeof tool.noCreditCardRequired !== "boolean") issue(`${location}.noCreditCardRequired`, "must be boolean");
  if (typeof tool.creditCardRequiredAtSignup !== "boolean") issue(`${location}.creditCardRequiredAtSignup`, "must be boolean");
  if (typeof tool.noCreditCardRequired === "boolean" &&
      typeof tool.creditCardRequiredAtSignup === "boolean" &&
      tool.noCreditCardRequired === tool.creditCardRequiredAtSignup) {
    issue(location, "noCreditCardRequired and creditCardRequiredAtSignup must be opposites");
  }

  if (typeof tool.userRating !== "number" || !Number.isFinite(tool.userRating) ||
      tool.userRating < 0 || tool.userRating > 5) {
    issue(`${location}.userRating`, "must be a number between 0 and 5; use 0 when unrated");
  }
  if (!Number.isInteger(tool.totalReviewsCount) || tool.totalReviewsCount < 0) {
    issue(`${location}.totalReviewsCount`, "must be a non-negative integer");
  }
  if (tool.userRating === 0 && tool.totalReviewsCount !== 0) {
    issue(location, "unrated tools (userRating 0) must have zero reviews");
  }
  if (tool.userRating > 0 && tool.totalReviewsCount < 1) {
    issue(location, "a rated tool must have at least one review");
  }

  if (!Array.isArray(tool.howToUseGuide) || tool.howToUseGuide.length < 3 ||
      !tool.howToUseGuide.every(isNonEmptyString)) {
    issue(`${location}.howToUseGuide`, "must contain at least three non-empty step strings");
  }

  const security = tool.securityDetails;
  if (!security || typeof security !== "object" || Array.isArray(security)) {
    issue(`${location}.securityDetails`, "must be an object");
  } else {
    checkKnownKeys(security, securityFields, `${location}.securityDetails`);
    if (!sourceTypes.has(security.isOpaqueOrOpenSource)) {
      issue(`${location}.securityDetails.isOpaqueOrOpenSource`, "must be Open Source or Closed Source");
    }
    if (!Array.isArray(security.certifications) ||
        !security.certifications.every(isNonEmptyString)) {
      issue(`${location}.securityDetails.certifications`, "must be an array of non-empty strings");
    }
    if (!isNonEmptyString(security.dataPrivacyScore)) {
      issue(`${location}.securityDetails.dataPrivacyScore`, "must be a non-empty evidence note");
    }
  }
}

let data;
try {
  data = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (error) {
  console.error(`✗ Invalid JSON in ${file}: ${error.message}`);
  process.exit(1);
}

if (!Array.isArray(data)) {
  console.error("✗ Root must be an array of tool objects.");
  process.exit(1);
}

const ids = new Set();
const names = new Set();
data.forEach((tool, index) => validateTool(tool, index, ids, names));

if (errors.length) {
  console.error(`Validation failed with ${errors.length} issue(s):\n${errors.join("\n")}`);
  process.exit(1);
}
console.log(`✓ Validated ${data.length} detailed tool records; ${ids.size} unique IDs.`);
console.log("  Schema, URLs, enum values, ratings, privacy fields, and guide steps passed.");
