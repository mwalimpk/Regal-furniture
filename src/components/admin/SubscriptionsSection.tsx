import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const SubscriptionsSection = () => {
  const { data: subs, isLoading } = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subscriptions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Subscriptions</h1>
      {isLoading ? <p className="text-muted-foreground">Loading...</p> : !subs?.length ? (
        <p className="text-muted-foreground">No subscriptions yet.</p>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Plan</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Start</TableHead><TableHead>End</TableHead></TableRow></TableHeader>
            <TableBody>
              {subs.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.plan_name}</TableCell>
                  <TableCell>{s.currency} {Number(s.amount).toLocaleString()}</TableCell>
                  <TableCell><Badge variant="outline">{s.status}</Badge></TableCell>
                  <TableCell className="text-sm">{new Date(s.start_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm">{s.end_date ? new Date(s.end_date).toLocaleDateString() : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsSection;
