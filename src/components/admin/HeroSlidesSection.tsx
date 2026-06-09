import { useMemo, useState } from "react";
import { Image as ImageIcon, Pause, Pencil, Play, Plus, Trash2, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  CTA_DESTINATION_OPTIONS,
  CUSTOM_CTA_DESTINATION,
  getCtaDestinationLabel,
  getCtaDestinationSelectValue,
  sanitizeCtaHref,
} from "@/lib/ctaDestinations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type HeroSlideAdminRow = {
  id: string;
  eyebrow: string | null;
  accent_title: string | null;
  title: string;
  description: string | null;
  image_url: string | null;
  image_alt: string | null;
  cta_label: string | null;
  cta_href: string | null;
  display_order: number;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
};

type HeroSlideForm = {
  eyebrow: string;
  accent_title: string;
  title: string;
  description: string;
  image_url: string;
  image_alt: string;
  cta_label: string;
  cta_href: string;
  display_order: string;
  status: string;
};

const emptyForm = (nextOrder = 1): HeroSlideForm => ({
  eyebrow: "",
  accent_title: "",
  title: "",
  description: "",
  image_url: "",
  image_alt: "",
  cta_label: "Explore Collection",
  cta_href: "/categories",
  display_order: String(nextOrder),
  status: "active",
});

const cleanNullable = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const normalizeAdminHeroSlide = (row: Record<string, unknown>): HeroSlideAdminRow => ({
  id: String(row.id || ""),
  eyebrow: row.eyebrow ? String(row.eyebrow) : null,
  accent_title: row.accent_title ? String(row.accent_title) : null,
  title: String(row.title || ""),
  description: row.description ? String(row.description) : null,
  image_url: row.image_url ? String(row.image_url) : null,
  image_alt: row.image_alt ? String(row.image_alt) : null,
  cta_label: row.cta_label ? String(row.cta_label) : null,
  cta_href: row.cta_href ? String(row.cta_href) : null,
  display_order: Number(row.display_order || 1),
  status: String(row.status || "paused"),
  created_at: String(row.created_at || ""),
  updated_at: String(row.updated_at || row.created_at || ""),
  user_id: String(row.user_id || ""),
});

const uploadHeroImage = async (file: File) => {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `hero-slides/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { data, error } = await supabase.storage.from("hero-slides").upload(path, file, { upsert: false });
  if (error || !data) throw new Error(error?.message || "Could not upload hero image.");
  const { data: publicData } = supabase.storage.from("hero-slides").getPublicUrl(data.path);
  return publicData.publicUrl;
};

const HeroSlidesSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<HeroSlideForm>(() => emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: slides = [], isLoading } = useQuery({
    queryKey: ["admin-hero-slides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return ((data || []) as Array<Record<string, unknown>>).map(normalizeAdminHeroSlide);
    },
  });

  const nextOrder = useMemo(
    () => slides.reduce((highest, slide) => Math.max(highest, slide.display_order), 0) + 1,
    [slides],
  );
  const liveSlides = useMemo(() => slides.filter((slide) => slide.status === "active").length, [slides]);
  const ctaSelectValue = getCtaDestinationSelectValue(form.cta_href, CUSTOM_CTA_DESTINATION);

  const updateForm = <K extends keyof HeroSlideForm>(key: K, value: HeroSlideForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm(nextOrder));
  };

  const startEdit = (slide: HeroSlideAdminRow) => {
    setEditingId(slide.id);
    setForm({
      eyebrow: slide.eyebrow || "",
      accent_title: slide.accent_title || "",
      title: slide.title,
      description: slide.description || "",
      image_url: slide.image_url || "",
      image_alt: slide.image_alt || "",
      cta_label: slide.cta_label || "Explore Collection",
      cta_href: slide.cta_href || "",
      display_order: String(slide.display_order || 1),
      status: slide.status || "active",
    });
  };

  const handleImageFile = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid image", description: "Upload an image file for the hero slide.", variant: "destructive" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Use a hero image under 10MB.", variant: "destructive" });
      return;
    }

    setUploadingImage(true);
    try {
      const publicUrl = await uploadHeroImage(file);
      updateForm("image_url", publicUrl);
      toast({ title: "Hero image uploaded" });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not upload the hero image.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const invalidateHeroQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-hero-slides"] });
    queryClient.invalidateQueries({ queryKey: ["active-hero-slides"] });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    if (!form.title.trim()) {
      toast({ title: "Hero title is required", variant: "destructive" });
      return;
    }

    if (!form.description.trim()) {
      toast({ title: "Hero description is required", variant: "destructive" });
      return;
    }

    if (!form.image_url.trim()) {
      toast({ title: "Hero image is required", variant: "destructive" });
      return;
    }

    const ctaHref = sanitizeCtaHref(form.cta_href, "/categories") || "/categories";
    const payload = {
      user_id: user.id,
      eyebrow: cleanNullable(form.eyebrow),
      accent_title: cleanNullable(form.accent_title),
      title: form.title.trim(),
      description: form.description.trim(),
      image_url: form.image_url.trim(),
      image_alt: cleanNullable(form.image_alt) || form.title.trim(),
      cta_label: cleanNullable(form.cta_label) || "Explore Collection",
      cta_href: ctaHref,
      display_order: Number(form.display_order) || nextOrder,
      status: form.status,
    };

    setSaving(true);
    const { error } = editingId
      ? await supabase.from("hero_slides").update(payload).eq("id", editingId)
      : await supabase.from("hero_slides").insert(payload);
    setSaving(false);

    if (error) {
      toast({ title: "Could not save hero slide", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: editingId ? "Hero slide updated" : "Hero slide created" });
    setEditingId(null);
    setForm(emptyForm(nextOrder + (editingId ? 0 : 1)));
    invalidateHeroQueries();
  };

  const toggleStatus = async (slide: HeroSlideAdminRow) => {
    const nextStatus = slide.status === "active" ? "paused" : "active";
    const { error } = await supabase.from("hero_slides").update({ status: nextStatus }).eq("id", slide.id);

    if (error) {
      toast({ title: "Could not update slide", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: nextStatus === "active" ? "Hero slide activated" : "Hero slide paused" });
    invalidateHeroQueries();
  };

  const removeSlide = async (slide: HeroSlideAdminRow) => {
    if (!confirm(`Delete "${slide.title}" permanently?`)) return;

    const { error } = await supabase.from("hero_slides").delete().eq("id", slide.id);
    if (error) {
      toast({ title: "Could not delete slide", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Hero slide deleted" });
    if (editingId === slide.id) resetForm();
    invalidateHeroQueries();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Homepage Display</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.04em] text-foreground">Hero slides</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Control the main homepage carousel with storefront-ready imagery, titles, descriptions, and category destinations.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="admin-panel-soft px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Total</p>
            <p className="mt-2 font-medium text-foreground">{slides.length}</p>
          </div>
          <div className="admin-panel-soft px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Live</p>
            <p className="mt-2 font-medium text-foreground">{liveSlides}</p>
          </div>
          <div className="admin-panel-soft px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Next order</p>
            <p className="mt-2 font-medium text-foreground">{nextOrder}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card className="border-grid/25 bg-card shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="font-serif text-2xl tracking-[-0.03em]">
              {editingId ? "Edit hero slide" : "Create hero slide"}
            </CardTitle>
            <CardDescription>Set the words, CTA, order, and publishing status for a homepage hero frame.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Eyebrow</Label>
                <Input
                  value={form.eyebrow}
                  onChange={(event) => updateForm("eyebrow", event.target.value)}
                  placeholder="Premium Office Furniture"
                />
              </div>
              <div className="space-y-2">
                <Label>Accent title</Label>
                <Input
                  value={form.accent_title}
                  onChange={(event) => updateForm("accent_title", event.target.value)}
                  placeholder="Crafted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Main title</Label>
              <Input
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
                placeholder="for Those Who Lead"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(event) => updateForm("description", event.target.value)}
                placeholder="A concise homepage hero description."
                rows={5}
                required
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>CTA label</Label>
                <Input
                  value={form.cta_label}
                  onChange={(event) => updateForm("cta_label", event.target.value)}
                  placeholder="Explore Collection"
                />
              </div>
              <div className="space-y-2">
                <Label>CTA destination</Label>
                <Select
                  value={ctaSelectValue}
                  onValueChange={(value) => updateForm("cta_href", value === CUSTOM_CTA_DESTINATION ? "" : value)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CTA_DESTINATION_OPTIONS.map((option) => (
                      <SelectItem key={option.href} value={option.href}>{option.label}</SelectItem>
                    ))}
                    <SelectItem value={CUSTOM_CTA_DESTINATION}>Custom link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {ctaSelectValue === CUSTOM_CTA_DESTINATION && (
              <div className="space-y-2">
                <Label>Custom CTA link</Label>
                <Input
                  value={form.cta_href}
                  onChange={(event) => updateForm("cta_href", event.target.value)}
                  placeholder="https://example.com or /custom-page"
                />
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Display order</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.display_order}
                  onChange={(event) => updateForm("display_order", event.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
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

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                {saving ? "Saving..." : editingId ? "Save changes" : "Create slide"}
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
            <CardTitle className="font-serif text-2xl tracking-[-0.03em]">Hero image</CardTitle>
            <CardDescription>Use a wide, high-resolution image that still reads clearly behind text.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.image_url ? (
              <div className="relative aspect-[16/10] overflow-hidden border border-grid/25">
                <img src={form.image_url} alt={form.image_alt || form.title || "Hero slide"} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(var(--obsidian-rgb)/0.64),transparent)]" />
                <button
                  type="button"
                  onClick={() => updateForm("image_url", "")}
                  className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center border border-[rgb(var(--white-rgb)/0.3)] bg-[rgb(var(--obsidian-rgb)/0.52)] text-primary-foreground transition-colors hover:bg-[rgb(var(--obsidian-rgb)/0.72)]"
                  aria-label="Remove hero image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center border border-dashed border-grid/35 bg-background text-center">
                <div>
                  <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium text-foreground">No hero image selected</p>
                  <p className="mt-1 text-xs text-muted-foreground">Upload or paste an image URL.</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 border border-grid/45 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground hover:text-background">
                <ImageIcon className="h-4 w-4" />
                {uploadingImage ? "Uploading..." : "Upload hero image"}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingImage}
                  onChange={(event) => {
                    handleImageFile(event.target.files);
                    event.target.value = "";
                  }}
                  className="hidden"
                />
              </label>
              <Input
                value={form.image_url}
                onChange={(event) => updateForm("image_url", event.target.value)}
                placeholder="Or paste an image URL"
              />
              <Input
                value={form.image_alt}
                onChange={(event) => updateForm("image_alt", event.target.value)}
                placeholder="Image alt text"
              />
            </div>
          </CardContent>
        </Card>
      </form>

      <Card className="border-grid/25 bg-card shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="font-serif text-2xl tracking-[-0.03em]">Saved hero slides</CardTitle>
          <CardDescription>Slides appear on the homepage by display order when active.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading hero slides...</p>
          ) : !slides.length ? (
            <div className="admin-panel p-8 text-muted-foreground">No custom hero slides yet. The homepage hero stays hidden until an active slide is added.</div>
          ) : (
            <div className="admin-table-panel">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slide</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>CTA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slides.map((slide) => (
                    <TableRow key={slide.id}>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          {slide.image_url && (
                            <img src={slide.image_url} alt="" className="h-14 w-24 border border-grid/25 object-cover" />
                          )}
                          <div>
                            <div className="font-medium text-foreground">{slide.title}</div>
                            <div className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                              {slide.accent_title || "No accent"} {slide.eyebrow ? `- ${slide.eyebrow}` : ""}
                            </div>
                            {slide.description && (
                              <div className="mt-1 line-clamp-2 max-w-md text-sm text-muted-foreground">{slide.description}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{slide.display_order}</TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground">{slide.cta_label || "Explore Collection"}</div>
                        <div className="text-xs text-muted-foreground">{getCtaDestinationLabel(slide.cta_href)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={slide.status === "active" ? "border border-primary/20 bg-primary/10 text-foreground" : "border border-grid/25 bg-background text-muted-foreground"}>
                          {slide.status === "active" ? "Live" : slide.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEdit(slide)}>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => toggleStatus(slide)}>
                            {slide.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            {slide.status === "active" ? "Pause" : "Activate"}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => removeSlide(slide)}>
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
    </div>
  );
};

export default HeroSlidesSection;
