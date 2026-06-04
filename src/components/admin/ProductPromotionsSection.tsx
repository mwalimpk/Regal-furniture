import { useMemo, useState } from "react";
import {
  BadgePercent,
  Boxes,
  CalendarClock,
  Layers,
  Package,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ProductPromotion,
  ProductPromotionScope,
  isProductPromotionActive,
  normalizeProductPromotion,
  productPromotionScopeLabel,
} from "@/lib/productPromotions";

type AdminProduct = {
  id: string;
  title: string;
  property_type: string;
  price: number;
  currency: string;
  images: string[] | null;
  status: string;
};

type PromotionForm = {
  title: string;
  description: string;
  promotion_type: ProductPromotionScope;
  discount_type: "percentage" | "fixed" | "custom";
  discount_value: string;
  offer_label: string;
  status: string;
  starts_at: string;
  ends_at: string;
  single_product_id: string;
  category_names: string[];
  category_product_ids: Record<string, string[]>;
};

const emptyForm = (): PromotionForm => ({
  title: "",
  description: "",
  promotion_type: "single_product",
  discount_type: "percentage",
  discount_value: "",
  offer_label: "",
  status: "active",
  starts_at: "",
  ends_at: "",
  single_product_id: "",
  category_names: [],
  category_product_ids: {},
});

const scopeOptions: Array<{
  value: ProductPromotionScope;
  title: string;
  description: string;
  Icon: typeof Package;
}> = [
  {
    value: "single_product",
    title: "Single product",
    description: "Promote one exact product.",
    Icon: Package,
  },
  {
    value: "selected_products",
    title: "Selected products",
    description: "Choose categories, then pick products inside each category.",
    Icon: Boxes,
  },
  {
    value: "categories",
    title: "Whole categories",
    description: "Apply one sale to every product in selected categories.",
    Icon: Layers,
  },
];

const toIsoOrNull = (value: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const toLocalInputValue = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const cleanNullable = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const formatDate = (value: string | null) => {
  if (!value) return "Until changed";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Until changed";
  return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
};

const formatMoney = (value: number, currency: string) => {
  try {
    return new Intl.NumberFormat([], { style: "currency", currency: currency || "USD" }).format(value);
  } catch {
    return `${currency || "USD"} ${value.toLocaleString()}`;
  }
};

const productImage = (product: AdminProduct) => product.images?.[0] || "";

const ProductPromotionsSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PromotionForm>(() => emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["admin-product-promotion-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ((data || []) as Array<Record<string, unknown>>).map((row) => ({
        id: String(row.id || ""),
        title: String(row.title || ""),
        property_type: String(row.property_type || "Uncategorised"),
        price: Number(row.price || 0),
        currency: String(row.currency || "USD"),
        images: Array.isArray(row.images) ? row.images.map(String) : null,
        status: String(row.status || "approved"),
      }));
    },
  });

  const { data: promotions = [], isLoading: loadingPromotions } = useQuery({
    queryKey: ["admin-product-promotions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_promotions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ((data || []) as Array<Record<string, unknown>>).map(normalizeProductPromotion);
    },
  });

  const approvedProducts = useMemo(
    () => products.filter((product) => product.status === "approved"),
    [products],
  );

  const productById = useMemo(
    () => new Map(approvedProducts.map((product) => [product.id, product])),
    [approvedProducts],
  );

  const categories = useMemo(
    () => [...new Set(approvedProducts.map((product) => product.property_type).filter(Boolean))].sort(),
    [approvedProducts],
  );

  const productsByCategory = useMemo(() => {
    const grouped = new Map<string, AdminProduct[]>();
    categories.forEach((category) => grouped.set(category, []));
    approvedProducts.forEach((product) => {
      grouped.set(product.property_type, [...(grouped.get(product.property_type) || []), product]);
    });
    return grouped;
  }, [approvedProducts, categories]);

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return approvedProducts;
    return approvedProducts.filter((product) =>
      [product.title, product.property_type].some((value) => value.toLowerCase().includes(query)),
    );
  }, [approvedProducts, productSearch]);

  const activePromotions = useMemo(
    () => promotions.filter((promotion) => isProductPromotionActive(promotion)).length,
    [promotions],
  );

  const selectedProductsCount = useMemo(() => {
    if (form.promotion_type === "single_product") return form.single_product_id ? 1 : 0;
    if (form.promotion_type === "categories") {
      return form.category_names.reduce((count, category) => count + (productsByCategory.get(category)?.length || 0), 0);
    }
    return Object.values(form.category_product_ids).reduce((count, ids) => count + ids.length, 0);
  }, [form.category_names, form.category_product_ids, form.promotion_type, form.single_product_id, productsByCategory]);

  const updateForm = <K extends keyof PromotionForm>(key: K, value: PromotionForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const setPromotionScope = (scope: ProductPromotionScope) => {
    setForm((current) => ({
      ...current,
      promotion_type: scope,
      single_product_id: scope === "single_product" ? current.single_product_id : "",
      category_names: scope === "single_product" ? [] : current.category_names,
      category_product_ids: scope === "selected_products" ? current.category_product_ids : {},
    }));
  };

  const toggleCategory = (category: string) => {
    setForm((current) => {
      const selected = current.category_names.includes(category);
      const category_product_ids = { ...current.category_product_ids };
      if (selected) delete category_product_ids[category];
      return {
        ...current,
        category_names: selected
          ? current.category_names.filter((item) => item !== category)
          : [...current.category_names, category],
        category_product_ids,
      };
    });
  };

  const toggleCategoryProduct = (category: string, productId: string) => {
    setForm((current) => {
      const currentIds = current.category_product_ids[category] || [];
      const selected = currentIds.includes(productId);
      return {
        ...current,
        category_product_ids: {
          ...current.category_product_ids,
          [category]: selected ? currentIds.filter((id) => id !== productId) : [...currentIds, productId],
        },
      };
    });
  };

  const setAllCategoryProducts = (category: string, selected: boolean) => {
    setForm((current) => ({
      ...current,
      category_product_ids: {
        ...current.category_product_ids,
        [category]: selected ? (productsByCategory.get(category) || []).map((product) => product.id) : [],
      },
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm());
    setProductSearch("");
  };

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-product-promotions"] });
  };

  const startEdit = (promotion: ProductPromotion) => {
    const categoryProductIds = promotion.category_targets.reduce<Record<string, string[]>>((acc, target) => {
      acc[target.category] = target.product_ids;
      return acc;
    }, {});

    setEditingId(promotion.id);
    setForm({
      title: promotion.title,
      description: promotion.description || "",
      promotion_type: promotion.promotion_type,
      discount_type: promotion.discount_type,
      discount_value: promotion.discount_value === null ? "" : String(promotion.discount_value),
      offer_label: promotion.offer_label || "",
      status: promotion.status || "active",
      starts_at: toLocalInputValue(promotion.starts_at),
      ends_at: toLocalInputValue(promotion.ends_at),
      single_product_id: promotion.promotion_type === "single_product" ? promotion.product_ids[0] || "" : "",
      category_names: promotion.category_targets.map((target) => target.category),
      category_product_ids: categoryProductIds,
    });
  };

  const buildPayload = () => {
    const startsAt = toIsoOrNull(form.starts_at);
    const endsAt = toIsoOrNull(form.ends_at);
    const discountValue = form.discount_value.trim() ? Number(form.discount_value) : null;

    if (!form.title.trim()) {
      return { error: "Promotion title is required." };
    }

    if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
      return { error: "End time must be after start time." };
    }

    if (form.discount_type !== "custom" && (discountValue === null || !Number.isFinite(discountValue) || discountValue <= 0)) {
      return { error: "Enter a discount value greater than zero." };
    }

    if (form.discount_type === "percentage" && discountValue !== null && discountValue > 100) {
      return { error: "Percentage discounts cannot be greater than 100." };
    }

    let productIds: string[] = [];
    let categoryTargets: Array<{ category: string; product_ids: string[] }> = [];

    if (form.promotion_type === "single_product") {
      if (!form.single_product_id) {
        return { error: "Select the product for this single-product promotion." };
      }
      productIds = [form.single_product_id];
    }

    if (form.promotion_type === "selected_products") {
      categoryTargets = form.category_names
        .map((category) => ({
          category,
          product_ids: form.category_product_ids[category] || [],
        }))
        .filter((target) => target.product_ids.length);
      productIds = [...new Set(categoryTargets.flatMap((target) => target.product_ids))];

      if (!form.category_names.length) {
        return { error: "Select at least one category." };
      }

      if (!productIds.length) {
        return { error: "Select at least one product inside the selected categories." };
      }
    }

    if (form.promotion_type === "categories") {
      if (!form.category_names.length) {
        return { error: "Select at least one category for this category sale." };
      }

      categoryTargets = form.category_names.map((category) => ({
        category,
        product_ids: [],
      }));
    }

    return {
      payload: {
        user_id: user?.id,
        title: form.title.trim(),
        description: cleanNullable(form.description),
        promotion_type: form.promotion_type,
        discount_type: form.discount_type,
        discount_value: form.discount_type === "custom" ? null : discountValue,
        offer_label: cleanNullable(form.offer_label),
        product_ids: productIds,
        category_targets: categoryTargets,
        status: form.status,
        starts_at: startsAt,
        ends_at: endsAt,
      },
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    const result = buildPayload();
    if ("error" in result) {
      toast({ title: result.error, variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = editingId
      ? await supabase.from("product_promotions").update(result.payload).eq("id", editingId)
      : await supabase.from("product_promotions").insert(result.payload);
    setSaving(false);

    if (error) {
      toast({ title: "Could not save product promotion", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: editingId ? "Product promotion updated" : "Product promotion created" });
    resetForm();
    invalidateQueries();
  };

  const toggleStatus = async (promotion: ProductPromotion) => {
    const nextStatus = promotion.status === "active" ? "paused" : "active";
    const { error } = await supabase.from("product_promotions").update({ status: nextStatus }).eq("id", promotion.id);

    if (error) {
      toast({ title: "Could not update promotion", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: nextStatus === "active" ? "Product promotion activated" : "Product promotion paused" });
    invalidateQueries();
  };

  const removePromotion = async (promotion: ProductPromotion) => {
    if (!confirm(`Delete "${promotion.title}" permanently?`)) return;

    const { error } = await supabase.from("product_promotions").delete().eq("id", promotion.id);

    if (error) {
      toast({ title: "Could not delete promotion", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Product promotion deleted" });
    if (editingId === promotion.id) resetForm();
    invalidateQueries();
  };

  const renderCategorySelector = () => (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const selected = form.category_names.includes(category);
          const count = productsByCategory.get(category)?.length || 0;
          return (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              className={cn(
                "border px-3 py-2 text-left text-sm transition-colors",
                selected
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-grid/25 bg-background text-muted-foreground hover:border-primary/45 hover:text-foreground",
              )}
            >
              <span className="font-medium">{category}</span>
              <span className="ml-2 text-xs text-muted-foreground">{count}</span>
            </button>
          );
        })}
      </div>
      {!categories.length && (
        <div className="admin-panel-soft p-4 text-sm text-muted-foreground">
          Add approved products before creating category-based promotions.
        </div>
      )}
    </div>
  );

  const renderSelectedProductPicker = () => (
    <div className="space-y-4">
      {renderCategorySelector()}

      {form.category_names.map((category) => {
        const categoryProducts = productsByCategory.get(category) || [];
        const selectedIds = form.category_product_ids[category] || [];
        return (
          <div key={category} className="border border-grid/25 bg-background p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-foreground">{category}</p>
                <p className="mt-1 text-sm text-muted-foreground">{selectedIds.length} of {categoryProducts.length} selected</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setAllCategoryProducts(category, true)}>
                  Select all
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setAllCategoryProducts(category, false)}>
                  Clear
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {categoryProducts.map((product) => {
                const selected = selectedIds.includes(product.id);
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => toggleCategoryProduct(category, product.id)}
                    className={cn(
                      "flex min-h-20 items-center gap-3 border p-3 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-grid/25 bg-card hover:border-primary/45 hover:bg-primary/5",
                    )}
                  >
                    {productImage(product) ? (
                      <img src={productImage(product)} alt="" className="h-14 w-14 border border-grid/25 object-contain" />
                    ) : (
                      <span className="flex h-14 w-14 items-center justify-center border border-grid/25 bg-muted">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-foreground">{product.title}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{formatMoney(product.price, product.currency)}</span>
                    </span>
                    <span className={cn("h-4 w-4 border", selected ? "border-primary bg-primary" : "border-grid/45 bg-background")} />
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderTargetPicker = () => {
    if (form.promotion_type === "single_product") {
      return (
        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
              placeholder="Search products..."
              className="pl-9"
            />
          </div>
          <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {filteredProducts.map((product) => {
              const selected = form.single_product_id === product.id;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => updateForm("single_product_id", product.id)}
                  className={cn(
                    "flex w-full min-h-20 items-center gap-3 border p-3 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-grid/25 bg-background hover:border-primary/45 hover:bg-primary/5",
                  )}
                >
                  {productImage(product) ? (
                    <img src={productImage(product)} alt="" className="h-14 w-14 border border-grid/25 object-contain" />
                  ) : (
                    <span className="flex h-14 w-14 items-center justify-center border border-grid/25 bg-muted">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">{product.title}</span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                      {product.property_type} | {formatMoney(product.price, product.currency)}
                    </span>
                  </span>
                  {selected && <Badge className="bg-primary text-primary-foreground">Selected</Badge>}
                </button>
              );
            })}
            {!loadingProducts && !filteredProducts.length && (
              <div className="admin-panel-soft p-4 text-sm text-muted-foreground">No approved products match the current search.</div>
            )}
          </div>
        </div>
      );
    }

    if (form.promotion_type === "selected_products") {
      return renderSelectedProductPicker();
    }

    return (
      <div className="space-y-4">
        {renderCategorySelector()}
        {!!form.category_names.length && (
          <div className="flex flex-wrap gap-2">
            {form.category_names.map((category) => (
              <Badge key={category} variant="outline" className="gap-2 border-primary/30 bg-primary/10 px-3 py-1 text-sm">
                {category}
                <button type="button" onClick={() => toggleCategory(category)} aria-label={`Remove ${category}`}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  };

  const scopeSummary = (promotion: ProductPromotion) => {
    if (promotion.promotion_type === "single_product") {
      return productById.get(promotion.product_ids[0])?.title || `${promotion.product_ids.length} product`;
    }

    if (promotion.promotion_type === "categories") {
      return promotion.category_targets.map((target) => target.category).join(", ");
    }

    return promotion.category_targets
      .map((target) => `${target.category}: ${target.product_ids.length}`)
      .join(" | ");
  };

  const discountSummary = (promotion: ProductPromotion) => {
    if (promotion.offer_label) return promotion.offer_label;
    if (promotion.discount_type === "custom") return "Custom offer";
    if (promotion.discount_type === "percentage") return `${promotion.discount_value || 0}% off`;
    return `${promotion.discount_value || 0} off`;
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Product Sale Targeting</p>
          <h2 className="mt-2 font-serif text-3xl font-semibold tracking-[-0.04em] text-foreground">Product promotions</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Configure sales for one product, hand-picked products inside categories, or every product in selected categories.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="admin-panel-soft px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Promotions</p>
            <p className="mt-2 font-medium text-foreground">{promotions.length}</p>
          </div>
          <div className="admin-panel-soft px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Live now</p>
            <p className="mt-2 font-medium text-foreground">{activePromotions}</p>
          </div>
          <div className="admin-panel-soft px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Targeted products</p>
            <p className="mt-2 font-medium text-foreground">{selectedProductsCount}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <Card className="border-grid/25 bg-card shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="font-serif text-2xl tracking-[-0.03em]">
              {editingId ? "Edit product promotion" : "Create product promotion"}
            </CardTitle>
            <CardDescription>Choose the sale message, active window, and targeting mode.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Promotion name</Label>
                <Input
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  placeholder="Executive seating sale"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(value) => updateForm("status", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(event) => updateForm("description", event.target.value)}
                placeholder="Internal context for this offer..."
                rows={3}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-[1fr_1fr_1.2fr]">
              <div className="space-y-2">
                <Label>Discount type</Label>
                <Select value={form.discount_type} onValueChange={(value) => updateForm("discount_type", value as PromotionForm["discount_type"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed amount</SelectItem>
                    <SelectItem value="custom">Custom label</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discount_value}
                  onChange={(event) => updateForm("discount_value", event.target.value)}
                  placeholder={form.discount_type === "percentage" ? "15" : "100"}
                  disabled={form.discount_type === "custom"}
                />
              </div>
              <div className="space-y-2">
                <Label>Offer label</Label>
                <Input
                  value={form.offer_label}
                  onChange={(event) => updateForm("offer_label", event.target.value)}
                  placeholder="15% off selected chairs"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Starts</Label>
                <Input
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(event) => updateForm("starts_at", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Ends</Label>
                <Input
                  type="datetime-local"
                  value={form.ends_at}
                  onChange={(event) => updateForm("ends_at", event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {scopeOptions.map(({ value, title, description, Icon }) => {
                const selected = form.promotion_type === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPromotionScope(value)}
                    className={cn(
                      "min-h-36 border p-4 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-grid/25 bg-background hover:border-primary/45 hover:bg-primary/5",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="mt-4 block font-medium">{title}</span>
                    <span className="mt-2 block text-sm leading-6 text-muted-foreground">{description}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                {saving ? "Saving..." : editingId ? "Save product promotion" : "Create product promotion"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel edit
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-grid/25 bg-card shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 font-serif text-2xl tracking-[-0.03em]">
              <Tag className="h-5 w-5" />
              Promotion targets
            </CardTitle>
            <CardDescription>{productPromotionScopeLabel(form.promotion_type)} targeting</CardDescription>
          </CardHeader>
          <CardContent>{renderTargetPicker()}</CardContent>
        </Card>
      </form>

      <Card className="border-grid/25 bg-card shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="font-serif text-2xl tracking-[-0.03em]">Saved product promotions</CardTitle>
          <CardDescription>Review sale scope, product/category targeting, and active windows.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPromotions ? (
            <p className="text-sm text-muted-foreground">Loading product promotions...</p>
          ) : !promotions.length ? (
            <div className="admin-panel p-8 text-muted-foreground">No product promotions have been created yet.</div>
          ) : (
            <div className="admin-table-panel">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Promotion</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Targets</TableHead>
                    <TableHead>Offer</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.map((promotion) => (
                    <TableRow key={promotion.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{promotion.title}</div>
                        {promotion.description && (
                          <div className="mt-1 line-clamp-2 max-w-xs text-sm text-muted-foreground">{promotion.description}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-grid/35 bg-background">
                          {productPromotionScopeLabel(promotion.promotion_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs text-sm text-muted-foreground">{scopeSummary(promotion)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                          <BadgePercent className="h-4 w-4 text-primary" />
                          {discountSummary(promotion)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {promotion.starts_at ? `Starts ${formatDate(promotion.starts_at)}` : "Starts immediately"}
                        </div>
                        <div className="mt-1">Ends {formatDate(promotion.ends_at)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={isProductPromotionActive(promotion) ? "border border-primary/20 bg-primary/10 text-foreground" : "border border-grid/25 bg-background text-muted-foreground"}>
                          {isProductPromotionActive(promotion) ? "Live" : promotion.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEdit(promotion)}>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => toggleStatus(promotion)}>
                            {promotion.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            {promotion.status === "active" ? "Pause" : "Activate"}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => removePromotion(promotion)}>
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default ProductPromotionsSection;
