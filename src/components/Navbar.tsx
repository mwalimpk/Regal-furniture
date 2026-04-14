import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, User, ShoppingCart } from "lucide-react";

const topLinks = ["Discover & Design", "Shop Now", "Architectural Solutions"];
const navCategories = [
  "SEATING", "GAMING", "DESKS & TABLES", "WORKSPACE",
  "LIGHTING", "ACCESSORIES & STORAGE", "OUTDOOR"
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md">
      {/* Top utility bar */}
      <div className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-8 px-4">
          <div className="hidden md:flex items-center gap-1">
            {topLinks.map((link, i) => (
              <a
                key={link}
                href="#"
                className={`text-xs px-3 py-1 transition-colors ${
                  i === 1
                    ? "font-semibold text-foreground border-b-2 border-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link}
              </a>
            ))}
          </div>
          <span className="text-xs text-muted-foreground hidden md:block">Shop by Region ▾</span>
        </div>
      </div>

      {/* Announcement bar */}
      <div className="bg-primary text-primary-foreground text-center text-xs py-2 tracking-wide font-medium">
        25% off Elements 4-Function Table
      </div>

      {/* Main nav */}
      <div className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search"
                className="pl-9 pr-3 py-1.5 text-sm border border-border rounded-none bg-transparent w-40 focus:outline-none focus:border-foreground"
              />
            </div>
          </div>

          <span className="font-serif text-2xl md:text-3xl font-bold tracking-[0.15em] text-foreground uppercase">
            Haworth
          </span>

          <div className="flex items-center gap-4">
            <User size={18} className="text-muted-foreground hidden md:block cursor-pointer hover:text-foreground transition-colors" />
            <div className="relative">
              <ShoppingCart size={18} className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
            </div>
            <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Secondary nav links */}
      <div className="hidden md:flex items-center justify-center border-b border-border bg-background">
        <div className="flex items-center gap-0">
          <a href="#" className="text-xs px-4 py-2.5 text-muted-foreground hover:text-foreground transition-colors">New Arrivals</a>
          <a href="#" className="text-xs px-4 py-2.5 text-muted-foreground hover:text-foreground transition-colors">Sustainability</a>
          <a href="#" className="text-xs px-4 py-2.5 text-muted-foreground hover:text-foreground transition-colors">Ergonomics</a>
          <a href="#" className="text-xs px-4 py-2.5 text-muted-foreground hover:text-foreground transition-colors">Our Brands ▾</a>
          <a href="#" className="text-xs px-4 py-2.5 text-muted-foreground hover:text-foreground transition-colors">Articles</a>
        </div>
      </div>

      {/* Category nav row */}
      <div className="hidden md:flex items-center justify-center gap-6 border-b border-border bg-background h-10">
        {navCategories.map((cat) => (
          <a
            key={cat}
            href="#"
            className="text-[11px] font-semibold tracking-widest text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            {cat} {cat !== "OUTDOOR" && "▾"}
          </a>
        ))}
        <span className="text-sm font-serif font-bold text-foreground tracking-wide">Heller</span>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3">
          {navCategories.map((cat) => (
            <a key={cat} href="#" className="block text-sm text-muted-foreground hover:text-primary">
              {cat}
            </a>
          ))}
          <Button size="sm" className="w-full mt-2">Shop Now</Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
