import { Home, Search, Grid3X3, ShoppingCart, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const MobileBottomNav = () => {
  const { user } = useAuth();

  const tabs = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Search, label: "Search", href: "#shop" },
    { icon: Grid3X3, label: "Categories", href: "#categories" },
    { icon: ShoppingCart, label: "Cart", href: "#" },
    { icon: User, label: "Account", href: user ? "/admin" : "/auth" },
  ];

  return (
    <div className="mobile-bottom-nav md:hidden">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => (
          <a
            key={tab.label}
            href={tab.href}
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <tab.icon size={20} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNav;
