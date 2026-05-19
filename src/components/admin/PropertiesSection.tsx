import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import EditProductDialog from "./EditProductDialog";

const PropertiesSection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [editing, setEditing] = useState<any | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const s = search.toLowerCase();
      const matches = !s || p.title?.toLowerCase().includes(s) || p.property_type?.toLowerCase().includes(s) || p.location?.toLowerCase().includes(s);
      const created = new Date(p.created_at);
      const okFrom = !from || created >= new Date(from);
      const okTo = !to || created <= new Date(to + "T23:59:59");
      return matches && okFrom && okTo;
    });
  }, [products, search, from, to]);

  const remove = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Deleted" });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["category-products"] });
      queryClient.invalidateQueries({ queryKey: ["storefront-products"] });
    }
  };

  const exportCsv = () => {
    const rows = [["Name", "Category", "Price", "Currency", "SKU", "Status", "Created"]];
    filtered.forEach((p) => rows.push([p.title, p.property_type, String(p.price), p.currency, p.location || "", p.status, new Date(p.created_at).toISOString()]));
    const csv = rows.map((r) => r.map((c) => `"${(c || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Catalog</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.04em] text-foreground">Products</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Review live products, narrow the list quickly, and export the current catalog view when you need a working sheet.
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv} className="w-full sm:w-auto">Export CSV</Button>
      </div>

      <Card className="rounded-[1.75rem] border-[#e3d7c8] bg-white/90 shadow-none">
        <CardContent className="grid grid-cols-1 gap-3 p-5 md:grid-cols-4">
          <Input placeholder="Search name, category, SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="md:col-span-2" />
          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">From</label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">To</label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : !filtered.length ? (
        <Card className="rounded-[1.75rem] border-[#e3d7c8] bg-white/90 shadow-none">
          <CardContent className="p-8 text-muted-foreground">No products match your filters.</CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-[1.75rem] border border-[#e3d7c8] bg-white/92">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.title} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>{p.property_type}</TableCell>
                  <TableCell>{p.currency} {Number(p.price).toLocaleString()}</TableCell>
                  <TableCell><Badge className={statusColor(p.status)}>{p.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(p)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(p.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <EditProductDialog product={editing} open={!!editing} onOpenChange={(o) => !o && setEditing(null)} />
    </div>
  );
};

export default PropertiesSection;
