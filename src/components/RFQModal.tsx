import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RFQModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName?: string;
}

const emptyForm = (product: string) => ({
  full_name: "",
  company_name: "",
  email: "",
  phone: "",
  product_interest: product,
  quantity: "",
  message: "",
});

const RFQModal = ({ open, onOpenChange, productName = "" }: RFQModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm(productName));
  const whatsappNumber = "2638644281361";

  useEffect(() => {
    if (open) setForm(emptyForm(productName));
  }, [open, productName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, quantity: form.quantity ? Number(form.quantity) : null };
      const { error } = await supabase.functions.invoke("send-rfq-notification", {
        body: payload,
      });
      if (error) throw error;
      const message = [
        "Hello Regal Office & Home, I would like a quote.",
        "",
        `Name: ${form.full_name}`,
        form.company_name ? `Company: ${form.company_name}` : "",
        `Email: ${form.email}`,
        form.phone ? `Phone: ${form.phone}` : "",
        form.product_interest ? `Product: ${form.product_interest}` : "",
        form.quantity ? `Quantity: ${form.quantity}` : "",
        form.message ? `Requirements: ${form.message}` : "",
      ]
        .filter(Boolean)
        .join("\n");
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
      toast({ title: "Quote request sent!", description: "We'll be in touch within 24 hours." });
      onOpenChange(false);
    } catch {
      toast({
        title: "Failed to send",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Request a Quote</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rfq-full_name">Full Name *</Label>
              <Input
                id="rfq-full_name"
                name="full_name"
                required
                value={form.full_name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rfq-company_name">Company</Label>
              <Input
                id="rfq-company_name"
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rfq-email">Email *</Label>
              <Input
                id="rfq-email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rfq-phone">Phone</Label>
              <Input
                id="rfq-phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rfq-product_interest">Product of Interest</Label>
            <Input
              id="rfq-product_interest"
              name="product_interest"
              value={form.product_interest}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rfq-quantity">Quantity</Label>
            <Input
              id="rfq-quantity"
              name="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rfq-message">Message / Special Requirements</Label>
            <Textarea
              id="rfq-message"
              name="message"
              rows={3}
              value={form.message}
              onChange={handleChange}
              placeholder="Delivery location, colour preference, custom finish..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RFQModal;
