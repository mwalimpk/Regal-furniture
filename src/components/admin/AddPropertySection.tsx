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

const AddPropertySection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", property_type: "House", price: "",
    currency: "KES", location: "", city: "", country: "Kenya",
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
      bedrooms: parseInt(form.bedrooms) || 0,
      bathrooms: parseInt(form.bathrooms) || 0,
      area_sqft: parseInt(form.area_sqft) || 0,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Property added (pending approval)" });
      setForm({ title: "", description: "", property_type: "House", price: "", currency: "KES", location: "", city: "", country: "Kenya", bedrooms: "0", bathrooms: "0", area_sqft: "0" });
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
    }
    setLoading(false);
  };

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Add Property</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => update("title", e.target.value)} required /></div>
          <div>
            <Label>Property Type</Label>
            <Select value={form.property_type} onValueChange={(v) => update("property_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["House", "Apartment", "Villa", "Townhouse", "Land", "Commercial"].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Price</Label><Input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} required /></div>
          <div>
            <Label>Currency</Label>
            <Select value={form.currency} onValueChange={(v) => update("currency", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["KES", "USD", "GBP", "EUR"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><Label>Location</Label><Input value={form.location} onChange={(e) => update("location", e.target.value)} /></div>
          <div><Label>City</Label><Input value={form.city} onChange={(e) => update("city", e.target.value)} /></div>
          <div><Label>Country</Label><Input value={form.country} onChange={(e) => update("country", e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><Label>Bedrooms</Label><Input type="number" value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} /></div>
          <div><Label>Bathrooms</Label><Input type="number" value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} /></div>
          <div><Label>Area (sqft)</Label><Input type="number" value={form.area_sqft} onChange={(e) => update("area_sqft", e.target.value)} /></div>
        </div>
        <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Property"}</Button>
      </form>
    </div>
  );
};

export default AddPropertySection;
