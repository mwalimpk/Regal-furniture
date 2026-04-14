import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, MessageSquare, Calendar, CheckSquare } from "lucide-react";

const OverviewSection = () => {
  const { data: propertyCount } = useQuery({
    queryKey: ["admin-property-count"],
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

  const { data: approvedCount } = useQuery({
    queryKey: ["admin-approved-count"],
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

  const { data: bookingCount } = useQuery({
    queryKey: ["admin-booking-count"],
    queryFn: async () => {
      const { count } = await supabase.from("bookings").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const stats = [
    { label: "Total Properties", value: propertyCount ?? 0, sub: `${pendingCount ?? 0} pending`, icon: Building2 },
    { label: "Total Users", value: "—", sub: "All registered", icon: Users },
    { label: "Inquiries", value: inquiryCount ?? 0, sub: `${inquiryCount ?? 0} new`, icon: MessageSquare },
    { label: "Bookings", value: bookingCount ?? 0, sub: `${pendingCount ?? 0} pending`, icon: Calendar },
    { label: "Approved Listings", value: approvedCount ?? 0, sub: "Live on site", icon: CheckSquare },
  ];

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
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
