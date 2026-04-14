import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CartDrawer = () => {
  const { items, removeItem, updateQuantity, clearCart, total, itemCount, isOpen, setIsOpen } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);

  const handleCheckout = async () => {
    if (!user) {
      setIsOpen(false);
      navigate("/auth");
      toast({ title: "Please sign in", description: "You need to be signed in to checkout." });
      return;
    }

    const orderItems = items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity }));

    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      total,
      currency: "USD",
      items: orderItems,
      status: "pending",
    } as any);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Build WhatsApp message
      const itemLines = orderItems.map((i) => `• ${i.name} x${i.quantity} — $${i.price * i.quantity}`).join("\n");
      const message = `🛒 *New Order from Regal Office & Home*\n\n${itemLines}\n\n*Total: $${total}*\n\nCustomer: ${user.email}`;
      const whatsappUrl = `https://wa.me/2638644281361?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");

      clearCart();
      setIsOpen(false);
      toast({ title: "Order placed!", description: "Complete your order on WhatsApp." });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-serif">Your Cart ({itemCount})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <ShoppingBag size={48} className="text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Continue Shopping</Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 border-b border-border pb-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground truncate">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 border border-border flex items-center justify-center hover:bg-muted">
                        <Minus size={12} />
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 border border-border flex items-center justify-center hover:bg-muted">
                        <Plus size={12} />
                      </button>
                      <button onClick={() => removeItem(item.id)} className="ml-auto text-destructive hover:text-destructive/80">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-foreground whitespace-nowrap">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Checkout
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
