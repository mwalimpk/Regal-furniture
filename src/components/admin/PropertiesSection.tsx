import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import EditProductDialog from "./EditProductDialog";

const PropertiesSection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortBy, setSortBy] = useState("created-desc");
  const [editing, setEditing] = useState<any | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const categories = useMemo(() => {
    if (!products) return [];
    return [...new Set(products.map((product) => product.property_type).filter(Boolean))].sort((left, right) => String(left).localeCompare(String(right)));
  }, [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    const min = minPrice === "" ? null : Number(minPrice);
    const max = maxPrice === "" ? null : Number(maxPrice);

    const next = products.filter((p) => {
      const s = search.toLowerCase();
      const matches = !s || p.title?.toLowerCase().includes(s) || p.property_type?.toLowerCase().includes(s) || p.location?.toLowerCase().includes(s);
      const matchesCategory = category === "all" || p.property_type === category;
      const price = Number(p.price || 0);
      const matchesMin = min === null || price >= min;
      const matchesMax = max === null || price <= max;
      const created = new Date(p.created_at);
      const okFrom = !from || created >= new Date(from);
      const okTo = !to || created <= new Date(to + "T23:59:59");
      return matches && matchesCategory && matchesMin && matchesMax && okFrom && okTo;
    });

    return next.sort((left, right) => {
      switch (sortBy) {
        case "created-asc":
          return new Date(left.created_at).getTime() - new Date(right.created_at).getTime();
        case "price-asc":
          return Number(left.price || 0) - Number(right.price || 0);
        case "price-desc":
          return Number(right.price || 0) - Number(left.price || 0);
        case "category-asc":
          return String(left.property_type || "").localeCompare(String(right.property_type || ""));
        case "category-desc":
          return String(right.property_type || "").localeCompare(String(left.property_type || ""));
        case "created-desc":
        default:
          return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
      }
    });
  }, [products, search, category, minPrice, maxPrice, from, to, sortBy]);

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setFrom("");
    setTo("");
    setSortBy("created-desc");
  };

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
      case "approved": return "border border-grid/20 bg-primary/10 text-foreground";
      case "pending": return "border border-accent/30 bg-accent/15 text-foreground";
      case "rejected": return "border border-destructive/30 bg-destructive/10 text-destructive";
      default: return "";
    }
  };

  const storefrontProductUrl = (id: string) => `/product/${id}`;

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

      <Card className="border-grid/25 bg-card shadow-none">
        <CardContent className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 xl:grid-cols-8">
          <div className="xl:col-span-2">
            <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Search</label>
            <Input placeholder="Name, category, SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="xl:col-span-2">
            <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Min price</label>
            <Input type="number" min="0" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Max price</label>
            <Input type="number" min="0" placeholder="5000" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">From</label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">To</label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="xl:col-span-2">
            <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Sort</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="created-desc">Newest first</SelectItem>
                <SelectItem value="created-asc">Oldest first</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
                <SelectItem value="category-asc">Category: A to Z</SelectItem>
                <SelectItem value="category-desc">Category: Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end xl:col-span-2">
            <Button type="button" variant="outline" className="w-full" onClick={resetFilters}>Reset filters</Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : !filtered.length ? (
        <Card className="border-grid/25 bg-card shadow-none">
          <CardContent className="p-8 text-muted-foreground">No products match your filters.</CardContent>
        </Card>
      ) : (
        <div className="admin-table-panel">
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
                      <img src={p.images[0]} alt={p.title} className="h-12 w-12 object-cover" />
                    ) : (
                      <div className="h-12 w-12 bg-muted" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <a
                      href={storefrontProductUrl(p.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-foreground underline decoration-grid/50 underline-offset-4 transition-colors hover:text-crimson hover:decoration-crimson"
                    >
                      {p.title}
                    </a>
                  </TableCell>
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
