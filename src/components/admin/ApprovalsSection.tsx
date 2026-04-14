import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("properties").update({ status: status as any }).eq("id", id);
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
    <div>
      <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Product Categories & Approvals</h1>
      <div className="mb-6">
        <h2 className="font-serif text-lg font-semibold text-foreground mb-3">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {["Executive Desks", "Managerial Desks", "L-Shaped Desks", "Adjustable Desks", "Workstations", "Executive Chairs", "Ergonomic Chairs", "Operator Chairs", "Visitor Chairs", "Conference Tables", "Sofas & Lounge", "Storage & Filing", "Training Furniture", "Accessories", "Home Furniture"].map(cat => (
            <span key={cat} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">{cat}</span>
          ))}
        </div>
      </div>
      <h2 className="font-serif text-lg font-semibold text-foreground mb-3">Pending Approval</h2>
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : !pending?.length ? (
        <p className="text-muted-foreground">No products pending approval.</p>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto">
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
              {pending.map((p) => (
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
        </div>
      )}
    </div>
  );
};

export default ApprovalsSection;
