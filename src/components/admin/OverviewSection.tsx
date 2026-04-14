import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

const OverviewSection = () => {
  const { data: productCount } = useQuery({
    queryKey: ["admin-product-count"],
    queryFn: async () => {
      const { count } = await supabase.from("properties").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: pendingCount } = useQuery({
    queryKey: ["admin-pending-count"],
    queryFn: async () => {
      const { count } = await supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "pending");
      return count || 0;
    },
  });

  const { data: activeCount } = useQuery({
    queryKey: ["admin-active-count"],
    queryFn: async () => {
      const { count } = await supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "approved");
      return count || 0;
    },
  });

  const { data: inquiryCount } = useQuery({
    queryKey: ["admin-inquiry-count"],
    queryFn: async () => {
      const { count } = await supabase.from("inquiries").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: orderCount } = useQuery({
    queryKey: ["admin-order-count"],
    queryFn: async () => {
      const { count } = await supabase.from("bookings").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const stats = [
    { label: "Total Products", value: productCount ?? 0, sub: `${pendingCount ?? 0} pending review` },
    { label: "Customers", value: "—", sub: "All registered" },
    { label: "Inquiries", value: inquiryCount ?? 0, sub: "Product inquiries" },
    { label: "Orders", value: orderCount ?? 0, sub: `${pendingCount ?? 0} pending` },
    { label: "Active Listings", value: activeCount ?? 0, sub: "Live in store" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Store Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
              <p className="text-3xl font-bold font-serif text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OverviewSection;
