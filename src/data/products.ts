import type { ProductColorVariant } from "@/lib/productColorVariants";

export interface Product {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  currency: string;
  image: string;
  images?: string[];
  description: string;
  longDescription?: string;
  colorVariants?: ProductColorVariant[];
}

export interface Category {
  name: string;
  slug: string;
  image: string;
  description: string;
}

export const categories: Category[] = [
  {
    name: "Executive Suites",
    slug: "executive-suites",
    image: "/uploads/collections/executive-suites/big-tall-500-hi-back-swivel-chair-netting-02da43e643.jpg",
    description: "Executive chairs and executive desks for private offices, leadership suites, and statement workspaces.",
  },
  {
    name: "Office Suites",
    slug: "office-suites",
    image: "/uploads/collections/office-suites/almin-workstation-4-seater-df4ddb5484.jpg",
    description: "Operator chairs, mesh seating, and workstation systems for productive office floors.",
  },
  {
    name: "Conference & Boardroom",
    slug: "conference-boardroom",
    image: "/uploads/collections/conference-boardroom/arcadian-boardroom-table-079a3a1fbd.jpg",
    description: "Conference chairs and boardroom tables for meeting rooms, training spaces, and executive sessions.",
  },
  {
    name: "Reception & Lobby",
    slug: "reception-lobby",
    image: "/uploads/collections/reception-lobby/chesterfield-leather-couch-3-seater-933676b7ed.png",
    description: "Visitor chairs, benches, sofas, and reception counters for front-of-house spaces.",
  },
  {
    name: "Home Office",
    slug: "home-office",
    image: "/uploads/collections/home-office/aqua-ergonomic-swivel-chair-dc140d6557.jpg",
    description: "Ergonomic chairs, mesh seating, and compact desks for home and hybrid work.",
  },
  {
    name: "Industrial & Laboratory",
    slug: "industrial-laboratory",
    image: "/uploads/collections/industrial-laboratory/blackpool-industrial-draughtman-chair-822ed5892c.png",
    description: "Industrial chairs, lab stools, draughtsman chairs, and task seating for technical environments.",
  },
  {
    name: "Accessories",
    slug: "accessories",
    image: "/uploads/collections/accessories/metal-4-drawer-filing-cabinet-wth-bar-fdd5e9e2a5.jpg",
    description: "Office accessories, storage, filing, and add-ons that complete the workspace.",
  },
];

export const categoryPairings: Record<string, string> = {
  "executive-suites": "office-suites",
  "office-suites": "executive-suites",
  "conference-boardroom": "reception-lobby",
  "reception-lobby": "accessories",
  "home-office": "office-suites",
  "industrial-laboratory": "accessories",
  "accessories": "reception-lobby",
};
