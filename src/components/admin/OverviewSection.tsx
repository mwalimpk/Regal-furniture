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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Overview</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.04em] text-foreground">Store dashboard</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Keep an eye on catalog health, lead activity, and the volume moving through the local store workspace.
          </p>
        </div>
        <div className="admin-panel-soft max-w-xl px-5 py-4 text-sm leading-6 text-muted-foreground">
          Today&apos;s view reflects local project data and storefront activity connected inside this workspace.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-grid/25 bg-card shadow-none">
            <CardContent className="p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{stat.label}</p>
              <p className="mt-3 font-serif text-4xl font-semibold tracking-[-0.04em] text-foreground">{stat.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OverviewSection;
