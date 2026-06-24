import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useProductCategories } from "@/hooks/useProductCategories";
import ImageUploader from "./ImageUploader";
import ProductAIDescriptionDialog, { type AIDescriptionTarget } from "./ProductAIDescriptionDialog";
import RichTextEditor from "./RichTextEditor";
import { Palette, Plus, Sparkles, Trash2 } from "lucide-react";
import {
  PRODUCT_COLOR_OPTIONS,
  normalizeColorVariants,
  type ProductColorVariant,
} from "@/lib/productColorVariants";
import { useProductInstitutions } from "@/hooks/useProductInstitutions";
import { normalizeInstitutionSlugs } from "@/lib/productInstitutions";

const createColorVariantDraft = (): ProductColorVariant => ({
  id: `color-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: "Black",
  hex: "#111111",
  images: [],
});

const uniqueImages = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

interface Props {
  product: EditableAdminProduct | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

type EditableAdminProduct = {
  id: string;
  title?: string | null;
  description?: string | null;
  long_description?: string | null;
  property_type?: string | null;
  featured_slug?: string | null;
  price?: number | string | null;
  currency?: string | null;
  location?: string | null;
  city?: string | null;
  status?: string | null;
  images?: string[] | null;
  color_variants?: unknown;
  institution_slugs?: unknown;
};

type ProductForm = {
  title: string;
  description: string;
  long_description: string;
  property_type: string;
  featured_slug: string;
  price: string;
  currency: string;
  location: string;
  city: string;
  status: string;
  institution_slugs: string[];
};

const emptyProductForm: ProductForm = {
  title: "",
  description: "",
  long_description: "",
  property_type: "",
  featured_slug: "",
  price: "",
  currency: "USD",
  location: "",
  city: "Harare",
  status: "approved",
  institution_slugs: [],
};

const EditProductDialog = ({ product, open, onOpenChange }: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyProductForm);
  const [images, setImages] = useState<string[]>([]);
  const [colorVariants, setColorVariants] = useState<ProductColorVariant[]>([]);
  const [aiTarget, setAiTarget] = useState<AIDescriptionTarget | null>(null);
  const { data: productCategories = [] } = useProductCategories();
  const { data: institutions = [] } = useProductInstitutions();
  const categories = useMemo(() => productCategories.map((category) => category.name), [productCategories]);
  const defaultCategory = categories[0] || "";
  const selectedCategory = useMemo(
    () => productCategories.find((category) => category.name === form.property_type) || null,
    [form.property_type, productCategories],
  );

  const update = <K extends keyof ProductForm>(k: K, v: ProductForm[K]) => setForm((p) => ({ ...p, [k]: v }));
  const applyAiDescription = (target: AIDescriptionTarget, value: string) => {
    update(target, value);
  };
  const appendLongDescriptionMedia = (html: string) => {
    update("long_description", html);
  };

  const updateCategory = (value: string) => {
    const nextCategory = productCategories.find((category) => category.name === value);
    setForm((current) => ({
      ...current,
      property_type: value,
      featured_slug: nextCategory?.featured[0]?.slug || "",
    }));
  };

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title || "",
        description: product.description || "",
        long_description: product.long_description || "",
        property_type: product.property_type || defaultCategory,
        featured_slug: product.featured_slug || "",
        price: String(product.price || ""),
        currency: product.currency || "USD",
        location: product.location || "",
        city: product.city || "Harare",
        status: product.status || "approved",
        institution_slugs: normalizeInstitutionSlugs(product.institution_slugs),
      });
      setImages(product.images || []);
      setColorVariants(normalizeColorVariants(product.color_variants));
    }
  }, [defaultCategory, product]);

  useEffect(() => {
    if (open && !form.property_type && defaultCategory) {
      setForm((current) => ({ ...current, property_type: defaultCategory }));
    }
  }, [defaultCategory, form.property_type, open]);

  useEffect(() => {
    if (!open || !selectedCategory) return;
    const validFeatured = selectedCategory.featured.some((item) => item.slug === form.featured_slug);
    if (!validFeatured) {
      setForm((current) => ({ ...current, featured_slug: selectedCategory.featured[0]?.slug || "" }));
    }
  }, [form.featured_slug, open, selectedCategory]);

  const addColorVariant = () => {
    setColorVariants((current) => [...current, createColorVariantDraft()]);
  };

  const removeColorVariant = (id: string) => {
    setColorVariants((current) => current.filter((variant) => variant.id !== id));
  };

  const updateColorVariant = (id: string, patch: Partial<ProductColorVariant>) => {
    setColorVariants((current) => current.map((variant) => variant.id === id ? { ...variant, ...patch } : variant));
  };

  const updateVariantPreset = (id: string, value: string) => {
    const option = PRODUCT_COLOR_OPTIONS.find((item) => item.name === value);
    if (!option) return;
    updateColorVariant(id, option.name === "Custom" ? { name: "", hex: option.hex } : { name: option.name, hex: option.hex });
  };

  const toggleInstitution = (slug: string) => {
    update(
      "institution_slugs",
      form.institution_slugs.includes(slug)
        ? form.institution_slugs.filter((item) => item !== slug)
        : [...form.institution_slugs, slug],
    );
  };

  const save = async () => {
    if (!product) return;

    if (!form.property_type || !categories.includes(form.property_type)) {
      toast({ title: "Choose a product category", description: "Add a category first if none are available.", variant: "destructive" });
      return;
    }

    if (selectedCategory?.featured.length && !form.featured_slug) {
      toast({ title: "Choose a featured subcategory", description: "Products need a featured subcategory for the storefront catalogue.", variant: "destructive" });
      return;
    }

    const cleanColorVariants = colorVariants
      .map((variant) => ({
        ...variant,
        name: variant.name.trim(),
        images: uniqueImages(variant.images),
      }))
      .filter((variant) => variant.name || variant.images.length);

    const variantErrors: string[] = [];
    const variantNames = new Set<string>();
    cleanColorVariants.forEach((variant) => {
      const key = variant.name.toLowerCase();
      if (!variant.name) variantErrors.push("Every color variant needs a color name.");
      if (variantNames.has(key)) variantErrors.push(`${variant.name} is listed more than once.`);
      if (variant.name) variantNames.add(key);
    });

    if (variantErrors.length) {
      toast({ title: "Check color variants", description: variantErrors[0], variant: "destructive" });
      return;
    }

    const productImages = uniqueImages([
      ...images,
      ...cleanColorVariants.flatMap((variant) => variant.images),
    ]);

    setLoading(true);
    const { error } = await supabase.from("properties").update({
      title: form.title,
      description: form.description,
      long_description: form.long_description,
      property_type: form.property_type,
      featured_slug: form.featured_slug || null,
      price: parseFloat(form.price) || 0,
      currency: form.currency,
      location: form.location,
      city: form.city,
      status: form.status,
      images: productImages,
      color_variants: cleanColorVariants,
      institution_slugs: form.institution_slugs,
    }).eq("id", product.id);
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved" });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["category-products"] });
      queryClient.invalidateQueries({ queryKey: ["storefront-products"] });
      onOpenChange(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="admin-workspace max-h-[90vh] max-w-4xl overflow-y-auto border-grid bg-card">
        <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div><Label>Name</Label><Input value={form.title} onChange={(e) => update("title", e.target.value)} /></div>
            <div>
              <Label>Category</Label>
              <Select value={form.property_type} onValueChange={updateCategory}>
                <SelectTrigger><SelectValue placeholder="Choose category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  {!categories.length && <SelectItem value="none" disabled>No categories available</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Featured subcategory</Label>
            <Select
              value={form.featured_slug || "none"}
              onValueChange={(value) => update("featured_slug", value === "none" ? "" : value)}
              disabled={!selectedCategory?.featured.length}
            >
              <SelectTrigger><SelectValue placeholder="Choose featured subcategory" /></SelectTrigger>
              <SelectContent>
                {selectedCategory?.featured.map((item) => (
                  <SelectItem key={item.slug} value={item.slug}>{item.name}</SelectItem>
                ))}
                {!selectedCategory?.featured.length && <SelectItem value="none" disabled>No featured subcategories</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Institutions served</Label>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              These selections determine which institution collection pages include this product.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {institutions.map((institution) => {
                const selected = form.institution_slugs.includes(institution.slug);
                return (
                  <button
                    key={institution.id}
                    type="button"
                    onClick={() => toggleInstitution(institution.slug)}
                    className={`border p-3 text-left transition-colors ${
                      selected ? "border-heritage bg-heritage/10" : "border-grid/30 bg-background hover:border-interactive"
                    }`}
                    aria-pressed={selected}
                  >
                    <span className="font-medium text-foreground">{institution.name}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{institution.description}</span>
                  </button>
                );
              })}
              {!institutions.length && (
                <p className="text-sm text-muted-foreground">No active institutions are configured in the database.</p>
              )}
            </div>
          </div>
          <div>
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Label>Description</Label>
              <Button type="button" size="sm" variant="outline" onClick={() => setAiTarget("description")} className="w-full sm:w-auto">
                <Sparkles className="h-4 w-4" />
                Add using AI
              </Button>
            </div>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} />
          </div>
          <div>
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Label>Long Description</Label>
              <Button type="button" size="sm" variant="outline" onClick={() => setAiTarget("long_description")} className="w-full sm:w-auto">
                <Sparkles className="h-4 w-4" />
                Add using AI
              </Button>
            </div>
            <RichTextEditor
              value={form.long_description || ""}
              onChange={(value) => update("long_description", value)}
              placeholder="Add detailed product copy, specifications, care notes, and project-use context..."
            />
          </div>
          <div>
            <Label>Images (up to 10)</Label>
            <ImageUploader images={images} onChange={setImages} max={10} />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div><Label>Price</Label><Input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} /></div>
            <div>
              <Label>Currency</Label>
              <Select value={form.currency} onValueChange={(v) => update("currency", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["USD", "ZWG"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => update("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div><Label>SKU / Model</Label><Input value={form.location} onChange={(e) => update("location", e.target.value)} /></div>
            <div>
              <Label>Warehouse</Label>
              <Select value={form.city} onValueChange={(v) => update("city", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Harare">Harare</SelectItem>
                  <SelectItem value="Bulawayo">Bulawayo</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="border border-grid/25 bg-background p-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-serif text-2xl tracking-[-0.03em] text-foreground">Color variants</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Edit the color swatches and image groups shown on the product page.
                </p>
              </div>
              <Button type="button" variant="outline" onClick={addColorVariant}>
                <Plus className="h-4 w-4" />
                Add color
              </Button>
            </div>

            {!colorVariants.length ? (
              <div className="flex min-h-28 items-center justify-center border border-dashed border-grid/35 bg-card text-center">
                <div>
                  <Palette className="mx-auto h-7 w-7 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium text-foreground">No color variants added</p>
                  <p className="mt-1 text-xs text-muted-foreground">Add variants when this product has separate color images.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {colorVariants.map((variant, index) => {
                  const selectedOption = PRODUCT_COLOR_OPTIONS.some((option) => option.name === variant.name)
                    ? variant.name
                    : "Custom";

                  return (
                    <div key={variant.id} className="border border-grid/25 bg-card p-4">
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className="h-9 w-9 border border-grid/35"
                            style={{ backgroundColor: variant.hex }}
                            aria-hidden="true"
                          />
                          <div>
                            <p className="font-medium text-foreground">Color {index + 1}</p>
                            <p className="text-xs text-muted-foreground">{variant.images.length} image(s)</p>
                          </div>
                        </div>
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeColorVariant(variant.id)}>
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>

                      <div className="mb-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_110px]">
                        <div className="space-y-2">
                          <Label>Color</Label>
                          <Select value={selectedOption} onValueChange={(value) => updateVariantPreset(variant.id, value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {PRODUCT_COLOR_OPTIONS.map((option) => (
                                <SelectItem key={option.name} value={option.name}>{option.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Color name</Label>
                          <Input
                            value={variant.name}
                            onChange={(event) => updateColorVariant(variant.id, { name: event.target.value })}
                            placeholder="e.g. Walnut"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Swatch</Label>
                          <Input
                            type="color"
                            value={variant.hex}
                            onChange={(event) => updateColorVariant(variant.id, { hex: event.target.value })}
                            className="h-10 p-1"
                          />
                        </div>
                      </div>

                      <ImageUploader
                        images={variant.images}
                        onChange={(nextImages) => updateColorVariant(variant.id, { images: nextImages })}
                        max={8}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <ProductAIDescriptionDialog
            open={aiTarget !== null}
            target={aiTarget || "description"}
            onOpenChange={(nextOpen) => {
              if (!nextOpen) setAiTarget(null);
            }}
            onApply={applyAiDescription}
            onLongDescriptionMediaAdd={appendLongDescriptionMedia}
            context={{
              title: form.title,
              category: form.property_type,
              featuredSubcategory: selectedCategory?.featured.find((item) => item.slug === form.featured_slug)?.name,
              description: form.description,
              longDescription: form.long_description,
              price: form.price,
              currency: form.currency,
              sku: form.location,
              warehouse: form.city,
              institutions: institutions
                .filter((institution) => form.institution_slugs.includes(institution.slug))
                .map((institution) => institution.name),
              images,
              colorVariants,
            }}
          />
          <div className="flex flex-col justify-end gap-2 pt-2 sm:flex-row">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={save} disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
