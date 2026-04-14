import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, User, ShoppingBag } from "lucide-react";

const navLinks = ["New Arrivals", "Properties", "About", "What We Do", "Contact"];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-center text-xs py-1.5 tracking-wide">
        25% off Featured Properties This Month
      </div>

      {/* Main nav */}
      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          <Search size={18} className="text-muted-foreground hidden md:block cursor-pointer hover:text-foreground transition-colors" />
        </div>

        <span className="font-serif text-2xl font-bold tracking-wider text-foreground uppercase">
          Power of Circles
        </span>

        <div className="flex items-center gap-4">
          <User size={18} className="text-muted-foreground hidden md:block cursor-pointer hover:text-foreground transition-colors" />
          <ShoppingBag size={18} className="text-muted-foreground hidden md:block cursor-pointer hover:text-foreground transition-colors" />
          <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Nav links row */}
      <div className="hidden md:flex items-center justify-center gap-8 border-t border-border h-10">
        {navLinks.map((link) => (
          <a
            key={link}
            href="#"
            className="text-xs font-medium tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            {link}
          </a>
        ))}
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3">
          {navLinks.map((link) => (
            <a key={link} href="#" className="block text-sm text-muted-foreground hover:text-primary">
              {link}
            </a>
          ))}
          <Button size="sm" className="w-full mt-2">Sign Up</Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
