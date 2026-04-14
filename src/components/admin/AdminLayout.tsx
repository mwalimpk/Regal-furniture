import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  { label: "Overview", key: "overview" },
  { label: "Customers", key: "users" },
  { label: "Products", key: "properties" },
  { label: "Add Product", key: "add-property" },
  { label: "Categories", key: "approvals" },
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

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-56 bg-primary text-primary-foreground flex flex-col transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 border-b border-primary-foreground/20">
          <Link to="/" className="font-serif text-lg font-semibold">Regal Admin</Link>
        </div>
        <div className="px-3 pt-3 pb-1 text-xs uppercase tracking-wider opacity-60">Store Management</div>
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { onSectionChange(item.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                activeSection === item.key
                  ? "bg-primary-foreground/20 text-primary-foreground font-semibold"
                  : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-foreground/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 md:ml-56">
        <header className="sticky top-0 z-30 bg-background border-b border-border h-14 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-sm font-medium" onClick={() => setSidebarOpen(true)}>
              Menu
            </button>
            <span className="text-sm font-medium text-foreground">Regal Store Admin</span>
            <Badge variant="outline" className="text-xs">ADMIN</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">4 notifications</span>
            <button onClick={signOut} className="text-sm text-destructive hover:underline">
              Sign Out
            </button>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
