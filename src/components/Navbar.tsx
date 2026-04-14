import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Link } from "react-router-dom";
import regalLogo from "@/assets/regal-logo.png";
import { categoryNavItems } from "@/data/categoryNav";
import OrderFormDialog from "@/components/OrderFormDialog";
import BookVisitDialog from "@/components/BookVisitDialog";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();
  const { itemCount, setIsOpen } = useCart();
  const { currency, setCurrency } = useCurrency();
  const [orderOpen, setOrderOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        {/* Promo bar */}
        <div className="bg-primary text-primary-foreground text-center text-xs py-2 tracking-wide">
          Free delivery on orders over $500 · Harare & Bulawayo showrooms open
        </div>

        {/* Main nav */}
        <div className="border-b border-border">
          <div className="container mx-auto flex items-center justify-between h-16 px-4">
            {/* Left */}
            <div className="flex items-center gap-4 w-1/3">
              <button className="md:hidden text-sm font-medium text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? "Close" : "Menu"}
              </button>
              <div className="hidden md:flex items-center gap-2 border-b border-foreground/30 pb-0.5">
                <input type="text" placeholder="Search" className="bg-transparent text-sm outline-none w-32 placeholder:text-muted-foreground" />
              </div>
            </div>

            {/* Center: logo */}
            <Link to="/" className="flex items-center">
              <img src={regalLogo} alt="Regal Office & Home" className="h-12 md:h-14 w-auto" />
            </Link>

            {/* Right */}
            <div className="flex items-center justify-end gap-3 w-1/3">
              {/* Currency toggle */}
              <button
                onClick={() => setCurrency(currency === "USD" ? "ZWG" : "USD")}
                className="text-xs font-semibold border border-border px-2 py-1 hover:bg-muted transition-colors"
              >
                {currency}
              </button>
              <button
                onClick={() => setOrderOpen(true)}
                className="hidden md:block text-xs font-medium text-foreground hover:text-primary"
              >
                Place Order
              </button>
              <button
                onClick={() => setVisitOpen(true)}
                className="hidden md:block text-xs font-medium text-foreground hover:text-primary"
              >
                Book Visit
              </button>
              {user ? (
                <Link to={isAdmin ? "/admin" : "/dashboard"} className="hidden md:block text-sm font-medium text-foreground hover:text-primary">
                  Account
                </Link>
              ) : (
                <Link to="/auth" className="hidden md:block text-sm font-medium text-foreground hover:text-primary">
                  Sign In
                </Link>
              )}
              <button className="relative text-sm font-medium text-foreground hover:text-primary" onClick={() => setIsOpen(true)}>
                Cart{itemCount > 0 && <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">{itemCount}</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Category nav - desktop */}
        <div className="hidden md:block border-b border-border bg-background">
          <div className="container mx-auto flex items-center justify-center gap-8 h-11 px-4">
            {categoryNavItems.map((cat) => (
              <Link key={cat.label} to={`/category/${cat.slug}`} className="text-xs font-medium tracking-widest text-foreground hover:text-primary transition-colors">
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-border pb-3 mb-3">
              <input type="text" placeholder="Search products..." className="bg-transparent text-sm outline-none flex-1" />
            </div>
            <div className="flex gap-2 border-b border-border pb-3 mb-3">
              <button onClick={() => { setOrderOpen(true); setMobileOpen(false); }} className="text-xs font-semibold text-primary">Place Order</button>
              <span className="text-muted-foreground">·</span>
              <button onClick={() => { setVisitOpen(true); setMobileOpen(false); }} className="text-xs font-semibold text-primary">Book Visit</button>
            </div>
            {categoryNavItems.map((cat) => (
              <Link key={cat.label} to={`/category/${cat.slug}`} className="block text-xs font-medium tracking-widest text-foreground py-1.5" onClick={() => setMobileOpen(false)}>{cat.label}</Link>
            ))}
            <div className="border-t border-border pt-3 space-y-2">
              {user ? (
                <>
                  <span className="block text-sm text-muted-foreground">{profile?.full_name || user.email}</span>
                  <Link to={isAdmin ? "/admin" : "/dashboard"} className="block text-sm font-semibold text-primary">{isAdmin ? "Admin Panel" : "My Account"}</Link>
                  <button onClick={signOut} className="text-sm text-destructive">Sign Out</button>
                </>
              ) : (
                <Link to="/auth"><Button size="sm" className="w-full">Sign In / Sign Up</Button></Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <OrderFormDialog open={orderOpen} onOpenChange={setOrderOpen} />
      <BookVisitDialog open={visitOpen} onOpenChange={setVisitOpen} />
    </>
  );
};

export default Navbar;
