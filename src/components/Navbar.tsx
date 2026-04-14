import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, User, Globe, ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import regalLogo from "@/assets/regal-logo.jpg";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "#shop" },
  { label: "Categories", href: "#categories" },
  { label: "About Us", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      {/* Top bar - hidden on mobile for app-like feel */}
      <div className="hidden md:block bg-primary text-primary-foreground">
        <div className="container mx-auto flex items-center justify-between h-8 px-4">
          <div className="flex items-center gap-4 text-xs">
            <span>📞 +263 8644 281 361</span>
            <span>✉ info@regalfurn.co.zw</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Globe size={12} />
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
          <img src={regalLogo} alt="Regal Office & Home" className="h-10 w-auto rounded" />
          <div className="hidden sm:block">
            <span className="font-serif text-lg font-semibold text-foreground leading-none">Regal</span>
            <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">Office & Home</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2">
            <ShoppingCart size={20} className="text-foreground" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center">0</span>
          </button>
          <div className="hidden md:flex items-center gap-2">
            {!user && <Link to="/auth"><Button size="sm">Sign Up</Button></Link>}
          </div>
          <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="block text-sm text-muted-foreground hover:text-primary" onClick={() => setMobileOpen(false)}>{link.label}</a>
          ))}
          {!user && <Link to="/auth"><Button size="sm" className="w-full mt-2">Sign Up</Button></Link>}
          {user && (
            <>
              {isAdmin && <Link to="/admin" className="block text-sm text-accent font-semibold">Admin Panel</Link>}
              <button onClick={signOut} className="text-sm text-destructive">Sign Out</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
