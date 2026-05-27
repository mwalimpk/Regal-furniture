import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { categories as storefrontCategories } from "@/data/products";

type CatalogueRecord = {
  id: string;
  title: string;
  category: string;
  year: number;
  month: number;
  document_url: string;
  document_name: string;
  document_type: string;
  cover_image_url: string;
  imported_count: number;
  status: string;
  created_at: string;
  user_id: string;
};

type ProductImportRow = Record<string, unknown> & {
  rowNumber: number;
  title: string;
  property_type: string;
  price: number;
  currency: string;
  description?: string;
  location?: string;
  city?: string;
  image?: string;
};

const monthOptions = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const documentExtensions = [".csv", ".tsv", ".txt", ".xls", ".xlsx", ".pdf", ".doc", ".docx"];
const importableExtensions = [".csv", ".tsv", ".txt"];

const initialForm = {
  title: "",
  category: "Full Catalogue",
  year: String(new Date().getFullYear()),
  month: String(new Date().getMonth() + 1),
};

const categoryOptions = ["Full Catalogue", ...storefrontCategories.map((category) => category.name)];

const sanitizeFileName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "") || "catalogue-file";

const extensionOf = (file: File) => {
  const dotIndex = file.name.lastIndexOf(".");
  return dotIndex >= 0 ? file.name.slice(dotIndex).toLowerCase() : "";
};

const isAllowedDocument = (file: File) => documentExtensions.includes(extensionOf(file));
const isImportableDocument = (file: File) => importableExtensions.includes(extensionOf(file));

const detectDelimiter = (line: string) => {
  const candidates = [",", "\t", ";"];
  return candidates
    .map((delimiter) => ({ delimiter, count: splitDelimitedLine(line, delimiter).length }))
    .sort((left, right) => right.count - left.count)[0].delimiter;
};

const splitDelimitedLine = (line: string, delimiter: string) => {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === delimiter && !quoted) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
};

const canonicalHeader = (value: string) => {
  const normalized = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const aliases: Record<string, keyof ProductImportRow | "skip"> = {
    title: "title",
    name: "title",
    product: "title",
    product_name: "title",
    item: "title",
    item_name: "title",
    category: "property_type",
    collection: "property_type",
    type: "property_type",
    product_type: "property_type",
    property_type: "property_type",
    price: "price",
    unit_price: "price",
    selling_price: "price",
    amount: "price",
    cost: "price",
    currency: "currency",
    description: "description",
    details: "description",
    notes: "description",
    sku: "location",
    model: "location",
    code: "location",
    location: "location",
    city: "city",
    warehouse: "city",
    image: "image",
    image_url: "image",
    photo: "image",
  };

  return aliases[normalized] || "skip";
};

const parsePrice = (value: unknown) => Number(String(value ?? "").replace(/[^0-9.-]/g, ""));

const parseCatalogueRows = async (file: File) => {
  const text = await file.text();
  const lines = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((line) => line.trim());

  if (lines.length < 2) {
    return { products: [] as ProductImportRow[], issues: ["The import file needs a header row and at least one product row."] };
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = splitDelimitedLine(lines[0], delimiter).map(canonicalHeader);
  const issues: string[] = [];
  const products: ProductImportRow[] = [];
  const seen = new Set<string>();

  lines.slice(1).forEach((line, index) => {
    const rowNumber = index + 2;
    const cells = splitDelimitedLine(line, delimiter);
    const draft: Record<string, unknown> = { rowNumber };

    headers.forEach((header, cellIndex) => {
      if (header === "skip") return;
      draft[header] = cells[cellIndex] || "";
    });

    const title = String(draft.title || "").trim();
    const propertyType = String(draft.property_type || "").trim();
    const price = parsePrice(draft.price);
    const currency = String(draft.currency || "USD").trim().toUpperCase();
    const key = [title, propertyType, String(draft.location || "")].map((value) => value.toLowerCase()).join("|");
    const rowIssues: string[] = [];

    if (!title) rowIssues.push("missing product name");
    if (!propertyType) rowIssues.push("missing category");
    if (!Number.isFinite(price) || price < 0) rowIssues.push("invalid price");
    if (!["USD", "ZWL"].includes(currency)) rowIssues.push("unsupported currency");
    if (seen.has(key)) rowIssues.push("duplicate row");

    if (rowIssues.length) {
      issues.push(`Row ${rowNumber}: ${rowIssues.join(", ")}.`);
      return;
    }

    seen.add(key);
    products.push({
      rowNumber,
      title,
      property_type: propertyType,
      price,
      currency,
      description: String(draft.description || "").trim(),
      location: String(draft.location || "").trim(),
      city: String(draft.city || "Harare").trim(),
      image: String(draft.image || "").trim(),
    });
  });

  return { products, issues };
};

const uploadAdminFile = async (bucket: string, folder: string, file: File) => {
  const path = `${folder}/${Date.now()}-${sanitizeFileName(file.name)}`;
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error || !data) throw new Error(error?.message || "Upload failed.");
  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicData.publicUrl;
};

const CataloguesSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [parsedProducts, setParsedProducts] = useState<ProductImportRow[]>([]);
  const [parseIssues, setParseIssues] = useState<string[]>([]);
  const [parseNote, setParseNote] = useState("Upload CSV or TSV catalogues to import products automatically.");
  const [saving, setSaving] = useState(false);
  const [yearFilter, setYearFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created-desc");

  const { data: catalogues = [], isLoading } = useQuery({
    queryKey: ["admin-catalogues"],
    queryFn: async () => {
      const { data, error } = await supabase.from("catalogues").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as CatalogueRecord[];
    },
  });

  const years = useMemo(() => [...new Set(catalogues.map((catalogue) => catalogue.year))].sort((left, right) => right - left), [catalogues]);
  const categories = useMemo(() => [...new Set(catalogues.map((catalogue) => catalogue.category).filter(Boolean))].sort(), [catalogues]);

  const filteredCatalogues = useMemo(() => {
    const next = catalogues.filter((catalogue) => {
      const matchesYear = yearFilter === "all" || String(catalogue.year) === yearFilter;
      const matchesMonth = monthFilter === "all" || String(catalogue.month) === monthFilter;
      const matchesCategory = categoryFilter === "all" || catalogue.category === categoryFilter;
      return matchesYear && matchesMonth && matchesCategory;
    });

    return next.sort((left, right) => {
      switch (sortBy) {
        case "year-desc":
          return right.year - left.year || right.month - left.month;
        case "year-asc":
          return left.year - right.year || left.month - right.month;
        case "title-asc":
          return left.title.localeCompare(right.title);
        case "category-asc":
          return left.category.localeCompare(right.category);
        case "created-desc":
        default:
          return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
      }
    });
  }, [catalogues, yearFilter, monthFilter, categoryFilter, sortBy]);

  const updateForm = (key: keyof typeof initialForm, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const handleDocumentChange = async (file: File | null) => {
    setDocumentFile(file);
    setParsedProducts([]);
    setParseIssues([]);

    if (!file) {
      setParseNote("Upload CSV or TSV catalogues to import products automatically.");
      return;
    }

    if (!isAllowedDocument(file)) {
      setParseNote("Unsupported document type.");
      setParseIssues([`Use one of these formats: ${documentExtensions.join(", ")}.`]);
      return;
    }

    if (!isImportableDocument(file)) {
      setParseNote("This catalogue will be stored and sortable. Product import is available for CSV, TSV, or text exports to avoid unreliable PDF/Excel parsing.");
      return;
    }

    try {
      const parsed = await parseCatalogueRows(file);
      setParsedProducts(parsed.products);
      setParseIssues(parsed.issues);
      setParseNote(`${parsed.products.length} valid product row(s) ready to import.`);
    } catch (error) {
      setParseNote("Could not parse this catalogue.");
      setParseIssues([error instanceof Error ? error.message : "Check the file format and try again."]);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setDocumentFile(null);
    setCoverFile(null);
    setParsedProducts([]);
    setParseIssues([]);
    setParseNote("Upload CSV or TSV catalogues to import products automatically.");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    const year = Number(form.year);
    const month = Number(form.month);

    if (!form.title.trim() || !form.category.trim()) {
      toast({ title: "Missing details", description: "Catalogue title and category are required.", variant: "destructive" });
      return;
    }

    if (!Number.isInteger(year) || year < 2000 || year > 2100 || !Number.isInteger(month) || month < 1 || month > 12) {
      toast({ title: "Invalid date", description: "Use a valid catalogue year and month.", variant: "destructive" });
      return;
    }

    if (!documentFile || !coverFile) {
      toast({ title: "Files required", description: "Upload both the catalogue document and its cover image.", variant: "destructive" });
      return;
    }

    if (!isAllowedDocument(documentFile)) {
      toast({ title: "Unsupported document", description: `Allowed formats: ${documentExtensions.join(", ")}`, variant: "destructive" });
      return;
    }

    if (!coverFile.type.startsWith("image/")) {
      toast({ title: "Invalid cover image", description: "The catalogue cover must be an image file.", variant: "destructive" });
      return;
    }

    setSaving(true);

    try {
      const [documentUrl, coverImageUrl] = await Promise.all([
        uploadAdminFile("catalogues", "catalogues/documents", documentFile),
        uploadAdminFile("catalogues", "catalogues/covers", coverFile),
      ]);

      const { data: catalogue, error } = await supabase
        .from("catalogues")
        .insert({
          title: form.title.trim(),
          category: form.category.trim(),
          year,
          month,
          document_url: documentUrl,
          document_name: documentFile.name,
          document_type: documentFile.type || extensionOf(documentFile).replace(".", ""),
          cover_image_url: coverImageUrl,
          user_id: user.id,
          imported_count: 0,
          status: "uploaded",
        })
        .single();

      if (error || !catalogue) throw new Error(error?.message || "Could not save catalogue.");

      let importedCount = 0;
      let rejectedCount = 0;

      if (parsedProducts.length) {
        const importResponse = await supabase.catalogues.importProducts({
          catalogueId: (catalogue as CatalogueRecord).id,
          userId: user.id,
          rows: parsedProducts,
        });

        if (importResponse.error) throw new Error(importResponse.error.message);
        importedCount = importResponse.data?.importedCount || 0;
        rejectedCount = importResponse.data?.rejected.length || 0;
      }

      toast({
        title: "Catalogue saved",
        description: parsedProducts.length
          ? `${importedCount} product(s) imported${rejectedCount ? `, ${rejectedCount} skipped` : ""}.`
          : "Document stored. Use CSV or TSV uploads when you want product import.",
      });

      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-catalogues"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["category-products"] });
      queryClient.invalidateQueries({ queryKey: ["storefront-products"] });
    } catch (error) {
      toast({ title: "Catalogue upload failed", description: error instanceof Error ? error.message : "Try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Catalogue library</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.04em] text-foreground">Catalogues</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Upload catalogue documents with cover images, keep them sortable by period and collection, and import products from safe CSV/TSV exports.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="border-grid/25 bg-card shadow-none">
          <CardHeader>
            <CardTitle className="font-serif text-2xl tracking-[-0.03em]">Upload catalogue</CardTitle>
            <CardDescription>CSV, TSV, Excel, PDF, DOC, and DOCX files can be stored. CSV/TSV files can also create products.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Catalogue title</Label>
                <Input value={form.title} onChange={(event) => updateForm("title", event.target.value)} placeholder="Regal Office 2026" required />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(value) => updateForm("category", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input type="number" min="2000" max="2100" value={form.year} onChange={(event) => updateForm("year", event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={form.month} onValueChange={(value) => updateForm("month", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((month) => <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Catalogue document</Label>
                <Input
                  type="file"
                  accept={documentExtensions.join(",")}
                  onChange={(event) => handleDocumentChange(event.target.files?.[0] || null)}
                  required
                />
                <p className="text-xs leading-5 text-muted-foreground">{parseNote}</p>
              </div>
              <div className="space-y-2">
                <Label>Cover image</Label>
                <Input type="file" accept="image/*" onChange={(event) => setCoverFile(event.target.files?.[0] || null)} required />
                <p className="text-xs leading-5 text-muted-foreground">A cover image is required for every catalogue.</p>
              </div>
            </div>

            {parseIssues.length ? (
              <div className="admin-panel-soft p-4 text-sm leading-6 text-muted-foreground">
                <p className="font-medium text-foreground">Rows needing attention</p>
                <ul className="mt-2 space-y-1">
                  {parseIssues.slice(0, 5).map((issue) => <li key={issue}>{issue}</li>)}
                </ul>
                {parseIssues.length > 5 ? <p className="mt-2">+ {parseIssues.length - 5} more issue(s)</p> : null}
              </div>
            ) : null}

            <Button type="submit" disabled={saving} className="bg-heritage text-primary-foreground hover:bg-heritage/90">
              {saving ? "Saving..." : "Save Catalogue"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-grid/25 bg-card shadow-none">
          <CardHeader>
            <CardTitle className="font-serif text-2xl tracking-[-0.03em]">Import preview</CardTitle>
            <CardDescription>Only validated rows are sent to the backend import endpoint.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="admin-panel-soft p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Valid rows</p>
                <p className="mt-2 font-serif text-4xl text-foreground">{parsedProducts.length}</p>
              </div>
              <div className="admin-panel-soft p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Issues</p>
                <p className="mt-2 font-serif text-4xl text-foreground">{parseIssues.length}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Expected product columns include name/title, category, price, currency, SKU/model, description, warehouse, and optional image URL.
            </p>
          </CardContent>
        </Card>
      </form>

      <Card className="border-grid/25 bg-card shadow-none">
        <CardHeader>
          <CardTitle className="font-serif text-2xl tracking-[-0.03em]">Catalogue archive</CardTitle>
          <CardDescription>Sort uploaded catalogues by year, month, and category.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 md:grid-cols-4">
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {years.map((year) => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All months</SelectItem>
                {monthOptions.map((month) => <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="created-desc">Newest upload</SelectItem>
                <SelectItem value="year-desc">Year/month descending</SelectItem>
                <SelectItem value="year-asc">Year/month ascending</SelectItem>
                <SelectItem value="title-asc">Title A to Z</SelectItem>
                <SelectItem value="category-asc">Category A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : !filteredCatalogues.length ? (
            <div className="admin-panel p-8 text-muted-foreground">No catalogues match the current filters.</div>
          ) : (
            <div className="admin-table-panel">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cover</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Imported</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Document</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCatalogues.map((catalogue) => (
                    <TableRow key={catalogue.id}>
                      <TableCell>
                        <img src={catalogue.cover_image_url} alt={catalogue.title} className="h-16 w-12 object-cover" />
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-foreground">{catalogue.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{catalogue.document_name}</p>
                      </TableCell>
                      <TableCell>{catalogue.category}</TableCell>
                      <TableCell>{monthOptions.find((month) => month.value === String(catalogue.month))?.label} {catalogue.year}</TableCell>
                      <TableCell>{catalogue.imported_count || 0}</TableCell>
                      <TableCell>{catalogue.status}</TableCell>
                      <TableCell className="text-right">
                        <a href={catalogue.document_url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-end gap-2 text-sm font-medium text-foreground hover:text-interactive">
                          Open <ExternalLink size={14} />
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CataloguesSection;
