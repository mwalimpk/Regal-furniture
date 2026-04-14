import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface BookVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BookVisitDialog = ({ open, onOpenChange }: BookVisitDialogProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [showroom, setShowroom] = useState<"harare" | "bulawayo">("harare");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const showroomDetails = {
    harare: "DDK Centre 68, Enterprise Rd, Newlands, Harare",
    bulawayo: "Norvaal House, 68 Fife St, Bulawayo",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim() || !date) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      // Save lead
      await supabase.from("leads").insert({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        source: "showroom_visit",
        notes: `Showroom visit: ${showroom === "harare" ? "Harare" : "Bulawayo"} on ${date}`,
      });

      // Send to WhatsApp
      const locationName = showroom === "harare" ? "Harare" : "Bulawayo";
      const message = `📍 *Showroom Visit Request — Regal Office & Home*\n\n*Name:* ${name}\n*Phone:* ${phone}\n*Email:* ${email}\n*Showroom:* ${locationName}\n*Address:* ${showroomDetails[showroom]}\n*Preferred Date:* ${date}`;
      const whatsappUrl = `https://wa.me/2638644281361?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");

      toast({ title: "Visit booked!", description: "We'll confirm your appointment via WhatsApp." });
      setName("");
      setPhone("");
      setEmail("");
      setDate("");
      onOpenChange(false);
    } catch {
      toast({ title: "Error", description: "Could not book visit.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Book a Showroom Visit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Select Showroom</Label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => setShowroom("harare")}
                className={`py-3 border text-sm font-medium transition-colors text-left px-3 ${
                  showroom === "harare"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-foreground hover:bg-muted"
                }`}
              >
                <span className="block font-semibold">Harare</span>
                <span className="text-[10px] opacity-80">DDK Centre, Newlands</span>
              </button>
              <button
                type="button"
                onClick={() => setShowroom("bulawayo")}
                className={`py-3 border text-sm font-medium transition-colors text-left px-3 ${
                  showroom === "bulawayo"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-foreground hover:bg-muted"
                }`}
              >
                <span className="block font-semibold">Bulawayo</span>
                <span className="text-[10px] opacity-80">Norvaal House, Fife St</span>
              </button>
            </div>
          </div>
          <div>
            <Label htmlFor="visit-name">Full Name</Label>
            <Input id="visit-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Doe" />
          </div>
          <div>
            <Label htmlFor="visit-phone">Phone Number</Label>
            <Input id="visit-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+263..." />
          </div>
          <div>
            <Label htmlFor="visit-email">Email</Label>
            <Input id="visit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div>
            <Label htmlFor="visit-date">Preferred Date</Label>
            <Input id="visit-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required min={new Date().toISOString().split("T")[0]} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Book Visit via WhatsApp"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Our team will confirm your visit time via WhatsApp.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookVisitDialog;
