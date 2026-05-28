import execDeskImg from "@/assets/product-exec-desk.jpg";
import chairImg from "@/assets/product-exec-chair.jpg";
import workstationImg from "@/assets/product-workstation.jpg";
import conferenceImg from "@/assets/product-conference.jpg";
import sofaImg from "@/assets/product-sofa.jpg";
import standingDeskImg from "@/assets/product-standing-desk.jpg";
import ergoChairImg from "@/assets/product-ergonomic-chair.jpg";
import storageImg from "@/assets/product-storage.jpg";

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
