import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName?: string;
  productPrice?: number;
}

const OrderFormDialog = ({ open, onOpenChange, productName, productPrice }: OrderFormDialogProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { format } = useCurrency();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      // Save inquiry to database
      await supabase.from("inquiries").insert({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        message: productName ? `Order inquiry for: ${productName}${productPrice ? ` (${format(productPrice)})` : ""}` : "General order inquiry",
        user_id: user?.id || null,
      } as any);

      // Send to WhatsApp
      const productLine = productName ? `\n*Product:* ${productName}${productPrice ? ` — ${format(productPrice)}` : ""}` : "";
      const message = `📋 *New Order Inquiry — Regal Office & Home*\n\n*Name:* ${name}\n*Phone:* ${phone}\n*Email:* ${email}${productLine}`;
      const whatsappUrl = `https://wa.me/2638644281361?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");

      toast({ title: "Order submitted!", description: "Complete your order on WhatsApp. We'll also follow up via email." });
      setName("");
      setPhone("");
      setEmail("");
      onOpenChange(false);
    } catch {
      toast({ title: "Error", description: "Could not submit order.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Place an Order</DialogTitle>
        </DialogHeader>
        {productName && (
          <div className="border border-border p-3 bg-muted/50 text-sm">
            <p className="font-semibold text-foreground">{productName}</p>
            {productPrice && <p className="text-muted-foreground">{format(productPrice)}</p>}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="order-name">Full Name</Label>
            <Input id="order-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Doe" />
          </div>
          <div>
            <Label htmlFor="order-phone">Phone Number</Label>
            <Input id="order-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+263..." />
          </div>
          <div>
            <Label htmlFor="order-email">Email</Label>
            <Input id="order-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Order via WhatsApp"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Your order will be sent via WhatsApp. Our team will confirm availability and delivery.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderFormDialog;
