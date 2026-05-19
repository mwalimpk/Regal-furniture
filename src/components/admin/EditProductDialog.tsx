import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

interface Props {
  product: any | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const EditProductDialog = ({ product, open, onOpenChange }: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({});
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title || "",
        description: product.description || "",
        property_type: product.property_type || "Executive Desking",
        price: String(product.price || ""),
        currency: product.currency || "USD",
        location: product.location || "",
        city: product.city || "Harare",
        status: product.status || "approved",
      });
      setImages(product.images || []);
    }
  }, [product]);

  const update = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!product) return;
    setLoading(true);
    const { error } = await supabase.from("properties").update({
      title: form.title,
      description: form.description,
      property_type: form.property_type,
      price: parseFloat(form.price) || 0,
      currency: form.currency,
      location: form.location,
      city: form.city,
      status: form.status,
      images,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Name</Label><Input value={form.title} onChange={(e) => update("title", e.target.value)} /></div>
            <div>
              <Label>Category</Label>
              <Select value={form.property_type} onValueChange={(v) => update("property_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} /></div>
          <div>
            <Label>Images (up to 10)</Label>
            <ImageUploader images={images} onChange={setImages} max={10} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Price</Label><Input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} /></div>
            <div>
              <Label>Currency</Label>
              <Select value={form.currency} onValueChange={(v) => update("currency", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["USD", "ZWL"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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
          <div className="grid grid-cols-2 gap-3">
            <div><Label>SKU / Model</Label><Input value={form.location} onChange={(e) => update("location", e.target.value)} /></div>
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
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={save} disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
