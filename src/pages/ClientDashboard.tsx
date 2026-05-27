import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

interface Order {
  id: string;
  total: number;
  currency: string;
  status: string;
  items: { name: string; quantity: number; price: number }[];
  created_at: string;
}

const ClientDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }) as any;
    if (data) setOrders(data);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const statusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-[rgb(70_138_102/0.16)] text-[rgb(70_138_102/1)]";
      case "pending": return "bg-[rgb(196_143_38/0.18)] text-[rgb(196_143_38/1)]";
      case "cancelled": return "bg-[rgb(150_54_70/0.16)] text-[rgb(150_54_70/1)]";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="pt-[96px] lg:pt-[172px]">
        <div className="container mx-auto px-10 py-8 md:py-14">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-4xl font-serif font-bold text-foreground">My Account</h1>
              <p className="text-muted-foreground text-sm mt-1">Welcome back, {profile?.full_name || user?.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-[rgb(70_138_102/0.38)] bg-[rgb(70_138_102/0.12)] text-[rgb(70_138_102/1)]">Active</Badge>
              <Button variant="ghost" size="sm" onClick={signOut} className="text-destructive">
                Sign Out
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-border mb-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "profile" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "orders" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Orders ({orders.length})
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="max-w-lg space-y-6">
              <div className="surface-elevated border border-border/40 p-6 space-y-4">
                <h2 className="font-serif text-lg font-semibold text-foreground">Account Details</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Full Name</p>
                    <p className="font-medium text-foreground">{profile?.full_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{user?.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">{user?.user_metadata?.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Currency</p>
                    <p className="font-medium text-foreground">{profile?.currency || "USD"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Account Status</p>
                    <Badge variant="outline" className="mt-1 border-[rgb(70_138_102/0.38)] bg-[rgb(70_138_102/0.12)] text-[rgb(70_138_102/1)]">Active</Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Role</p>
                    <p className="font-medium text-foreground capitalize">Client</p>
                  </div>
                </div>
              </div>

              <div className="surface-elevated border border-border/40 p-6 space-y-3">
                <h2 className="font-serif text-lg font-semibold text-foreground">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Link to="/categories">
                    <Button variant="outline" className="w-full justify-between">
                      Browse Products →
                    </Button>
                  </Link>
                  <button onClick={() => setActiveTab("orders")}>
                    <Button variant="outline" className="w-full justify-between">
                      View Orders →
                    </Button>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="surface-elevated border border-border/40 py-16 text-center">
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">No orders yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">Start shopping to see your orders here.</p>
                  <Link to="/categories"><Button>Browse Products</Button></Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="surface-elevated border border-border/40 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium px-2 py-1 capitalize ${statusColor(order.status)}`}>{order.status}</span>
                        <span className="font-semibold text-foreground">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                    <div className="border-t border-border pt-3 space-y-1.5">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                          <span className="text-foreground">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default ClientDashboard;
