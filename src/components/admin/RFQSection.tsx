import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const RFQ_STATUSES = ["New", "In Review", "Responded", "Closed"] as const;
type RFQStatus = (typeof RFQ_STATUSES)[number];

const badgeVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
  if (status === "New") return "default";
  if (status === "In Review") return "secondary";
  if (status === "Responded") return "outline";
  return "destructive";
};

const RFQSection = () => {
  const qc = useQueryClient();

  const { data: rfqs, isLoading } = useQuery({
    queryKey: ["admin-rfqs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rfq_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("rfq_requests").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-rfqs"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Sales desk</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.04em] text-foreground">Quote requests</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Review custom order requests and move each conversation through the response queue.
          </p>
        </div>
        {rfqs?.length ? (
          <span className="admin-panel-soft px-4 py-3 text-sm text-muted-foreground">{rfqs.length} total</span>
        ) : null}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : !rfqs?.length ? (
        <div className="admin-panel p-8 text-muted-foreground">No quote requests yet.</div>
      ) : (
        <div className="admin-table-panel">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rfqs.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium whitespace-nowrap">{r.full_name}</TableCell>
                  <TableCell>{r.company_name || "—"}</TableCell>
                  <TableCell>
                    <div className="text-xs space-y-0.5">
                      <div>{r.email}</div>
                      <div className="text-muted-foreground">{r.phone || "—"}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[140px] truncate text-sm">{r.product_interest || "—"}</TableCell>
                  <TableCell>{r.quantity ?? "—"}</TableCell>
                  <TableCell className="max-w-[180px]">
                    <p className="truncate text-xs text-muted-foreground">{r.message || "—"}</p>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={r.status}
                      onValueChange={(val) => updateStatus.mutate({ id: r.id, status: val })}
                    >
                      <SelectTrigger className="h-7 text-xs w-[110px]">
                        <Badge variant={badgeVariant(r.status)} className="text-[10px] px-1.5 py-0">
                          {r.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {RFQ_STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default RFQSection;
