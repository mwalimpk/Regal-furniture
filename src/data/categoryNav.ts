import { Link } from "react-router-dom";
import { categories } from "@/data/products";

const cats = [
  "EXECUTIVE SUITES",
  "OFFICE SUITES",
  "CONFERENCE & BOARDROOM",
  "RECEPTION & LOBBY",
  "HOME OFFICE",
  "INDUSTRIAL & LABORATORY",
  "ACCESSORIES",
];

const catSlugMap: Record<string, string> = {
  "EXECUTIVE SUITES": "executive-suites",
  "OFFICE SUITES": "office-suites",
  "CONFERENCE & BOARDROOM": "conference-boardroom",
  "RECEPTION & LOBBY": "reception-lobby",
  "HOME OFFICE": "home-office",
  "INDUSTRIAL & LABORATORY": "industrial-laboratory",
  "ACCESSORIES": "accessories",
};

export const categoryNavItems = cats.map((c) => ({
  label: c,
  slug: catSlugMap[c],
}));
