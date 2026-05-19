import execDeskImg from "@/assets/product-exec-desk.jpg";
import chairImg from "@/assets/product-exec-chair.jpg";
import workstationImg from "@/assets/product-workstation.jpg";
import conferenceImg from "@/assets/product-conference.jpg";
import sofaImg from "@/assets/product-sofa.jpg";
import standingDeskImg from "@/assets/product-standing-desk.jpg";
import ergoChairImg from "@/assets/product-ergonomic-chair.jpg";
import storageImg from "@/assets/product-storage.jpg";
import { greenProducts } from "./greenProducts";

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
}

export interface Category {
  name: string;
  slug: string;
  image: string;
  description: string;
}

export const categories: Category[] = [
  { name: "Executive Desking", slug: "executive-desking", image: execDeskImg, description: "Premium executive desks with mahogany, oak and walnut finishes for boardroom-level workspaces." },
  { name: "Managerial Desking", slug: "managerial-desking", image: execDeskImg, description: "Functional yet stylish desks designed for managers and team leads." },
  { name: "Adjustable Desking", slug: "adjustable-desking", image: standingDeskImg, description: "Height-adjustable and standing desks for ergonomic modern workspaces." },
  { name: "Workstations", slug: "workstations", image: workstationImg, description: "Shared and single workstations with cable management for open-plan offices." },
  { name: "L-Shaped Desks", slug: "l-shaped-desks", image: execDeskImg, description: "Spacious L-shaped desks offering maximum surface area and storage." },
  { name: "Executive Chairs", slug: "executive-chairs", image: chairImg, description: "Premium leather and PU executive swivel chairs for comfort and status." },
  { name: "Ergonomic Chairs", slug: "ergonomic-chairs", image: ergoChairImg, description: "Full mesh and padded ergonomic chairs with lumbar support and adjustable headrests." },
  { name: "Visitor Chairs", slug: "visitor-chairs", image: chairImg, description: "Stylish visitor and guest seating for reception and meeting areas." },
  { name: "Conference Tables", slug: "conference-tables", image: conferenceImg, description: "Boardroom and conference tables in boat, oval and round shapes." },
  { name: "Storage & Filing", slug: "storage-filing", image: storageImg, description: "Filing cabinets, stationery cupboards and shelving for organised offices." },
  { name: "Sofas & Lounge", slug: "sofas-lounge", image: sofaImg, description: "Chesterfield sofas, reception couches and lounge furniture." },
  { name: "Accessories", slug: "accessories", image: storageImg, description: "Bar stools, coffee tables, reception counters, bar fridges and desk accessories." },
];

export const categoryPairings: Record<string, string> = {
  "executive-desking": "executive-chairs",
  "managerial-desking": "executive-chairs",
  "l-shaped-desks": "executive-chairs",
  "adjustable-desking": "ergonomic-chairs",
  "workstations": "ergonomic-chairs",
  "conference-tables": "visitor-chairs",
  "sofas-lounge": "accessories",
  "executive-chairs": "executive-desking",
  "ergonomic-chairs": "workstations",
  "visitor-chairs": "conference-tables",
  "accessories": "sofas-lounge",
};

export const products: Product[] = [
  ...greenProducts,
  // Executive Desking
  { id: "1", name: "B002 Executive Desk", category: "Executive Desking", categorySlug: "executive-desking", price: 1299, currency: "USD", image: execDeskImg, description: "Premium executive desk with mahogany finish and brass accents." },
  { id: "2", name: "B018 Executive Desk", category: "Executive Desking", categorySlug: "executive-desking", price: 1399, currency: "USD", image: execDeskImg, description: "Executive desk with spacious surface and integrated storage." },
  { id: "3", name: "B023 Executive Desk", category: "Executive Desking", categorySlug: "executive-desking", price: 1499, currency: "USD", image: execDeskImg, description: "Curved executive desk with glass-fronted bookshelf." },
  { id: "4", name: "B030 Executive Desk", category: "Executive Desking", categorySlug: "executive-desking", price: 1599, currency: "USD", image: execDeskImg, description: "Large executive desk with leather chair and bookshelf setup." },

  // Managerial Desking
  { id: "5", name: "Afton Exec Desk", category: "Managerial Desking", categorySlug: "managerial-desking", price: 899, currency: "USD", image: execDeskImg, description: "Modern managerial desk with clean lines." },
  { id: "6", name: "Admiral Set", category: "Managerial Desking", categorySlug: "managerial-desking", price: 999, currency: "USD", image: execDeskImg, description: "Complete admiral desk set with side return." },
  { id: "7", name: "Astoria Exec Desk", category: "Managerial Desking", categorySlug: "managerial-desking", price: 849, currency: "USD", image: execDeskImg, description: "Modern managerial desk with laptop-friendly design." },
  { id: "8", name: "Barcelona Executive Desk", category: "Managerial Desking", categorySlug: "managerial-desking", price: 1099, currency: "USD", image: execDeskImg, description: "Traditional wooden executive desk with bookshelf." },

  // Adjustable Desking
  { id: "9", name: "HILO 200 Standing Desk", category: "Adjustable Desking", categorySlug: "adjustable-desking", price: 899, currency: "USD", image: standingDeskImg, description: "Height adjustable standing desk for ergonomic workspaces." },
  { id: "10", name: "Sit & Stand L-Shaped Desk", category: "Adjustable Desking", categorySlug: "adjustable-desking", price: 1299, currency: "USD", image: standingDeskImg, description: "L-shaped ergonomic sit and stand desk 1800x1800 frame." },

  // Workstations
  { id: "11", name: "Dominion 4-Seater Workstation", category: "Workstations", categorySlug: "workstations", price: 2499, currency: "USD", image: workstationImg, description: "Shared workstation for 4 with integrated cable management." },
  { id: "12", name: "KCF 4-Seater Workstation", category: "Workstations", categorySlug: "workstations", price: 2299, currency: "USD", image: workstationImg, description: "Open-plan 4-seater workstation with dividers." },
  { id: "13", name: "WYT 2-Way Workstation", category: "Workstations", categorySlug: "workstations", price: 1599, currency: "USD", image: workstationImg, description: "Two-person face-to-face workstation." },
  { id: "14", name: "DW 1500x800 Drawer Desk", category: "Workstations", categorySlug: "workstations", price: 699, currency: "USD", image: workstationImg, description: "Single workstation with three drawers." },

  // L-Shaped Desks
  { id: "15", name: "Discovery L-Shaped Desk", category: "L-Shaped Desks", categorySlug: "l-shaped-desks", price: 1199, currency: "USD", image: execDeskImg, description: "Spacious L-shaped desk with ample surface area." },
  { id: "16", name: "Classique L-Shaped Desk", category: "L-Shaped Desks", categorySlug: "l-shaped-desks", price: 1399, currency: "USD", image: execDeskImg, description: "Classic executive L-shaped desk with multiple options." },
  { id: "17", name: "Regency L-Shaped Desk", category: "L-Shaped Desks", categorySlug: "l-shaped-desks", price: 1499, currency: "USD", image: execDeskImg, description: "Premium regency-style L-shaped executive desk." },
  { id: "18", name: "Silkwood Bow Front L-Shaped", category: "L-Shaped Desks", categorySlug: "l-shaped-desks", price: 1599, currency: "USD", image: execDeskImg, description: "5-drawer bow front L-shaped desk in mahogany or oak." },

  // Executive Chairs
  { id: "19", name: "Lloyd Executive Chair", category: "Executive Chairs", categorySlug: "executive-chairs", price: 599, currency: "USD", image: chairImg, description: "Luxury leather executive chair with ergonomic lumbar support." },
  { id: "20", name: "Big & Tall 500 Exec Chair", category: "Executive Chairs", categorySlug: "executive-chairs", price: 699, currency: "USD", image: chairImg, description: "Heavy-duty executive swivel chair for larger frames." },
  { id: "21", name: "Big Guy CEO Chair", category: "Executive Chairs", categorySlug: "executive-chairs", price: 749, currency: "USD", image: chairImg, description: "CEO-grade swivel chair in black and brown." },
  { id: "22", name: "President Exec HiBack", category: "Executive Chairs", categorySlug: "executive-chairs", price: 649, currency: "USD", image: chairImg, description: "Presidential high-back executive swivel chair." },

  // Ergonomic Chairs
  { id: "23", name: "Active Ergonomic Swivel Chair", category: "Ergonomic Chairs", categorySlug: "ergonomic-chairs", price: 449, currency: "USD", image: ergoChairImg, description: "Full mesh ergonomic swivel chair with adjustable headrest." },
  { id: "24", name: "Alya Exec Ergonomic Chair", category: "Ergonomic Chairs", categorySlug: "ergonomic-chairs", price: 499, currency: "USD", image: ergoChairImg, description: "Executive ergonomic chair with premium mesh back." },
  { id: "25", name: "Harrison Mesh HiBack", category: "Ergonomic Chairs", categorySlug: "ergonomic-chairs", price: 399, currency: "USD", image: ergoChairImg, description: "Mesh high-back swivel chair for all-day comfort." },

  // Visitor Chairs
  { id: "26", name: "Everywhere Visitors Chair", category: "Visitor Chairs", categorySlug: "visitor-chairs", price: 199, currency: "USD", image: chairImg, description: "Versatile visitor chair for any office setting." },
  { id: "27", name: "Moscow Visitor Chair", category: "Visitor Chairs", categorySlug: "visitor-chairs", price: 249, currency: "USD", image: chairImg, description: "Premium leather visitor chair with chrome frame." },
  { id: "28", name: "Zelda Chrome Sleigh Base", category: "Visitor Chairs", categorySlug: "visitor-chairs", price: 279, currency: "USD", image: chairImg, description: "Modern chrome sleigh-base visitor chair." },

  // Conference Tables
  { id: "29", name: "Boat Shaped Boardroom Table", category: "Conference Tables", categorySlug: "conference-tables", price: 3499, currency: "USD", image: conferenceImg, description: "Premium boardroom table seating 12 with glass center insert." },
  { id: "30", name: "Oval Boardroom Table", category: "Conference Tables", categorySlug: "conference-tables", price: 2999, currency: "USD", image: conferenceImg, description: "Oval-shaped boardroom table with central glass insert." },
  { id: "31", name: "Round Conference Table", category: "Conference Tables", categorySlug: "conference-tables", price: 1299, currency: "USD", image: conferenceImg, description: "Round cross-panel conference table for 4." },

  // Storage & Filing
  { id: "32", name: "Metal 4-Drawer Filing Cabinet", category: "Storage & Filing", categorySlug: "storage-filing", price: 349, currency: "USD", image: storageImg, description: "Heavy-duty 4-drawer filing cabinet with card slots." },
  { id: "33", name: "BK Stationery Cupboard", category: "Storage & Filing", categorySlug: "storage-filing", price: 499, currency: "USD", image: storageImg, description: "1800x900x400 4-shelf stationery cupboard." },
  { id: "34", name: "DW Glass Cabinet 4-Shelf", category: "Storage & Filing", categorySlug: "storage-filing", price: 599, currency: "USD", image: storageImg, description: "Display glass cabinet with 4 shelves." },
  { id: "35", name: "Metal Book Shelf 5-Tier", category: "Storage & Filing", categorySlug: "storage-filing", price: 299, currency: "USD", image: storageImg, description: "5-tier metal bookshelf for documents and files." },

  // Sofas & Lounge
  { id: "36", name: "Chesterfield 3-Seater", category: "Sofas & Lounge", categorySlug: "sofas-lounge", price: 1899, currency: "USD", image: sofaImg, description: "Classic Chesterfield leather couch for executive lounges." },
  { id: "37", name: "Chesterfield 2-Seater", category: "Sofas & Lounge", categorySlug: "sofas-lounge", price: 1499, currency: "USD", image: sofaImg, description: "Chesterfield leather couch 2-seater." },
  { id: "38", name: "Barberton Double Sofa", category: "Sofas & Lounge", categorySlug: "sofas-lounge", price: 1299, currency: "USD", image: sofaImg, description: "Barberton double sofa for reception and lounge areas." },

  // Accessories
  { id: "39", name: "Acacia Coffee Table", category: "Accessories", categorySlug: "accessories", price: 299, currency: "USD", image: storageImg, description: "Natural acacia wood coffee table for lounge areas." },
  { id: "40", name: "Alpha Glass Coffee Table", category: "Accessories", categorySlug: "accessories", price: 249, currency: "USD", image: storageImg, description: "Modern glass-top coffee table." },
  { id: "41", name: "Reception Counter Easy", category: "Accessories", categorySlug: "accessories", price: 899, currency: "USD", image: storageImg, description: "Reception counter desk for front-office setup." },
  { id: "42", name: "Bar Stool Charlie PU", category: "Accessories", categorySlug: "accessories", price: 149, currency: "USD", image: storageImg, description: "PU leather bar stool with chrome base." },
];
