import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  { label: "Overview", key: "overview" },
  { label: "Customers", key: "users" },
  { label: "Products", key: "properties" },
  { label: "Add Product", key: "add-property" },
  { label: "Categories", key: "categories" },
  { label: "Catalogues", key: "catalogues" },
  { label: "Hero Slides", key: "hero-slides" },
  { label: "Promotions", key: "promotions" },
  { label: "Product Combinations", key: "pairings" },
  { label: "Approvals", key: "approvals" },
  { label: "Quote Requests", key: "rfq" },
  { label: "Leads", key: "leads" },
  { label: "Orders", key: "bookings" },
  { label: "Subscriptions", key: "subscriptions" },
  { label: "Analytics", key: "analytics" },
  { label: "Messages", key: "messages" },
  { label: "Settings", key: "settings" },
];

interface AdminLayoutProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  children: React.ReactNode;
}

const AdminLayout = ({ activeSection, onSectionChange, children }: AdminLayoutProps) => {
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeItem = menuItems.find((item) => item.key === activeSection);

  return (
    <div className="admin-workspace min-h-screen md:flex">
      <aside className={`surface-inverse fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-grid/20 transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="border-b border-[rgb(var(--inverse-foreground-rgb)/0.12)] px-6 pb-5 pt-7">
          <Link to="/" className="font-serif text-[1.7rem] font-semibold text-[rgb(var(--inverse-foreground-rgb)/1)]">Regal Admin</Link>
          <p className="mt-2 text-xs uppercase tracking-[0.28em] text-[rgb(var(--inverse-foreground-rgb)/0.48)]">Local Store Control</p>
        </div>
        <div className="px-6 pb-2 pt-6 text-[11px] uppercase tracking-[0.28em] text-[rgb(var(--inverse-foreground-rgb)/0.42)]">Store Management</div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-6">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { onSectionChange(item.key); setSidebarOpen(false); }}
              className={`w-full border px-4 py-3 text-left text-sm transition-colors ${
                activeSection === item.key
                  ? "border-[rgb(var(--inverse-foreground-rgb)/0.16)] bg-[rgb(var(--inverse-foreground-rgb)/0.12)] font-semibold text-[rgb(var(--inverse-foreground-rgb)/1)]"
                  : "border-transparent text-[rgb(var(--inverse-foreground-rgb)/0.68)] hover:border-[rgb(var(--inverse-foreground-rgb)/0.08)] hover:bg-[rgb(var(--inverse-foreground-rgb)/0.07)] hover:text-[rgb(var(--inverse-foreground-rgb)/1)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-[rgb(var(--inverse-foreground-rgb)/0.12)] px-6 py-5 text-xs text-[rgb(var(--inverse-foreground-rgb)/0.58)]">
          Signed in as {profile?.full_name || "Admin"}
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-foreground/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="min-w-0 flex-1 md:ml-72">
        <header className="sticky top-0 z-30 border-b border-grid/30 bg-background/94 backdrop-blur">
          <div className="flex min-h-20 flex-col justify-center gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <div className="flex items-center gap-3">
              <button className="border border-grid/40 px-4 py-2 text-sm font-medium md:hidden" onClick={() => setSidebarOpen(true)}>
                Menu
              </button>
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Admin Workspace</p>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <span className="font-serif text-2xl font-semibold tracking-[-0.03em] text-foreground">
                    {activeItem?.label || "Overview"}
                  </span>
                  <Badge variant="outline" className="border-grid/40 bg-background text-[11px] tracking-[0.18em]">
                    LOCAL MODE
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="hidden border border-grid/30 bg-card px-4 py-2 text-xs text-muted-foreground lg:block">
                Storefront and admin are running in one project
              </div>
              <button onClick={signOut} className="text-sm font-medium text-destructive transition-opacity hover:opacity-75">
                Sign Out
              </button>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 md:py-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
