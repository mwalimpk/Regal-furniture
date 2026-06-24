import { type ReactNode, useState } from "react";
import { MessageCircle, PhoneCall } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import {
  buildWhatsAppCallLink,
  buildWhatsAppLink,
  SALES_WHATSAPP_NUMBERS,
  type SalesBranch,
} from "@/lib/contact";

type WhatsAppQuoteDialogProps = {
  children?: ReactNode;
  productName?: string;
  productSku?: string;
  quoteMessage?: string;
  triggerClassName?: string;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
};

const QUOTE_BRANCHES: SalesBranch[] = ["Harare", "Bulawayo"];

const WhatsAppQuoteDialog = ({
  children = "Request Quote",
  productName,
  productSku,
  quoteMessage = "Hello Regal Office & Home, I would like to request a quote.",
  triggerClassName,
  triggerVariant,
  triggerSize,
}: WhatsAppQuoteDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const buildQuoteMessage = (branch: SalesBranch) => [
    quoteMessage,
    productName ? `Product: ${productName}` : "",
    productSku ? `SKU / Model: ${productSku}` : "",
    `Preferred branch: ${branch}`,
    typeof window !== "undefined" ? `Page: ${window.location.href}` : "",
  ].filter(Boolean).join("\n");

  const requestQuote = (branch: SalesBranch) => {
    const phoneNumber = SALES_WHATSAPP_NUMBERS[branch];
    const callLink = buildWhatsAppCallLink(phoneNumber);
    const chatLink = buildWhatsAppLink(buildQuoteMessage(branch), phoneNumber);
    const quoteWindow = window.open(callLink, "_blank", "noopener,noreferrer");

    setOpen(false);

    if (!quoteWindow) {
      window.location.href = callLink;
      return;
    }

    toast({
      title: `WhatsApp call opened for ${branch}`,
      description: "If the call does not start, continue in WhatsApp chat.",
      action: (
        <ToastAction
          altText={`Open ${branch} WhatsApp chat`}
          onClick={() => window.open(chatLink, "_blank", "noopener,noreferrer")}
        >
          Open Chat
        </ToastAction>
      ),
    });
  };

  return (
    <>
      <Button
        type="button"
        variant={triggerVariant}
        size={triggerSize}
        className={triggerClassName}
        onClick={() => setOpen(true)}
      >
        {children}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Choose a WhatsApp branch</DialogTitle>
            <DialogDescription>
              Pick the sales team you want to call. If the call cannot start on this device, use the chat fallback.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            {QUOTE_BRANCHES.map((branch) => (
              <Button
                key={branch}
                type="button"
                variant="outline"
                className="h-auto justify-start gap-3 px-4 py-4 text-left"
                onClick={() => requestQuote(branch)}
              >
                <PhoneCall className="h-5 w-5 shrink-0" />
                <span>
                  <span className="block font-semibold">{branch}</span>
                  <span className="block text-xs font-normal text-muted-foreground">
                    +{SALES_WHATSAPP_NUMBERS[branch]}
                  </span>
                </span>
              </Button>
            ))}
          </div>

          <div className="flex items-start gap-3 border border-grid/25 bg-card p-3 text-xs leading-5 text-muted-foreground">
            <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>On desktop, WhatsApp may open the desktop app or WhatsApp Web depending on the browser setup.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WhatsAppQuoteDialog;
