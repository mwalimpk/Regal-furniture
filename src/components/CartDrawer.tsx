import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageCircle } from "lucide-react";
import {
  buildEmailLink,
  buildWhatsAppLink,
  getOrderBranchOptions,
  SALES_WHATSAPP_NUMBERS,
  type SalesBranch,
} from "@/lib/contact";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SavedOrder = {
  id?: string;
};

const CartDrawer = () => {
  const { items, removeItem, updateQuantity, clearCart, itemCount, isOpen, setIsOpen } = useCart();
  const { currency, convert, format, formatConverted } = useCurrency();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [checkingOut, setCheckingOut] = useState(false);
  const [choosingBranch, setChoosingBranch] = useState(false);
  const [preparingWhatsApp, setPreparingWhatsApp] = useState(false);
  const convertedUnitPrice = (price: number, sourceCurrency: string) => convert(price, sourceCurrency);
  const displayTotal = items.reduce(
    (sum, item) => sum + convertedUnitPrice(item.price, item.currency) * item.quantity,
    0,
  );

  const saveOrder = async (status: string, destination?: SalesBranch) => {
    if (!user) return null;
    const orderItems = items.map((item) => ({
      id: item.id,
      name: item.name,
      price: convertedUnitPrice(item.price, item.currency),
      quantity: item.quantity,
      warehouse: item.warehouse || "Harare",
      destination: destination || null,
    }));
    const { data, error } = await supabase.from("orders").insert({
      user_id: user.id,
      total: displayTotal,
      currency,
      items: orderItems,
      status,
    }).select().single();
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    }
    return data as SavedOrder | null;
  };

  const handleStripeCheckout = async () => {
    if (!user) {
      setIsOpen(false);
      navigate("/auth");
      toast({ title: "Please sign in", description: "You need to be signed in to checkout." });
      return;
    }

    setCheckingOut(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          items: items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
          success_url: `${window.location.origin}/dashboard?payment=success`,
          cancel_url: `${window.location.origin}/?payment=cancelled`,
          customer_email: user.email,
        },
      });

      if (error) throw error;
      const checkoutData = data as { url?: string } | null;
      if (checkoutData?.url) {
        await saveOrder("pending");
        clearCart();
        setIsOpen(false);
        window.location.href = checkoutData.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not start checkout.";
      toast({ title: "Payment error", description: message, variant: "destructive" });
    } finally {
      setCheckingOut(false);
    }
  };

  const requireSignedInUser = () => {
    if (!user) {
      setIsOpen(false);
      navigate("/auth");
      toast({ title: "Please sign in", description: "You need to be signed in to checkout." });
      return false;
    }

    return true;
  };

  const buildOrderDetails = (plainText = false, destination?: SalesBranch) => {
    const itemLines = items
      .map((item) => {
        const lineTotal = convertedUnitPrice(item.price, item.currency) * item.quantity;
        const warehouse = item.warehouse || "Harare";
        const line = `${item.name} x${item.quantity} - ${formatConverted(lineTotal)} (${warehouse} warehouse)`;
        return plainText ? `- ${line}` : `* ${line}`;
      })
      .join("\n");

    const branchLine = destination
      ? `\n${plainText ? "Order branch" : "*Order branch*"}: ${destination}`
      : "";

    return `${itemLines}\n\n${plainText ? "Total" : "*Total"}: ${formatConverted(displayTotal)}${plainText ? "" : "*"}${branchLine}\n\nCustomer: ${user?.email || ""}`;
  };

  const sendWhatsAppOrder = async (branch: SalesBranch) => {
    setChoosingBranch(false);
    setPreparingWhatsApp(true);
    const whatsappWindow = window.open("about:blank", "_blank");
    if (whatsappWindow) whatsappWindow.opener = null;

    try {
      const order = await saveOrder("pending", branch);
      if (!order) {
        whatsappWindow?.close();
        return;
      }

      const message = `*New Order from Regal Office & Home*\n\n${buildOrderDetails(false, branch)}`;
      const whatsappLink = buildWhatsAppLink(message, SALES_WHATSAPP_NUMBERS[branch]);
      if (whatsappWindow) {
        whatsappWindow.location.replace(whatsappLink);
      } else {
        window.location.href = whatsappLink;
      }

      clearCart();
      setIsOpen(false);
      toast({
        title: "Order prepared!",
        description: `Complete your order with our ${branch} sales team on WhatsApp.`,
      });
    } finally {
      setPreparingWhatsApp(false);
    }
  };

  const handleWhatsAppOrder = () => {
    if (!requireSignedInUser()) return;

    const branchOptions = getOrderBranchOptions(items.map((item) => item.warehouse));
    if (branchOptions.length === 1) {
      void sendWhatsAppOrder(branchOptions[0]);
      return;
    }

    setChoosingBranch(true);
  };

  const handleEmailOrder = async () => {
    if (!requireSignedInUser()) return;

    const order = await saveOrder("pending");
    if (!order) return;

    const orderReference = order.id ? `Order reference: ${order.id}\n\n` : "";
    const subject = `New website order from ${user?.email || "customer"}`;
    const body = `Hello Regal Office & Home,\n\nI would like to place the following order:\n\n${orderReference}${buildOrderDetails(true)}`;
    window.location.href = buildEmailLink(subject, body);

    clearCart();
    setIsOpen(false);
    toast({ title: "Email prepared!", description: "Review and send the order from your email app." });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-serif">Your Cart ({itemCount})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <p className="text-lg font-serif font-semibold text-muted-foreground">Your cart is empty</p>
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
                    <p className="text-sm text-muted-foreground">{format(item.price, item.currency)}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                      {item.warehouse || "Harare"} warehouse
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 border border-border flex items-center justify-center hover:bg-muted text-xs font-bold">
                        −
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 border border-border flex items-center justify-center hover:bg-muted text-xs font-bold">
                        +
                      </button>
                      <button onClick={() => removeItem(item.id)} className="ml-auto text-destructive hover:text-destructive/80 text-xs font-medium">
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                    {formatConverted(convertedUnitPrice(item.price, item.currency) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatConverted(displayTotal)}</span>
              </div>
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={handleWhatsAppOrder}
                disabled={preparingWhatsApp}
              >
                <MessageCircle className="h-4 w-4" />
                {preparingWhatsApp ? "Preparing WhatsApp order..." : "Order via WhatsApp"}
              </Button>
              <Button variant="outline" className="w-full" size="lg" onClick={handleEmailOrder}>
                <Mail className="h-4 w-4" />
                Send via Email
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setIsOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </SheetContent>

      <Dialog open={choosingBranch} onOpenChange={setChoosingBranch}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Choose an order warehouse</DialogTitle>
            <DialogDescription>
              Your cart includes products assigned to multiple warehouses or available at both. Choose which sales team
              should receive the WhatsApp order.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            {(["Harare", "Bulawayo"] as SalesBranch[]).map((branch) => (
              <Button
                key={branch}
                type="button"
                variant="outline"
                className="h-auto justify-start gap-3 px-4 py-4 text-left"
                disabled={preparingWhatsApp}
                onClick={() => void sendWhatsAppOrder(branch)}
              >
                <MessageCircle className="h-5 w-5 shrink-0" />
                <span>
                  <span className="block font-semibold">{branch}</span>
                  <span className="block text-xs font-normal text-muted-foreground">
                    +{SALES_WHATSAPP_NUMBERS[branch]}
                  </span>
                </span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
};

export default CartDrawer;
