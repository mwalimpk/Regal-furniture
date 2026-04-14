import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, Users, Building2, PlusCircle, CheckSquare, 
  Target, Calendar, CreditCard, BarChart3, MessageSquare, Settings, 
  Bell, LogOut, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", key: "overview" },
  { icon: Users, label: "Users", key: "users" },
  { icon: Building2, label: "Properties", key: "properties" },
  { icon: PlusCircle, label: "Add Property", key: "add-property" },
  { icon: CheckSquare, label: "Approvals", key: "approvals" },
  { icon: Target, label: "Leads", key: "leads" },
  { icon: Calendar, label: "Bookings", key: "bookings" },
  { icon: CreditCard, label: "Subscriptions", key: "subscriptions" },
  { icon: BarChart3, label: "Analytics", key: "analytics" },
  { icon: MessageSquare, label: "Messages", key: "messages" },
  { icon: Settings, label: "Settings", key: "settings" },
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
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-56 bg-primary text-primary-foreground flex flex-col transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 border-b border-primary-foreground/20">
          <Link to="/" className="font-serif text-lg font-semibold">Admin Panel</Link>
        </div>
        <div className="px-3 pt-3 pb-1 text-xs uppercase tracking-wider opacity-60">Menu</div>
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
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-foreground/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 md:ml-56">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background border-b border-border h-14 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <span className="text-sm font-medium text-foreground">Admin Panel</span>
            <Badge variant="outline" className="text-xs">ADMIN</Badge>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell size={18} className="text-muted-foreground" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[10px] flex items-center justify-center">4</span>
            </button>
            <button onClick={signOut} className="text-sm text-destructive hover:underline flex items-center gap-1">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
