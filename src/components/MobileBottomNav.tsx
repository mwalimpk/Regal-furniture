import { Home, Search, Grid3X3, ShoppingCart, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const MobileBottomNav = () => {
  const { user } = useAuth();
  const { itemCount, setIsOpen } = useCart();
  const location = useLocation();

  const tabs = [
    { icon: Home, label: "Home", href: "/", isLink: true },
    { icon: Search, label: "Search", href: "#shop", isLink: false },
    { icon: Grid3X3, label: "Categories", href: "/categories", isLink: true },
    { icon: ShoppingCart, label: "Cart", href: "#", isLink: false, isCart: true },
    { icon: User, label: "Account", href: user ? "/dashboard" : "/auth", isLink: true },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const isActive = tab.isLink && location.pathname === tab.href;

          if (tab.isCart) {
            return (
              <button
                key={tab.label}
                onClick={() => setIsOpen(true)}
                className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground hover:text-primary transition-colors relative"
              >
                <tab.icon size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center">{itemCount}</span>
                )}
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          }

          if (tab.isLink) {
            return (
              <Link
                key={tab.label}
                to={tab.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
              >
                <tab.icon size={20} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            );
          }

          return (
            <a
              key={tab.label}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <tab.icon size={20} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
