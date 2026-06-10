#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicImagesRoot = path.join(root, "public", "images");
const collectionsRoot = path.join(publicImagesRoot, "collections");
const applyChanges = process.argv.includes("--apply");
const imageExtension = /\.(png|jpe?g|webp|gif|avif)$/i;

const collections = {
  "Executive Suites": "executive-suites",
  "Office Suites": "office-suites",
  "Conference & Boardroom": "conference-boardroom",
  "Reception & Lobby": "reception-lobby",
  "Home Office": "home-office",
  "Industrial & Laboratory": "industrial-laboratory",
  Accessories: "accessories",
};

const legacyTypeToCollection = {
  "Executive Chairs": "Executive Suites",
  "Executive Desking": "Executive Suites",
  "Managerial Chairs": "Executive Suites",
  "Managerial Desking": "Executive Suites",
  "Adjustable Desking": "Home Office",
  "Ergonomic Chairs": "Home Office",
  "Operator Chairs": "Office Suites",
  "Mesh Chairs": "Office Suites",
  Workstations: "Office Suites",
  "Conference Chairs": "Conference & Boardroom",
  "Conference Tables": "Conference & Boardroom",
  "Boardroom Tables": "Conference & Boardroom",
  "Visitor Chairs": "Reception & Lobby",
  "Sofas & Lounge": "Reception & Lobby",
  Benches: "Reception & Lobby",
  "Reception Counters": "Reception & Lobby",
  "Industrial Chairs": "Industrial & Laboratory",
  "Lab Stools": "Industrial & Laboratory",
  "Draughtsman Chairs": "Industrial & Laboratory",
  Accessories: "Accessories",
  "Storage & Filing": "Accessories",
};

const excludedDirectories = [
  collectionsRoot,
  path.join(publicImagesRoot, "hero-slides"),
  path.join(publicImagesRoot, "images", "hero-slides"),
];

const normalize = (value) =>
  String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^\d+/, "")
    .replace(/&/g, " and ")
    .replace(/[_-]+/g, " ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .replace(/\b(colou?r|options?|option)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const isInside = (child, parent) => {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
};

const assertInside = (child, parent, label) => {
  if (!isInside(child, parent)) {
    throw new Error(`${label} is outside the expected folder: ${child}`);
  }
};

const walk = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
};

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const uniqueDestination = async (destination, reserved) => {
  const parsed = path.parse(destination);
  let candidate = destination;
  let index = 2;

  while (reserved.has(candidate.toLowerCase()) || await fileExists(candidate)) {
    candidate = path.join(parsed.dir, `${parsed.name}-${index}${parsed.ext}`);
    index += 1;
  }

  reserved.add(candidate.toLowerCase());
  return candidate;
};

const loadProductMatchers = async () => {
  const storePath = path.join(root, "server", "data", "store.json");
  const store = JSON.parse(await fs.readFile(storePath, "utf8"));
  const products = Array.isArray(store.properties) ? store.properties : [];

  return products
    .map((product) => {
      const collectionName = collections[product.property_type]
        ? product.property_type
        : legacyTypeToCollection[product.property_type];
      const collectionSlug = collections[collectionName];
      const key = normalize(product.title);
      return collectionSlug && key.length > 3 ? { key, collectionSlug } : null;
    })
    .filter(Boolean)
    .sort((left, right) => right.key.length - left.key.length);
};

const classifyByProductName = (normalizedStem, matchers) => {
  let best = null;

  for (const matcher of matchers) {
    let score = 0;
    if (normalizedStem === matcher.key) score = 10000;
    else if (normalizedStem.startsWith(matcher.key)) score = 8000;
    else if (normalizedStem.includes(matcher.key)) score = 6500;
    else if (matcher.key.includes(normalizedStem) && normalizedStem.length >= 8) score = 5000;

    if (score && (!best || score + matcher.key.length > best.score)) {
      best = { collectionSlug: matcher.collectionSlug, score: score + matcher.key.length };
    }
  }

  return best?.collectionSlug || null;
};

const classifyByKeyword = (normalizedStem) => {
  if (/(conference|boardroom|banquet|meeting|arcadian|rooiberg|race track)/.test(normalizedStem)) {
    return "conference-boardroom";
  }

  if (/(visitor|visitors|vistor|vistors|bench|sofa|couch|chesterfield|reception|lobby|counter|coffee table|tub chair|stacker|side chair)/.test(normalizedStem)) {
    return "reception-lobby";
  }

  if (/(lab|stool|draught|draughtman|draughtsman|industrial)/.test(normalizedStem)) {
    return "industrial-laboratory";
  }

  if (/(filing|cabinet|book|shelf|pedestal|fan|fridge|microwave|tray|urn|bin|cupboard|storage|printer|water dispenser|plan chest|brochure)/.test(normalizedStem)) {
    return "accessories";
  }

  if (/(ergonomic|standing desk|height adjustable|sit and stand|home office)/.test(normalizedStem)) {
    return "home-office";
  }

  if (/(workstation|operator|operators|mesh|task|typist|secretary|cluster|dominion|almin|office suite)/.test(normalizedStem)) {
    return "office-suites";
  }

  if (/(executive|exec|ceo|manager|desk|swivel|hiback|hi back|big and tall|chairman|president)/.test(normalizedStem)) {
    return "executive-suites";
  }

  return "_uncategorized";
};

const shouldSkip = (filePath) =>
  excludedDirectories.some((directory) => isInside(filePath, directory));

const removeEmptyDirectories = async (directory) => {
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      await removeEmptyDirectories(path.join(directory, entry.name));
    }
  }

  if (directory !== publicImagesRoot && directory !== collectionsRoot) {
    const remaining = await fs.readdir(directory);
    if (!remaining.length) {
      await fs.rmdir(directory);
    }
  }
};

const matchers = await loadProductMatchers();
const allImages = (await walk(publicImagesRoot))
  .filter((filePath) => imageExtension.test(filePath))
  .filter((filePath) => !shouldSkip(filePath));

const reservedDestinations = new Set();
const plan = [];

for (const source of allImages) {
  assertInside(source, publicImagesRoot, "Source image");
  const stem = normalize(path.basename(source, path.extname(source)));
  const collectionSlug = classifyByProductName(stem, matchers) || classifyByKeyword(stem);
  const destinationDirectory = path.join(collectionsRoot, collectionSlug);
  const destination = await uniqueDestination(path.join(destinationDirectory, path.basename(source)), reservedDestinations);

  assertInside(destination, collectionsRoot, "Destination image");
  if (path.resolve(source) !== path.resolve(destination)) {
    plan.push({ source, destination, collectionSlug });
  }
}

const counts = plan.reduce((accumulator, item) => {
  accumulator[item.collectionSlug] = (accumulator[item.collectionSlug] || 0) + 1;
  return accumulator;
}, {});

if (applyChanges) {
  for (const item of plan) {
    await fs.mkdir(path.dirname(item.destination), { recursive: true });
    try {
      await fs.rename(item.source, item.destination);
    } catch (error) {
      if (error?.code !== "EXDEV") throw error;
      await fs.copyFile(item.source, item.destination);
      await fs.unlink(item.source);
    }
  }

  await removeEmptyDirectories(path.join(publicImagesRoot, "products"));
  await removeEmptyDirectories(path.join(publicImagesRoot, "images", "products"));
}

console.log(JSON.stringify({
  mode: applyChanges ? "applied" : "dry-run",
  plannedMoves: plan.length,
  counts,
  uncategorizedSamples: plan
    .filter((item) => item.collectionSlug === "_uncategorized")
    .slice(0, 12)
    .map((item) => path.relative(publicImagesRoot, item.source).replace(/\\/g, "/")),
  note: applyChanges ? "Images were moved into public/images/collections." : "No files were moved. Re-run with --apply to organize the folder.",
}, null, 2));
