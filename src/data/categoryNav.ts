import { Link } from "react-router-dom";
import { categories } from "@/data/products";

const cats = [
  "SEATING", "DESKS & TABLES", "WORKSTATIONS", "CONFERENCE", "STORAGE", "SOFAS & LOUNGE", "ACCESSORIES"
];

const catSlugMap: Record<string, string> = {
  "SEATING": "executive-chairs",
  "DESKS & TABLES": "executive-desking",
  "WORKSTATIONS": "workstations",
  "CONFERENCE": "conference-tables",
  "STORAGE": "storage-filing",
  "SOFAS & LOUNGE": "sofas-lounge",
  "ACCESSORIES": "accessories",
};

export const categoryNavItems = cats.map((c) => ({
  label: c,
  slug: catSlugMap[c],
}));
