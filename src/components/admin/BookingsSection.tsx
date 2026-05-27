import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const BookingsSection = () => {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("*, properties(title)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Fulfillment</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.04em] text-foreground">Orders</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Monitor customer orders and the product activity attached to each request.
        </p>
      </div>
      {isLoading ? <p className="text-muted-foreground">Loading...</p> : !orders?.length ? (
        <div className="admin-panel p-8 text-muted-foreground">No orders yet. Orders placed by customers will appear here.</div>
      ) : (
        <div className="admin-table-panel">
          <Table>
            <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Order Date</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
            <TableBody>
              {orders.map((b: any) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.properties?.title || "—"}</TableCell>
                  <TableCell>{b.booking_date}</TableCell>
                  <TableCell><Badge variant="outline">{b.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default BookingsSection;
