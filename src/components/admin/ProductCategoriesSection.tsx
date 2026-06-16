import { useState } from "react";
import { ExternalLink, Image, Pencil, Plus, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useProductCategories, PRODUCT_CATEGORIES_QUERY_KEY } from "@/hooks/useProductCategories";
import {
  categoryUrl,
  slugifyCategory,
  type CategoryFeaturedItem,
  type StorefrontCategory,
} from "@/lib/productCategories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminTablePagination from "./AdminTablePagination";
import { useAdminTablePagination } from "./useAdminTablePagination";

type CategoryForm = {
  name: string;
  slug: string;
  image_url: string;
  featured: CategoryFeaturedItem[];
};

const emptyForm: CategoryForm = {
  name: "",
  slug: "",
  image_url: "",
  featured: [],
};

const sanitizeFileName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "") || "category-image";

const createFeaturedDraft = (): CategoryFeaturedItem => ({
  id: `featured-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: "",
  slug: "",
  image_url: "",
});

const formFromCategory = (category: StorefrontCategory): CategoryForm => ({
  name: category.name,
  slug: category.slug,
  image_url: category.image_url,
  featured: category.featured,
});

const ProductCategoriesSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useProductCategories();
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingFeaturedId, setUploadingFeaturedId] = useState<string | null>(null);
  const categoryPagination = useAdminTablePagination(categories);

  const isEditing = Boolean(editingId);
  const generatedUrl = form.slug ? categoryUrl(form.slug) : "/category/category-name";

  const updateForm = <K extends keyof CategoryForm>(key: K, value: CategoryForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleNameChange = (value: string) => {
    setForm((current) => ({
      ...current,
      name: value,
      slug: current.slug ? current.slug : slugifyCategory(value),
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setUploadingFeaturedId(null);
  };

  const startEdit = (category: StorefrontCategory) => {
    setEditingId(category.id);
    setForm(formFromCategory(category));
  };

  const handleImageUpload = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Image required", description: "Upload an image file for this category.", variant: "destructive" });
      return;
    }

    setUploading(true);
    const path = `categories/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { data, error } = await supabase.storage.from("product-categories").upload(path, file, { upsert: false });
    setUploading(false);

    if (error || !data) {
      toast({ title: "Upload failed", description: error?.message || "Could not upload the category image.", variant: "destructive" });
      return;
    }

    const { data: publicData } = supabase.storage.from("product-categories").getPublicUrl(data.path);
    updateForm("image_url", publicData.publicUrl);
    toast({ title: "Category image uploaded" });
  };

  const addFeaturedItem = () => {
    setForm((current) => ({ ...current, featured: [...current.featured, createFeaturedDraft()] }));
  };

  const updateFeaturedItem = (id: string, patch: Partial<CategoryFeaturedItem>) => {
    setForm((current) => ({
      ...current,
      featured: current.featured.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  };

  const handleFeaturedNameChange = (id: string, value: string) => {
    setForm((current) => ({
      ...current,
      featured: current.featured.map((item) => (
        item.id === id
          ? { ...item, name: value, slug: item.slug ? item.slug : slugifyCategory(value) }
          : item
      )),
    }));
  };

  const removeFeaturedItem = (id: string) => {
    setForm((current) => ({ ...current, featured: current.featured.filter((item) => item.id !== id) }));
  };

  const handleFeaturedImageUpload = async (itemId: string, fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Image required", description: "Upload an image file for this featured furniture item.", variant: "destructive" });
      return;
    }

    setUploadingFeaturedId(itemId);
    const path = `categories/featured/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { data, error } = await supabase.storage.from("product-categories").upload(path, file, { upsert: false });
    setUploadingFeaturedId(null);

    if (error || !data) {
      toast({ title: "Upload failed", description: error?.message || "Could not upload the featured image.", variant: "destructive" });
      return;
    }

    const { data: publicData } = supabase.storage.from("product-categories").getPublicUrl(data.path);
    updateFeaturedItem(itemId, { image_url: publicData.publicUrl });
    toast({ title: "Featured image uploaded" });
  };

  const saveCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    const name = form.name.trim();
    const slug = slugifyCategory(form.slug || name);
    const imageUrl = form.image_url.trim();
    const featured = form.featured
      .map((item) => ({
        id: item.id,
        name: item.name.trim(),
        slug: slugifyCategory(item.slug || item.name),
        image_url: item.image_url.trim(),
      }))
      .filter((item) => item.name || item.image_url);

    if (!name) {
      toast({ title: "Category name is required", variant: "destructive" });
      return;
    }

    if (!slug) {
      toast({ title: "Category URL is required", variant: "destructive" });
      return;
    }

    if (!imageUrl) {
      toast({ title: "Category image is required", variant: "destructive" });
      return;
    }

    if (featured.some((item) => !item.name || !item.slug || !item.image_url)) {
      toast({ title: "Complete featured item details", description: "Each featured item needs a name, slug, and image.", variant: "destructive" });
      return;
    }

    const featuredSlugs = featured.map((item) => item.slug);
    const duplicateFeaturedSlug = featuredSlugs.find((featuredSlug, index) => featuredSlugs.indexOf(featuredSlug) !== index);
    if (duplicateFeaturedSlug) {
      toast({ title: "Featured URL already exists", description: "Use unique featured slugs inside this category.", variant: "destructive" });
      return;
    }

    const duplicate = categories.some((category) => category.slug === slug && category.id !== editingId);
    if (duplicate) {
      toast({ title: "Category URL already exists", description: "Use a unique slug for this category.", variant: "destructive" });
      return;
    }

    const previousCategory = editingId ? categories.find((category) => category.id === editingId) : null;
    setSaving(true);
    const payload = {
      name,
      slug,
      image_url: imageUrl,
      features: featured,
      user_id: user.id,
    };
    const response = editingId
      ? await supabase.from("product_categories").update(payload).eq("id", editingId)
      : await supabase.from("product_categories").insert(payload);

    if (response.error) {
      setSaving(false);
      toast({ title: "Could not save category", description: response.error.message, variant: "destructive" });
      return;
    }

    if (previousCategory && previousCategory.name !== name) {
      const { error: productUpdateError } = await supabase
        .from("properties")
        .update({ property_type: name })
        .eq("property_type", previousCategory.name);

      if (productUpdateError) {
        setSaving(false);
        toast({
          title: "Category saved, products not reassigned",
          description: productUpdateError.message,
          variant: "destructive",
        });
        return;
      }
    }

    if (previousCategory) {
      const featuredSlugChanges = featured
        .map((item) => {
          const previousItem = previousCategory.featured.find((previous) => previous.id === item.id);
          if (!previousItem || previousItem.slug === item.slug) return null;
          return { from: previousItem.slug, to: item.slug };
        })
        .filter((item): item is { from: string; to: string } => Boolean(item));

      for (const change of featuredSlugChanges) {
        const { error: featuredUpdateError } = await supabase
          .from("properties")
          .update({ featured_slug: change.to })
          .eq("property_type", name)
          .eq("featured_slug", change.from);

        if (featuredUpdateError) {
          setSaving(false);
          toast({
            title: "Category saved, featured products not reassigned",
            description: featuredUpdateError.message,
            variant: "destructive",
          });
          return;
        }
      }
    }

    setSaving(false);
    toast({ title: editingId ? "Category updated" : "Category added" });
    resetForm();
    queryClient.invalidateQueries({ queryKey: PRODUCT_CATEGORIES_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["category-products"] });
    queryClient.invalidateQueries({ queryKey: ["storefront-products"] });
  };

  const removeCategory = async (category: StorefrontCategory) => {
    if (!confirm(`Delete "${category.name}" permanently?`)) return;

    const { data: linkedProducts, error: lookupError } = await supabase
      .from("properties")
      .select("id")
      .eq("property_type", category.name)
      .limit(1);

    if (lookupError) {
      toast({ title: "Could not check category usage", description: lookupError.message, variant: "destructive" });
      return;
    }

    if ((linkedProducts || []).length) {
      toast({
        title: "Category is in use",
        description: "Reassign or delete products in this category before removing it.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("product_categories").delete().eq("id", category.id);
    if (error) {
      toast({ title: "Could not delete category", description: error.message, variant: "destructive" });
      return;
    }

    if (editingId === category.id) resetForm();
    queryClient.invalidateQueries({ queryKey: PRODUCT_CATEGORIES_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ["category-products"] });
    queryClient.invalidateQueries({ queryKey: ["storefront-products"] });
    toast({ title: "Category deleted" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Catalog structure</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.04em] text-foreground">Product categories</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Add and edit storefront categories, their collection images, optional featured furniture, and URL slugs.
          </p>
        </div>
        <div className="admin-panel-soft px-4 py-3 text-sm text-muted-foreground">
          {categories.length} categor{categories.length === 1 ? "y" : "ies"}
        </div>
      </div>

      <form onSubmit={saveCategory} className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="border-grid/25 bg-card shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="font-serif text-2xl tracking-[-0.03em]">{isEditing ? "Edit category" : "Add category"}</CardTitle>
            <CardDescription>Each category owns one URL, one primary image, and optional featured furniture items.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Category name</Label>
                <Input value={form.name} onChange={(event) => handleNameChange(event.target.value)} placeholder="Workspace Seating" />
              </div>
              <div className="space-y-2">
                <Label>URL slug</Label>
                <div className="flex gap-2">
                  <Input value={form.slug} onChange={(event) => updateForm("slug", slugifyCategory(event.target.value))} placeholder="workspace-seating" />
                  <Button type="button" variant="outline" onClick={() => updateForm("slug", slugifyCategory(form.name))}>
                    Use name
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{generatedUrl}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category image</Label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 border border-grid/45 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground hover:text-background">
                  <Image className="h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={(event) => {
                      handleImageUpload(event.target.files);
                      event.target.value = "";
                    }}
                    className="hidden"
                  />
                </label>
                <Input value={form.image_url} onChange={(event) => updateForm("image_url", event.target.value)} placeholder="/uploads/categories/image.jpg" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Label>Featured</Label>
                  <p className="mt-1 text-xs text-muted-foreground">Optional. Leave empty to send shoppers straight to the full product list.</p>
                </div>
                <Button type="button" variant="outline" onClick={addFeaturedItem}>
                  <Plus className="h-4 w-4" />
                  Add featured
                </Button>
              </div>

              {!form.featured.length ? (
                <div className="border border-dashed border-grid/35 bg-background p-5 text-sm text-muted-foreground">
                  No featured furniture added. This category page will show the product list directly.
                </div>
              ) : (
                <div className="space-y-4">
                  {form.featured.map((item, index) => (
                    <div key={item.id} className="border border-grid/25 bg-background p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="font-medium text-foreground">Featured {index + 1}</p>
                        <Button type="button" variant="ghost" className="text-destructive" onClick={() => removeFeaturedItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                      <div className="grid gap-4 lg:grid-cols-[140px_minmax(0,1fr)]">
                        <div className="aspect-[4/3] overflow-hidden border border-grid/25 bg-muted">
                          {item.image_url ? (
                            <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label>Furniture name</Label>
                            <Input
                              value={item.name}
                              onChange={(event) => handleFeaturedNameChange(item.id, event.target.value)}
                              placeholder="Executive desks"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>URL slug</Label>
                            <div className="flex gap-2">
                              <Input
                                value={item.slug}
                                onChange={(event) => updateFeaturedItem(item.id, { slug: slugifyCategory(event.target.value) })}
                                placeholder="executive-desks"
                              />
                              <Button type="button" variant="outline" onClick={() => updateFeaturedItem(item.id, { slug: slugifyCategory(item.name) })}>
                                Use name
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {form.slug && item.slug ? `${categoryUrl(form.slug)}/${item.slug}` : "/category/category-name/featured-slug"}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label>Featured image</Label>
                            <div className="flex flex-col gap-3 sm:flex-row">
                              <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 border border-grid/45 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground hover:text-background">
                                <Image className="h-4 w-4" />
                                {uploadingFeaturedId === item.id ? "Uploading..." : "Upload image"}
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={uploadingFeaturedId === item.id}
                                  onChange={(event) => {
                                    handleFeaturedImageUpload(item.id, event.target.files);
                                    event.target.value = "";
                                  }}
                                  className="hidden"
                                />
                              </label>
                              <Input
                                value={item.image_url}
                                onChange={(event) => updateFeaturedItem(item.id, { image_url: event.target.value })}
                                placeholder="/uploads/categories/featured.jpg"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" disabled={saving || uploading || Boolean(uploadingFeaturedId)}>
                <Plus className="h-4 w-4" />
                {saving ? "Saving..." : isEditing ? "Save category" : "Add category"}
              </Button>
              {isEditing && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel edit
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-grid/25 bg-card shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="font-serif text-2xl tracking-[-0.03em]">Preview</CardTitle>
            <CardDescription>How the category will appear across collection cards.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden border border-grid/25 bg-background">
              <div className="aspect-[16/9] bg-muted">
                {form.image_url ? (
                  <img src={form.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image selected</div>
                )}
              </div>
              <div className="p-5">
                <p className="font-serif text-2xl text-foreground">{form.name || "Category name"}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {form.featured.map((item) => item.name.trim()).filter(Boolean).join(", ") || "No featured items. Product list opens directly."}
                </p>
                {!!form.featured.length && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {form.featured.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 border border-grid/20 bg-card p-2">
                        <div className="h-12 w-16 shrink-0 overflow-hidden bg-muted">
                          {item.image_url ? <img src={item.image_url} alt="" className="h-full w-full object-cover" /> : null}
                        </div>
                        <p className="min-w-0 truncate text-sm font-medium text-foreground">{item.name || "Featured item"}</p>
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-label">{generatedUrl}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      {isLoading ? (
        <p className="text-muted-foreground">Loading categories...</p>
      ) : !categories.length ? (
        <div className="admin-panel p-8 text-muted-foreground">No categories yet. Add the first product category above.</div>
      ) : (
        <div className="admin-table-panel">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryPagination.paginatedItems.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={category.image_url} alt="" className="h-14 w-20 border border-grid/25 object-cover" />
                      <div>
                        <div className="font-medium text-foreground">{category.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{category.slug}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link to={category.url} className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-interactive">
                      {category.url}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-sm">
                    {category.featured.length ? (
                      <div className="flex flex-wrap gap-2">
                        {category.featured.slice(0, 3).map((item) => (
                          <span key={item.id} className="inline-flex items-center gap-2 border border-grid/20 bg-background px-2 py-1 text-xs text-muted-foreground">
                            {item.image_url && <img src={item.image_url} alt="" className="h-6 w-8 object-cover" />}
                            {item.name}
                          </span>
                        ))}
                        {category.featured.length > 3 && (
                          <span className="inline-flex items-center border border-grid/20 bg-background px-2 py-1 text-xs text-muted-foreground">
                            +{category.featured.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">None. Product list opens directly.</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(category.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" type="button" onClick={() => startEdit(category)}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" type="button" onClick={() => removeCategory(category)}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <AdminTablePagination pagination={categoryPagination} itemLabel="categories" />
        </div>
      )}
    </div>
  );
};

export default ProductCategoriesSection;
