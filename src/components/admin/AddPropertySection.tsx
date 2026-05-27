import { useState } from "react";
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
import ImageUploader from "./ImageUploader";

const categories = [
  "Executive Desking", "Managerial Desking", "L-Shaped Desks", "Adjustable Desking",
  "Workstations", "Executive Chairs", "Ergonomic Chairs", "Visitor Chairs",
  "Conference Tables", "Conference Chairs", "Sofas & Lounge", "Storage & Filing",
  "Accessories",
];

const initialForm = {
  title: "", description: "", property_type: "Executive Desking", price: "",
  currency: "USD", location: "", city: "Harare", features: "",
};

const AddProductSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState(initialForm);

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleGenerate = async () => {
    if (!form.title) {
      toast({ title: "Add a product name first", variant: "destructive" });
      return;
    }
    setAiLoading(true);
    const { data, error } = await supabase.functions.invoke("generate-product-description", {
      body: { name: form.title, category: form.property_type, features: form.features },
    });
    setAiLoading(false);
    if (error || data?.error) {
      toast({ title: "AI error", description: data?.error || error?.message, variant: "destructive" });
      return;
    }
    update("description", data.description);
    toast({ title: "Description generated" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from("properties").insert({
      user_id: user.id,
      title: form.title,
      description: form.description,
      property_type: form.property_type,
      price: parseFloat(form.price) || 0,
      currency: form.currency,
      location: form.location,
      city: form.city,
      country: "Zimbabwe",
      images,
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
            <p className="mt-2 font-medium text-foreground">{form.property_type}</p>
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
                  <Select value={form.property_type} onValueChange={(v) => update("property_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Key Features (for AI)</Label>
                <Input value={form.features} onChange={(e) => update("features", e.target.value)} placeholder="e.g. mahogany finish, 1.6m wide, lockable drawers" />
              </div>

              <div className="space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Label>Description</Label>
                  <Button type="button" size="sm" variant="outline" onClick={handleGenerate} disabled={aiLoading} className="w-full sm:w-auto">
                    {aiLoading ? "Generating..." : "Generate with AI"}
                  </Button>
                </div>
                <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Product description..." rows={7} />
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
    </div>
  );
};

export default AddProductSection;
