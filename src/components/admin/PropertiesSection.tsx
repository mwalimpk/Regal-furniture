import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, CheckCircle2, CircleHelp, FileText, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useProductCategories } from "@/hooks/useProductCategories";
import {
  PRODUCT_IMPORT_HEADER_EXAMPLES,
  PRODUCT_IMPORT_HEADER_LABELS,
  PRODUCT_IMPORT_HEADERS,
  PRODUCT_IMPORT_IGNORE_HEADER,
  analyzeProductCsvHeaders,
  buildProductImportTemplateCsv,
  csvEscape,
  validateProductCsv,
  type ProductCsvHeaderAnalysis,
  type ProductCsvHeaderInterpretation,
  type ProductCsvHeaderMatchType,
  type ProductCsvImportResult,
  type ProductImportHeader,
  type ProductImportHeaderDecision,
} from "@/lib/productCsvImport";
import EditProductDialog from "./EditProductDialog";
import AdminTablePagination from "./AdminTablePagination";
import { useAdminTablePagination } from "./useAdminTablePagination";

const IMPORT_PREVIEW_PAGE_SIZE_OPTIONS = [5, 10, 25];
const REQUIRED_PRODUCT_IMPORT_LABELS = [
  PRODUCT_IMPORT_HEADER_LABELS.title,
  PRODUCT_IMPORT_HEADER_LABELS.property_type,
  PRODUCT_IMPORT_HEADER_LABELS.price,
].join(", ");
const PRODUCT_IMPORT_TOOLTIP_MAPPINGS = [
  `${PRODUCT_IMPORT_HEADER_LABELS.title} -> title`,
  `${PRODUCT_IMPORT_HEADER_LABELS.property_type} -> property_type`,
  `${PRODUCT_IMPORT_HEADER_LABELS.location} -> location`,
  `${PRODUCT_IMPORT_HEADER_LABELS.city} -> city`,
].join(", ");
const PRODUCT_IMPORT_FIELD_OPTIONS = PRODUCT_IMPORT_HEADERS.map((header) => ({
  header,
  label: `${PRODUCT_IMPORT_HEADER_LABELS[header]} (${header})`,
}));
const PRODUCT_HEADER_MATCH_LABELS: Record<ProductCsvHeaderMatchType, string> = {
  database: "Database field",
  "form-label": "Form label",
  alias: "Known alias",
  manual: "Confirmed",
  ignored: "Ignored",
  unmatched: "Needs review",
};

type AdminProduct = {
  id: string;
  title: string;
  description: string | null;
  long_description?: string | null;
  property_type: string;
  featured_slug?: string | null;
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

type CsvHeaderReview = {
  fileName: string;
  text: string;
  analysis: ProductCsvHeaderAnalysis;
  decisions: Record<string, ProductImportHeaderDecision>;
};

const getHeaderTargetLabel = (header: ProductImportHeader | null) =>
  header ? `${PRODUCT_IMPORT_HEADER_LABELS[header]} (${header})` : "Ignored";

const getInitialHeaderDecisions = (analysis: ProductCsvHeaderAnalysis) =>
  analysis.unresolvedHeaders.reduce((decisions, interpretation) => ({
    ...decisions,
    [interpretation.rawHeader]: interpretation.suggestedHeader || PRODUCT_IMPORT_IGNORE_HEADER,
  }), {} as Record<string, ProductImportHeaderDecision>);

const getHeaderSampleText = (interpretation: ProductCsvHeaderInterpretation) =>
  interpretation.sampleValues.length ? interpretation.sampleValues.join(" | ") : "No sample values";

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
  const [csvHeaderReview, setCsvHeaderReview] = useState<CsvHeaderReview | null>(null);
  const [parsingCsv, setParsingCsv] = useState(false);
  const [importingCsv, setImportingCsv] = useState(false);
  const { data: productCategories = [] } = useProductCategories();
  const categoryOptions = useMemo(() => productCategories.map((item) => item.name), [productCategories]);
  const featuredSlugOptions = useMemo(
    () => productCategories.flatMap((categoryItem) => (
      categoryItem.featured.map((item) => ({ category: categoryItem.name, slug: item.slug }))
    )),
    [productCategories],
  );

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as AdminProduct[];
    },
  });

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
      p.featured_slug || "",
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

  const validateCsvText = (
    text: string,
    fileName: string,
    headerMappings?: Record<string, ProductImportHeaderDecision>,
  ) => {
    const result = validateProductCsv(
      text,
      products || [],
      categoryOptions,
      featuredSlugOptions,
      { headerMappings },
    );

    setCsvImport({ ...result, fileName });

    if (result.errors.length) {
      toast({ title: "CSV has validation errors", description: "Fix the listed issues before importing.", variant: "destructive" });
    } else {
      const ignoredText = result.ignoredHeaders.length ? ` ${result.ignoredHeaders.length} column(s) ignored.` : "";
      toast({ title: "CSV ready", description: `${result.validRows.length} product(s) ready to import.${ignoredText}` });
    }

    return result;
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
      const text = await file.text();
      const analysis = analyzeProductCsvHeaders(text);

      if (analysis.errors.length) {
        setCsvHeaderReview(null);
        validateCsvText(text, file.name);
        return;
      }

      if (analysis.unresolvedHeaders.length) {
        setCsvImport(null);
        setCsvHeaderReview({
          fileName: file.name,
          text,
          analysis,
          decisions: getInitialHeaderDecisions(analysis),
        });
        toast({
          title: "Review CSV headers",
          description: `${analysis.unresolvedHeaders.length} unfamiliar header(s) need confirmation before import.`,
        });
        return;
      }

      setCsvHeaderReview(null);
      validateCsvText(text, file.name);
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

  const updateCsvHeaderDecision = (rawHeader: string, decision: ProductImportHeaderDecision) => {
    setCsvHeaderReview((current) => {
      if (!current) return current;
      return {
        ...current,
        decisions: {
          ...current.decisions,
          [rawHeader]: decision,
        },
      };
    });
  };

  const useSuggestedHeaderDecisions = () => {
    setCsvHeaderReview((current) => {
      if (!current) return current;
      return {
        ...current,
        decisions: getInitialHeaderDecisions(current.analysis),
      };
    });
  };

  const ignoreUnresolvedHeaders = () => {
    setCsvHeaderReview((current) => {
      if (!current) return current;
      return {
        ...current,
        decisions: current.analysis.unresolvedHeaders.reduce((decisions, interpretation) => ({
          ...decisions,
          [interpretation.rawHeader]: PRODUCT_IMPORT_IGNORE_HEADER,
        }), current.decisions),
      };
    });
  };

  const applyCsvHeaderDecisions = () => {
    if (!csvHeaderReview) return;

    const result = validateCsvText(csvHeaderReview.text, csvHeaderReview.fileName, csvHeaderReview.decisions);
    if (!result.errors.length) setCsvHeaderReview(null);
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
  const previewImportRows = csvImport?.validRows || [];
  const interpretedHeaderCount = csvImport?.interpretations.filter((item) => item.header).length || 0;
  const ignoredHeaderCount = csvImport?.ignoredHeaders.length || 0;
  const headerReviewHasSuggestions = Boolean(csvHeaderReview?.analysis.unresolvedHeaders.some((item) => item.suggestedHeader));
  const importPreviewPagination = useAdminTablePagination(previewImportRows, {
    initialPageSize: 5,
    pageSizeOptions: IMPORT_PREVIEW_PAGE_SIZE_OPTIONS,
  });
  const productPagination = useAdminTablePagination(filtered);

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
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>CSV headers can use product form labels or database fields. Required: {REQUIRED_PRODUCT_IMPORT_LABELS}.</span>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="Explain CSV product headers"
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-grid/40 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <CircleHelp className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm text-xs leading-5">
                  <p className="font-medium text-popover-foreground">Form labels map to database fields.</p>
                  <p className="mt-1">
                    Examples: {PRODUCT_IMPORT_TOOLTIP_MAPPINGS}. Either style works, but include only one column for each field.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
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
              {(csvImport || csvHeaderReview) && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setCsvImport(null);
                    setCsvHeaderReview(null);
                  }}
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>

            <div className="text-xs leading-6 text-muted-foreground lg:text-right">
              <span className="font-mono uppercase tracking-[0.18em]">Accepted headers</span>
              <div className="max-w-3xl break-words font-mono text-[11px]">{PRODUCT_IMPORT_HEADER_EXAMPLES.join(", ")}</div>
            </div>
          </div>

          {csvHeaderReview && (
            <div className="border border-accent/30 bg-accent/10 p-4 text-sm text-foreground">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <CircleHelp className="h-4 w-4" />
                    Review header matches
                  </div>
                  <p className="mt-2 max-w-3xl leading-6 text-muted-foreground">
                    The importer found {csvHeaderReview.analysis.unresolvedHeaders.length} unfamiliar header(s) in {csvHeaderReview.fileName}.
                    Confirm what each one means, or ignore columns that should not be imported.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {headerReviewHasSuggestions && (
                    <Button type="button" variant="outline" onClick={useSuggestedHeaderDecisions}>
                      <CheckCircle2 className="h-4 w-4" />
                      Use Suggestions
                    </Button>
                  )}
                  <Button type="button" variant="outline" onClick={ignoreUnresolvedHeaders}>
                    <X className="h-4 w-4" />
                    Ignore All
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {csvHeaderReview.analysis.unresolvedHeaders.map((interpretation, index) => (
                  <div
                    key={`${interpretation.rawHeader}-${index}`}
                    className="grid gap-3 border border-grid/25 bg-background/80 p-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(220px,320px)] md:items-center"
                  >
                    <div className="min-w-0">
                      <p className="break-words font-mono text-xs text-foreground">{interpretation.rawHeader}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        Samples: {getHeaderSampleText(interpretation)}
                      </p>
                      {interpretation.suggestedHeader && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Suggested: {getHeaderTargetLabel(interpretation.suggestedHeader)}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="hidden h-4 w-4 text-muted-foreground md:block" />
                    <Select
                      value={csvHeaderReview.decisions[interpretation.rawHeader] || PRODUCT_IMPORT_IGNORE_HEADER}
                      onValueChange={(value) => updateCsvHeaderDecision(
                        interpretation.rawHeader,
                        value as ProductImportHeaderDecision,
                      )}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PRODUCT_IMPORT_IGNORE_HEADER}>Ignore this column</SelectItem>
                        {PRODUCT_IMPORT_FIELD_OPTIONS.map((option) => (
                          <SelectItem key={option.header} value={option.header}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-muted-foreground">
                  Confirmed mappings are validated for duplicates and required fields before import.
                </p>
                <Button type="button" onClick={applyCsvHeaderDecisions}>
                  <CheckCircle2 className="h-4 w-4" />
                  Apply Interpretation
                </Button>
              </div>
            </div>
          )}

          {csvImport && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <div className="admin-panel-soft px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">File</p>
                  <p className="mt-2 truncate text-sm font-medium text-foreground">{csvImport.fileName}</p>
                </div>
                <div className="admin-panel-soft px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Headers mapped</p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {interpretedHeaderCount}
                    {ignoredHeaderCount ? ` / ${ignoredHeaderCount} ignored` : ""}
                  </p>
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

              {csvImport.interpretations.length > 0 && (
                <div className="border border-grid/25 p-4 text-sm text-foreground">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 font-medium">
                      <CircleHelp className="h-4 w-4" />
                      Header interpretation
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {csvImport.rowCount} row(s), {interpretedHeaderCount} mapped column(s), {ignoredHeaderCount} ignored.
                    </p>
                  </div>

                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {csvImport.interpretations.map((interpretation, index) => (
                      <div
                        key={`${interpretation.rawHeader}-${interpretation.header || "ignored"}-${index}`}
                        className="flex min-w-0 flex-col gap-2 border border-grid/20 p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="break-words font-mono text-xs text-foreground">{interpretation.rawHeader}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{getHeaderTargetLabel(interpretation.header)}</span>
                          </div>
                        </div>
                        <Badge className="w-fit border border-grid/25 bg-transparent text-foreground">
                          {PRODUCT_HEADER_MATCH_LABELS[interpretation.matchType]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                      {importPreviewPagination.paginatedItems.map((row) => (
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
                  <AdminTablePagination pagination={importPreviewPagination} itemLabel="valid rows" />
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
                {categoryOptions.map((item) => (
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
                <TableHead>Featured</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productPagination.paginatedItems.map((p) => (
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
                  <TableCell className="text-sm text-muted-foreground">{p.featured_slug || "-"}</TableCell>
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
          <AdminTablePagination pagination={productPagination} itemLabel="products" />
        </div>
      )}

      <EditProductDialog product={editing} open={!!editing} onOpenChange={(o) => !o && setEditing(null)} />
    </div>
  );
};

export default PropertiesSection;
