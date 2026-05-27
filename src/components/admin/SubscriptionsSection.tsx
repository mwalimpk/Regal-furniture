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
    <div className="space-y-6">
      <div className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Accounts</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.04em] text-foreground">Subscriptions</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Review subscription records and billing state for account-based customers.
        </p>
      </div>
      {isLoading ? <p className="text-muted-foreground">Loading...</p> : !subs?.length ? (
        <div className="admin-panel p-8 text-muted-foreground">No subscriptions yet.</div>
      ) : (
        <div className="admin-table-panel">
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
