import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  { label: "Overview", key: "overview" },
  { label: "Customers", key: "users" },
  { label: "Products", key: "properties" },
  { label: "Add Product", key: "add-property" },
  { label: "Product Pairings", key: "pairings" },
  { label: "Categories", key: "approvals" },
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
    <div className="min-h-screen bg-[#f5efe5] text-foreground md:flex">
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#1b201d] text-primary-foreground transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="border-b border-white/10 px-6 pb-5 pt-7">
          <Link to="/" className="font-serif text-[1.7rem] font-semibold tracking-[-0.02em] text-[#f7f1e8]">Regal Admin</Link>
          <p className="mt-2 text-xs uppercase tracking-[0.28em] text-white/45">Local Store Control</p>
        </div>
        <div className="px-6 pb-2 pt-6 text-[11px] uppercase tracking-[0.28em] text-white/35">Store Management</div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-6">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { onSectionChange(item.key); setSidebarOpen(false); }}
              className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition-all ${
                activeSection === item.key
                  ? "border-white/10 bg-white/12 font-semibold text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  : "border-transparent text-primary-foreground/68 hover:border-white/5 hover:bg-white/6 hover:text-primary-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 px-6 py-5 text-xs text-white/50">
          Signed in as {profile?.full_name || "Admin"}
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-foreground/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="min-w-0 flex-1 md:ml-72">
        <header className="sticky top-0 z-30 border-b border-[#dfd1bf] bg-[rgba(245,239,229,0.94)] backdrop-blur">
          <div className="flex h-20 items-center justify-between px-5 md:px-8">
            <div className="flex items-center gap-3">
              <button className="rounded-full border border-[#d8c8b4] px-4 py-2 text-sm font-medium md:hidden" onClick={() => setSidebarOpen(true)}>
                Menu
              </button>
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Admin Workspace</p>
                <div className="mt-1 flex items-center gap-3">
                  <span className="font-serif text-2xl font-semibold tracking-[-0.03em] text-foreground">
                    {activeItem?.label || "Overview"}
                  </span>
                  <Badge variant="outline" className="border-[#d8c7af] bg-white/90 text-[11px] tracking-[0.18em]">
                    LOCAL MODE
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden rounded-full border border-[#ddd0c1] bg-white/80 px-4 py-2 text-xs text-muted-foreground lg:block">
                Storefront and admin are running in one project
              </div>
              <button onClick={signOut} className="text-sm font-medium text-destructive transition-opacity hover:opacity-75">
                Sign Out
              </button>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[2rem] border border-[#e3d7c8] bg-[rgba(255,251,246,0.8)] p-4 shadow-[0_24px_80px_rgba(60,40,20,0.08)] md:p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
