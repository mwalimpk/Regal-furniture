export const SALES_WHATSAPP_NUMBER = "263780472180";
export const SALES_EMAIL = "info@regalfurn.co.zw";

export const buildWhatsAppLink = (message: string) =>
  `https://wa.me/${SALES_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const buildWhatsAppCallLink = () =>
  `whatsapp://call?phone=${SALES_WHATSAPP_NUMBER}`;

export const buildEmailLink = (subject: string, body: string) =>
  `mailto:${SALES_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
