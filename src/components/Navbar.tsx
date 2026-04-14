import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, User, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const navLinks = ["Home", "Properties", "About Us", "What We Do", "Contact"];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto flex items-center justify-between h-8 px-4">
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><Globe size={12} /> KES</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            {user ? (
              <>
                <span>{profile?.full_name || user.email}</span>
                {isAdmin && <Link to="/admin" className="hover:underline font-semibold">Admin Panel</Link>}
                <button onClick={signOut} className="hover:underline">Sign Out</button>
              </>
            ) : (
              <Link to="/auth" className="hover:underline">Sign In / Sign Up</Link>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">PC</span>
          </div>
          <span className="font-serif text-xl font-semibold text-foreground">Power of Circles</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link} href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {link}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {!user && <Link to="/auth"><Button size="sm">Sign Up</Button></Link>}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3">
          {navLinks.map((link) => (
            <a key={link} href="#" className="block text-sm text-muted-foreground hover:text-primary">{link}</a>
          ))}
          {!user && <Link to="/auth"><Button size="sm" className="w-full mt-2">Sign Up</Button></Link>}
          {isAdmin && <Link to="/admin" className="block text-sm text-accent font-semibold">Admin Panel</Link>}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
