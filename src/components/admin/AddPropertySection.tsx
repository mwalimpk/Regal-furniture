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

const categories = [
  "Executive Desks", "Managerial Desks", "L-Shaped Desks", "Adjustable Desks",
  "Workstations", "Executive Chairs", "Ergonomic Chairs", "Operator Chairs",
  "Visitor Chairs", "Conference Tables", "Conference Chairs", "Benches",
  "Stacking Seats", "Sofas & Lounge", "Storage & Filing", "Display Shelves",
  "Bar Stools", "Training Furniture", "Accessories", "Home Furniture",
];

const AddProductSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", property_type: "Executive Desks", price: "",
    currency: "USD", location: "", city: "Harare", country: "Zimbabwe",
    bedrooms: "0", bathrooms: "0", area_sqft: "0",
  });

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
      country: form.country,
      bedrooms: 0,
      bathrooms: 0,
      area_sqft: 0,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Product Added", description: "Product added successfully and is now live." });
      setForm({ title: "", description: "", property_type: "Executive Desks", price: "", currency: "USD", location: "", city: "Harare", country: "Zimbabwe", bedrooms: "0", bathrooms: "0", area_sqft: "0" });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    }
    setLoading(false);
  };

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Add Product</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Product Name</Label><Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. B002 Executive Desk" required /></div>
          <div>
            <Label>Category</Label>
            <Select value={form.property_type} onValueChange={(v) => update("property_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Product description, materials, dimensions..." rows={3} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Price</Label><Input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="0.00" required /></div>
          <div>
            <Label>Currency</Label>
            <Select value={form.currency} onValueChange={(v) => update("currency", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["USD", "ZWL", "ZAR", "GBP", "EUR"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>SKU / Model</Label><Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="e.g. B002" /></div>
          <div><Label>Warehouse</Label><Input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Harare or Bulawayo" /></div>
        </div>
        <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Product"}</Button>
      </form>
    </div>
  );
};

export default AddProductSection;
