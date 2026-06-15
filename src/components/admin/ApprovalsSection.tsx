import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AdminTablePagination from "./AdminTablePagination";
import { useAdminTablePagination } from "./useAdminTablePagination";
import type { Database } from "@/integrations/supabase/types";

type PropertyStatus = Database["public"]["Enums"]["property_status"];

const ApprovalsSection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pending, isLoading } = useQuery({
    queryKey: ["admin-pending-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").eq("status", "pending").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const pendingPagination = useAdminTablePagination(pending || []);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PropertyStatus }) => {
      const { error } = await supabase.from("properties").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product-count"] });
      queryClient.invalidateQueries({ queryKey: ["admin-active-count"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-count"] });
      toast({ title: "Updated", description: "Product status updated." });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Catalog governance</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.04em] text-foreground">Product approvals</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Approve pending products before they enter the storefront.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-lg font-semibold text-foreground">Pending approval</h2>
        {pending?.length ? <span className="text-sm text-muted-foreground">{pending.length} waiting</span> : null}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : !pending?.length ? (
        <div className="admin-panel p-8 text-muted-foreground">No products pending approval.</div>
      ) : (
        <div className="admin-table-panel">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPagination.paginatedItems.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>{p.property_type}</TableCell>
                  <TableCell>{p.currency} {Number(p.price).toLocaleString()}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" onClick={() => updateStatus.mutate({ id: p.id, status: "approved" })}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => updateStatus.mutate({ id: p.id, status: "rejected" })}>Reject</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <AdminTablePagination pagination={pendingPagination} itemLabel="products" />
        </div>
      )}
    </div>
  );
};

export default ApprovalsSection;
