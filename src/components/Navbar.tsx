import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, ShoppingCart, User, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import regalLogo from "@/assets/regal-logo.png";

const categories = [
  "SEATING", "DESKS & TABLES", "WORKSTATIONS", "CONFERENCE", "STORAGE", "SOFAS & LOUNGE", "ACCESSORIES"
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      {/* Promo bar */}
      <div className="bg-primary text-primary-foreground text-center text-xs py-2 tracking-wide">
        Free delivery on orders over $500 · Harare & Bulawayo showrooms open
      </div>

      {/* Main nav */}
      <div className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          {/* Left: search */}
          <div className="flex items-center gap-4 w-1/3">
            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="hidden md:flex items-center gap-2 border-b border-foreground/30 pb-0.5">
              <Search size={16} className="text-muted-foreground" />
              <input type="text" placeholder="Search" className="bg-transparent text-sm outline-none w-32 placeholder:text-muted-foreground" />
            </div>
          </div>

          {/* Center: logo */}
          <Link to="/" className="flex items-center">
            <img src={regalLogo} alt="Regal Office & Home" className="h-12 md:h-14 w-auto" />
          </Link>

          {/* Right: icons */}
          <div className="flex items-center justify-end gap-4 w-1/3">
            {user ? (
              <Link to="/admin" className="hidden md:block">
                <User size={20} className="text-foreground" />
              </Link>
            ) : (
              <Link to="/auth" className="hidden md:block">
                <User size={20} className="text-foreground" />
              </Link>
            )}
            <button className="relative">
              <ShoppingCart size={20} className="text-foreground" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center">0</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category nav - desktop */}
      <div className="hidden md:block border-b border-border bg-background">
        <div className="container mx-auto flex items-center justify-center gap-8 h-11 px-4">
          {categories.map((cat) => (
            <a key={cat} href="#shop" className="text-xs font-medium tracking-widest text-foreground hover:text-primary transition-colors">
              {cat}
            </a>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-border pb-3 mb-3">
            <Search size={16} className="text-muted-foreground" />
            <input type="text" placeholder="Search products..." className="bg-transparent text-sm outline-none flex-1" />
          </div>
          {categories.map((cat) => (
            <a key={cat} href="#shop" className="block text-xs font-medium tracking-widest text-foreground py-1.5" onClick={() => setMobileOpen(false)}>{cat}</a>
          ))}
          <div className="border-t border-border pt-3 space-y-2">
            {user ? (
              <>
                <span className="block text-sm text-muted-foreground">{profile?.full_name || user.email}</span>
                {isAdmin && <Link to="/admin" className="block text-sm font-semibold text-primary">Admin Panel</Link>}
                <button onClick={signOut} className="text-sm text-destructive">Sign Out</button>
              </>
            ) : (
              <Link to="/auth"><Button size="sm" className="w-full">Sign In / Sign Up</Button></Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
