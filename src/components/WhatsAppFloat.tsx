import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/contact";

const WhatsAppFloat = () => {
  const message = "Hello Regal Office & Home, I would like help with products and pricing.";
  const href = buildWhatsAppLink(message);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Regal Office & Home on WhatsApp"
      className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_16px_40px_rgba(37,211,102,0.35)] transition-transform duration-200 hover:scale-105 md:bottom-6 md:right-6"
    >
      <MessageCircle size={26} />
    </a>
  );
};

export default WhatsAppFloat;
