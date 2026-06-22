import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCurrency } from "@/contexts/CurrencyContext";

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

interface InvoiceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  items: InvoiceItem[];
  total: number;
  currency: string;
  customerEmail: string;
  customerName?: string;
  date: string;
}

const InvoiceReceipt = ({ open, onOpenChange, orderId, items, total, currency, customerEmail, customerName, date }: InvoiceProps) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { format } = useCurrency();

  const handlePrint = () => {
    const content = invoiceRef.current;
    if (!content) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Invoice #${orderId.slice(0, 8)}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { font-size: 24px; margin: 0; }
        .header p { color: #666; font-size: 12px; }
        .info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; font-size: 13px; }
        th { background: #f5f5f5; font-weight: 600; }
        .total-row td { font-weight: bold; font-size: 15px; border-top: 2px solid #333; }
        .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #999; }
      </style></head><body>
      ${content.innerHTML}
      <script>window.print();window.close();</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  const handleWhatsApp = () => {
    const itemLines = items.map(i => `• ${i.name} x${i.quantity} — ${format(i.price * i.quantity, currency)}`).join("\n");
    const message = `📄 *Invoice #${orderId.slice(0, 8)}*\n\nDate: ${new Date(date).toLocaleDateString()}\nCustomer: ${customerName || customerEmail}\n\n${itemLines}\n\n*Total: ${format(total, currency)}*\n\nRegal Office & Home\n+263 8644 281 361`;
    window.open(`https://wa.me/2638644281361?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Invoice</DialogTitle>
        </DialogHeader>

        <div ref={invoiceRef}>
          <div className="header" style={{ textAlign: "center", marginBottom: 20 }}>
            <h1 style={{ fontSize: 20, margin: 0 }}>Regal Office & Home</h1>
            <p style={{ color: "#666", fontSize: 12 }}>Premium Office & Home Furniture</p>
            <p style={{ color: "#666", fontSize: 11 }}>Harare & Bulawayo, Zimbabwe · +263 8644 281 361</p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 16 }}>
            <div>
              <p style={{ margin: "2px 0" }}><strong>Invoice #:</strong> {orderId.slice(0, 8)}</p>
              <p style={{ margin: "2px 0" }}><strong>Date:</strong> {new Date(date).toLocaleDateString()}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: "2px 0" }}><strong>Customer:</strong> {customerName || "—"}</p>
              <p style={{ margin: "2px 0" }}><strong>Email:</strong> {customerEmail}</p>
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: 8, textAlign: "left", borderBottom: "1px solid #ddd", fontSize: 13 }}>Item</th>
                <th style={{ padding: 8, textAlign: "center", borderBottom: "1px solid #ddd", fontSize: 13 }}>Qty</th>
                <th style={{ padding: 8, textAlign: "right", borderBottom: "1px solid #ddd", fontSize: 13 }}>Price</th>
                <th style={{ padding: 8, textAlign: "right", borderBottom: "1px solid #ddd", fontSize: 13 }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td style={{ padding: 8, borderBottom: "1px solid #eee", fontSize: 13 }}>{item.name}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #eee", fontSize: 13, textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #eee", fontSize: 13, textAlign: "right" }}>{format(item.price, currency)}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #eee", fontSize: 13, textAlign: "right" }}>{format(item.price * item.quantity, currency)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} style={{ padding: 10, fontWeight: "bold", fontSize: 15, borderTop: "2px solid #333", textAlign: "right" }}>Total</td>
                <td style={{ padding: 10, fontWeight: "bold", fontSize: 15, borderTop: "2px solid #333", textAlign: "right" }}>{format(total, currency)}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ textAlign: "center", marginTop: 30, fontSize: 11, color: "#999" }}>
            <p>Thank you for your business!</p>
            <p>Regal Office & Home — info@regalofficehome.com</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={handlePrint} className="flex-1">Print Invoice</Button>
          <Button variant="outline" onClick={handleWhatsApp} className="flex-1">Send via WhatsApp</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceReceipt;
