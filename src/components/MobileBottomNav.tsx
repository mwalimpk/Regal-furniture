import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const MobileBottomNav = () => {
  const { user } = useAuth();
  const { itemCount, setIsOpen } = useCart();
  const location = useLocation();

  const tabs = [
    { label: "Home", href: "/", isLink: true },
    { label: "Search", href: "#shop", isLink: false },
    { label: "Categories", href: "/categories", isLink: true },
    { label: "Cart", href: "#", isLink: false, isCart: true },
    { label: "Account", href: user ? "/dashboard" : "/auth", isLink: true },
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
                <span className="text-[10px] font-medium">{tab.label}</span>
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center">{itemCount}</span>
                )}
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
              <span className="text-[10px] font-medium">{tab.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
