import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, FileText, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  PRODUCT_IMPORT_HEADERS,
  buildProductImportTemplateCsv,
  csvEscape,
  validateProductCsv,
  type ProductCsvImportResult,
} from "@/lib/productCsvImport";
import EditProductDialog from "./EditProductDialog";

type AdminProduct = {
  id: string;
  title: string;
  description: string | null;
  long_description?: string | null;
  property_type: string;
  price: number | string;
  currency: string;
  location: string | null;
  city: string | null;
  country: string | null;
  images: string[] | null;
  color_variants?: unknown;
  status: string;
  featured: boolean | null;
  created_at: string;
};

const PropertiesSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortBy, setSortBy] = useState("created-desc");
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [csvImport, setCsvImport] = useState<(ProductCsvImportResult & { fileName: string }) | null>(null);
  const [parsingCsv, setParsingCsv] = useState(false);
  const [importingCsv, setImportingCsv] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as AdminProduct[];
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

  const invalidateProductQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["category-products"] });
    queryClient.invalidateQueries({ queryKey: ["storefront-products"] });
    queryClient.invalidateQueries({ queryKey: ["admin-product-count"] });
    queryClient.invalidateQueries({ queryKey: ["admin-active-count"] });
    queryClient.invalidateQueries({ queryKey: ["admin-pending-count"] });
    queryClient.invalidateQueries({ queryKey: ["admin-product-promotion-products"] });
    queryClient.invalidateQueries({ queryKey: ["admin-pairing-products"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Deleted" });
      invalidateProductQueries();
    }
  };

  const downloadCsv = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadImportTemplate = () => {
    downloadCsv(buildProductImportTemplateCsv(), "product-import-template.csv");
  };

  const exportCsv = () => {
    const rows: unknown[][] = [[...PRODUCT_IMPORT_HEADERS]];
    filtered.forEach((p) => rows.push([
      p.title || "",
      p.description || "",
      p.long_description || "",
      p.property_type || "",
      String(p.price ?? ""),
      p.currency || "USD",
      p.location || "",
      p.city || "Harare",
      p.country || "Zimbabwe",
      Array.isArray(p.images) ? p.images.join("|") : "",
      p.status || "approved",
      p.featured ? "true" : "false",
    ]));
    const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
    downloadCsv(csv, `products-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleCsvFile = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      toast({ title: "CSV required", description: "Upload a .csv product import file.", variant: "destructive" });
      return;
    }

    setParsingCsv(true);
    try {
      const result = validateProductCsv(await file.text(), products || []);
      setCsvImport({ ...result, fileName: file.name });

      if (result.errors.length) {
        toast({ title: "CSV has validation errors", description: "Fix the listed issues before importing.", variant: "destructive" });
      } else {
        toast({ title: "CSV ready", description: `${result.validRows.length} product(s) ready to import.` });
      }
    } catch (error) {
      toast({
        title: "Could not read CSV",
        description: error instanceof Error ? error.message : "Check the file and try again.",
        variant: "destructive",
      });
    } finally {
      setParsingCsv(false);
    }
  };

  const importCsvProducts = async () => {
    if (!user || !csvImport || csvImport.errors.length || !csvImport.validRows.length) return;

    setImportingCsv(true);
    const payload = csvImport.validRows.map((row) => ({
      ...row.payload,
      user_id: user.id,
    }));
    const { error } = await supabase.from("properties").insert(payload);
    setImportingCsv(false);

    if (error) {
      toast({ title: "Import failed", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Products imported", description: `${payload.length} product(s) added to the catalog.` });
    setCsvImport(null);
    invalidateProductQueries();
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
  const csvImportHasErrors = Boolean(csvImport?.errors.length);
  const csvImportReady = Boolean(csvImport && !csvImportHasErrors && csvImport.validRows.length);
  const visibleImportErrors = csvImport?.errors.slice(0, 10) || [];
  const previewImportRows = csvImport?.validRows.slice(0, 5) || [];

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
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" onClick={downloadImportTemplate} className="w-full sm:w-auto">Download Template</Button>
          <Button variant="outline" onClick={exportCsv} className="w-full sm:w-auto">Export CSV</Button>
        </div>
      </div>

      <Card className="border-grid/25 bg-card shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="font-serif text-2xl tracking-[-0.03em]">Import products</CardTitle>
          <CardDescription>CSV headers must use product database fields. Required: title, property_type, price.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 border border-grid/45 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground hover:text-background">
                <Upload className="h-4 w-4" />
                {parsingCsv ? "Checking CSV..." : "Upload CSV"}
                <input
                  type="file"
                  accept=".csv,text/csv"
                  disabled={parsingCsv || importingCsv}
                  onChange={(event) => {
                    handleCsvFile(event.target.files);
                    event.target.value = "";
                  }}
                  className="hidden"
                />
              </label>
              <Button type="button" variant="outline" onClick={downloadImportTemplate}>
                <FileText className="h-4 w-4" />
                Template
              </Button>
              {csvImport && (
                <Button type="button" variant="ghost" onClick={() => setCsvImport(null)}>
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>

            <div className="text-xs leading-6 text-muted-foreground lg:text-right">
              <span className="font-mono uppercase tracking-[0.18em]">Accepted headers</span>
              <div className="max-w-3xl break-words font-mono text-[11px]">{PRODUCT_IMPORT_HEADERS.join(", ")}</div>
            </div>
          </div>

          {csvImport && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="admin-panel-soft px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">File</p>
                  <p className="mt-2 truncate text-sm font-medium text-foreground">{csvImport.fileName}</p>
                </div>
                <div className="admin-panel-soft px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Valid rows</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{csvImport.validRows.length}</p>
                </div>
                <div className="admin-panel-soft px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Errors</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{csvImport.errors.length}</p>
                </div>
              </div>

              {csvImportHasErrors ? (
                <div className="border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  <div className="mb-3 flex items-center gap-2 font-medium">
                    <AlertTriangle className="h-4 w-4" />
                    Fix these issues before importing
                  </div>
                  <div className="space-y-2">
                    {visibleImportErrors.map((error, index) => (
                      <div key={`${error.rowNumber || "file"}-${index}`}>
                        {error.rowNumber ? `Row ${error.rowNumber}: ` : ""}
                        {error.message}
                      </div>
                    ))}
                    {csvImport.errors.length > visibleImportErrors.length && (
                      <div>{csvImport.errors.length - visibleImportErrors.length} more error(s) not shown.</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 border border-primary/25 bg-primary/10 p-4 text-sm text-foreground sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {csvImport.validRows.length} product(s) passed validation.
                  </div>
                  <Button type="button" onClick={importCsvProducts} disabled={!csvImportReady || importingCsv}>
                    {importingCsv ? "Importing..." : "Import Products"}
                  </Button>
                </div>
              )}

              {previewImportRows.length > 0 && (
                <div className="admin-table-panel">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewImportRows.map((row) => (
                        <TableRow key={row.rowNumber}>
                          <TableCell>{row.rowNumber}</TableCell>
                          <TableCell>{row.payload.title}</TableCell>
                          <TableCell>{row.payload.property_type}</TableCell>
                          <TableCell>{row.payload.currency} {row.payload.price.toLocaleString()}</TableCell>
                          <TableCell>{row.payload.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
