import { useEffect, useMemo, useState } from "react";
import { Palette, Plus, Sparkles, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { PRODUCT_COLOR_OPTIONS, type ProductColorVariant } from "@/lib/productColorVariants";

const initialForm = {
  title: "", description: "", long_description: "", property_type: "", featured_slug: "", price: "",
  currency: "USD", location: "", city: "Harare",
};

const createColorVariantDraft = (): ProductColorVariant => ({
  id: `color-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: "Black",
  hex: "#111111",
  images: [],
});

const uniqueImages = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const AddProductSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [aiTarget, setAiTarget] = useState<AIDescriptionTarget | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [colorVariants, setColorVariants] = useState<ProductColorVariant[]>([]);
  const [form, setForm] = useState(initialForm);
  const { data: productCategories = [] } = useProductCategories();
  const categories = useMemo(() => productCategories.map((category) => category.name), [productCategories]);
  const selectedCategory = useMemo(
    () => productCategories.find((category) => category.name === form.property_type) || null,
    [form.property_type, productCategories],
  );

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));
  const updateCategory = (value: string) => {
    const nextCategory = productCategories.find((category) => category.name === value);
    setForm((current) => ({
      ...current,
      property_type: value,
      featured_slug: nextCategory?.featured[0]?.slug || "",
    }));
  };

  useEffect(() => {
    if (!form.property_type && categories.length) {
      const firstCategory = productCategories.find((category) => category.name === categories[0]);
      setForm((current) => ({
        ...current,
        property_type: categories[0],
        featured_slug: firstCategory?.featured[0]?.slug || "",
      }));
    }
  }, [categories, form.property_type, productCategories]);

  useEffect(() => {
    if (!selectedCategory) return;
    const validFeatured = selectedCategory.featured.some((item) => item.slug === form.featured_slug);
    if (!validFeatured) {
      setForm((current) => ({ ...current, featured_slug: selectedCategory.featured[0]?.slug || "" }));
    }
  }, [form.featured_slug, selectedCategory]);

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

  const applyAiDescription = (target: AIDescriptionTarget, value: string) => {
    update(target, value);
  };
  const appendLongDescriptionMedia = (html: string) => {
    update("long_description", html);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

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
      if (!variant.images.length) variantErrors.push(`${variant.name || "A color variant"} needs at least one image.`);
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

    const { error } = await supabase.from("properties").insert({
      user_id: user.id,
      title: form.title,
      description: form.description,
      long_description: form.long_description,
      property_type: form.property_type,
      featured_slug: form.featured_slug || null,
      price: parseFloat(form.price) || 0,
      currency: form.currency,
      location: form.location,
      city: form.city,
      country: "Zimbabwe",
      images: productImages,
      color_variants: cleanColorVariants,
      status: "approved",
      bedrooms: 0, bathrooms: 0, area_sqft: 0,
    });

    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Product added", description: "Live in your store now." });
      setForm(initialForm);
      setImages([]);
      setColorVariants([]);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["category-products"] });
      queryClient.invalidateQueries({ queryKey: ["storefront-products"] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Catalog Management</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.04em] text-foreground">Add a new product</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Build each listing with clear specs, polished media, and enough context for the storefront, quote flow, and search tools.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="admin-panel-soft px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Status</p>
            <p className="mt-2 font-medium text-foreground">Drafting</p>
          </div>
          <div className="admin-panel-soft px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Images</p>
            <p className="mt-2 font-medium text-foreground">{images.length} / 10 added</p>
          </div>
          <div className="admin-panel-soft px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Category</p>
            <p className="mt-2 font-medium text-foreground">{form.property_type || "Not selected"}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
          <Card className="border-grid/25 bg-card shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="font-serif text-2xl tracking-[-0.03em]">Product details</CardTitle>
              <CardDescription>Set the storefront-facing identity of the item before pricing and logistics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. B002 Executive Desk" required />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.property_type} onValueChange={updateCategory}>
                    <SelectTrigger><SelectValue placeholder="Choose category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      {!categories.length && <SelectItem value="none" disabled>No categories available</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
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

              <div className="space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Label>Description</Label>
                  <Button type="button" size="sm" variant="outline" onClick={() => setAiTarget("description")} className="w-full sm:w-auto">
                    <Sparkles className="h-4 w-4" />
                    Add using AI
                  </Button>
                </div>
                <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Product description..." rows={7} />
              </div>

              <div className="space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Label>Long Description</Label>
                  <Button type="button" size="sm" variant="outline" onClick={() => setAiTarget("long_description")} className="w-full sm:w-auto">
                    <Sparkles className="h-4 w-4" />
                    Add using AI
                  </Button>
                </div>
                <RichTextEditor
                  value={form.long_description}
                  onChange={(value) => update("long_description", value)}
                  placeholder="Add detailed product copy, specifications, care notes, and project-use context..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-grid/25 bg-card shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-2xl tracking-[-0.03em]">Pricing and stock</CardTitle>
                <CardDescription>Define price presentation, SKU reference, and warehouse allocation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="0.00" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={form.currency} onValueChange={(v) => update("currency", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["USD", "ZWL"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>SKU / Model</Label>
                  <Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="B002" />
                </div>

                <div className="space-y-2">
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
              </CardContent>
            </Card>

            <Card className="border-grid/25 bg-muted shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-2xl tracking-[-0.03em]">Publishing notes</CardTitle>
                <CardDescription>Use at least three polished product images and keep names aligned with your catalog structure.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
                <p>Use one hero image and supporting views that show scale, finish, and detail.</p>
                <p>Keep category naming consistent so filters and collection dropdowns stay reliable.</p>
                <p>Descriptions generated with AI can be edited before publishing.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-grid/25 bg-card shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="font-serif text-2xl tracking-[-0.03em]">Product media</CardTitle>
            <CardDescription>Upload up to ten images. Lead with your strongest showroom-ready photo.</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploader images={images} onChange={setImages} max={10} />
          </CardContent>
        </Card>

        <Card className="border-grid/25 bg-card shadow-none">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="font-serif text-2xl tracking-[-0.03em]">Color variants</CardTitle>
                <CardDescription>Group images by color so the product page can switch the gallery when shoppers choose a color.</CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={addColorVariant}>
                <Plus className="h-4 w-4" />
                Add color
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!colorVariants.length ? (
              <div className="flex min-h-28 items-center justify-center border border-dashed border-grid/35 bg-background text-center">
                <div>
                  <Palette className="mx-auto h-7 w-7 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium text-foreground">No color variants added</p>
                  <p className="mt-1 text-xs text-muted-foreground">Use this when one product has separate images for colors or finishes.</p>
                </div>
              </div>
            ) : (
              colorVariants.map((variant, index) => {
                const selectedOption = PRODUCT_COLOR_OPTIONS.some((option) => option.name === variant.name)
                  ? variant.name
                  : "Custom";

                return (
                  <div key={variant.id} className="border border-grid/25 bg-background p-4">
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
              })
            )}
          </CardContent>
        </Card>

        <div className="admin-panel-soft flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-foreground">Ready to add this product to the store?</p>
            <p className="text-sm text-muted-foreground">Saving here updates the local storefront catalog immediately.</p>
          </div>
          <Button type="submit" disabled={loading} className="min-w-40">
            {loading ? "Adding..." : "Add Product"}
          </Button>
        </div>
      </form>
      <ProductAIDescriptionDialog
        open={aiTarget !== null}
        target={aiTarget || "description"}
        onOpenChange={(open) => {
          if (!open) setAiTarget(null);
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
          images,
          colorVariants,
        }}
      />
    </div>
  );
};

export default AddProductSection;
