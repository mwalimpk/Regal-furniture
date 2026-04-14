import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const BookingsSection = () => {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("*, properties(title)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Bookings</h1>
      {isLoading ? <p className="text-muted-foreground">Loading...</p> : !bookings?.length ? (
        <p className="text-muted-foreground">No bookings yet.</p>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Property</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
            <TableBody>
              {bookings.map((b: any) => (
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
