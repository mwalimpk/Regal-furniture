import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Add Product</h1>
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Product Name</Label><Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. B002 Executive Desk" required /></div>
          <div>
            <Label>Category</Label>
            <Select value={form.property_type} onValueChange={(v) => update("property_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Key Features (for AI)</Label>
          <Input value={form.features} onChange={(e) => update("features", e.target.value)} placeholder="e.g. mahogany finish, 1.6m wide, lockable drawers" />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label>Description</Label>
            <Button type="button" size="sm" variant="outline" onClick={handleGenerate} disabled={aiLoading}>
              {aiLoading ? "Generating..." : "Generate with AI"}
            </Button>
          </div>
          <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Product description..." rows={4} />
        </div>

        <div>
          <Label>Product Images (up to 10)</Label>
          <ImageUploader images={images} onChange={setImages} max={10} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div><Label>Price</Label><Input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="0.00" required /></div>
          <div>
            <Label>Currency</Label>
            <Select value={form.currency} onValueChange={(v) => update("currency", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["USD", "ZWL"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>SKU / Model</Label><Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="B002" /></div>
        </div>

        <div>
          <Label>Warehouse</Label>
          <Select value={form.city} onValueChange={(v) => update("city", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Harare">Harare</SelectItem>
              <SelectItem value="Bulawayo">Bulawayo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Product"}</Button>
      </form>
    </div>
  );
};

export default AddProductSection;
