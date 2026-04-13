import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = ["Home", "Properties", "About Us", "What We Do", "Contact"];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">PC</span>
          </div>
          <span className="font-serif text-xl font-semibold text-foreground">Power of Circles</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                link === "Home" ? "text-primary border-b-2 border-primary pb-0.5" : "text-muted-foreground"
              }`}
            >
              {link}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <Button size="sm">Sign Up</Button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
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
