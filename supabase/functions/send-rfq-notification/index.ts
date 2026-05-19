import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { full_name, company_name, email, phone, product_interest, quantity, message } = await req.json();

    if (!full_name || !email) {
      return new Response(JSON.stringify({ error: "full_name and email are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert into database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: dbError } = await supabase.from("rfq_requests").insert({
      full_name, company_name, email, phone, product_interest, quantity, message,
    });
    if (dbError) throw dbError;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const WA_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const WA_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const WA_SALES_NUMBER = Deno.env.get("WHATSAPP_SALES_NUMBER");
    const WA_TEMPLATE_NAME = Deno.env.get("WHATSAPP_TEMPLATE_NAME") ?? "rfq_notification";

    // ── Emails via Resend ─────────────────────────────────────────────────────
    if (RESEND_API_KEY) {
      const baseHeaders = {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      };

      // Internal notification to sales team
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: baseHeaders,
        body: JSON.stringify({
          from: "Regal Quote System <onlinequotes@regalfurn.co.zw>",
          to: ["onlinequotes@regalfurn.co.zw"],
          subject: `New Quote Request: ${product_interest || "Enquiry"} — ${full_name}`,
          html: `
            <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:32px;color:#1a1a1a;">
              <h2 style="font-size:22px;font-weight:bold;border-bottom:2px solid #1a1a1a;padding-bottom:12px;margin-bottom:24px;">New Quote Request</h2>
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr><td style="padding:8px 0;color:#666;width:160px;">Name</td><td style="padding:8px 0;font-weight:600;">${full_name}</td></tr>
                <tr><td style="padding:8px 0;color:#666;">Company</td><td style="padding:8px 0;">${company_name || "—"}</td></tr>
                <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#1a1a1a;">${email}</a></td></tr>
                <tr><td style="padding:8px 0;color:#666;">Phone</td><td style="padding:8px 0;">${phone || "—"}</td></tr>
                <tr><td style="padding:8px 0;color:#666;">Product</td><td style="padding:8px 0;font-weight:600;">${product_interest || "—"}</td></tr>
                <tr><td style="padding:8px 0;color:#666;">Quantity</td><td style="padding:8px 0;">${quantity ?? "—"}</td></tr>
                <tr><td style="padding:8px 0;color:#666;vertical-align:top;">Message</td><td style="padding:8px 0;">${message || "—"}</td></tr>
              </table>
              <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e5e5;font-size:12px;color:#999;">
                Regal Office &amp; Home · regalfurniture.co.zw
              </div>
            </div>
          `,
        }),
      });

      // Customer confirmation
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: baseHeaders,
        body: JSON.stringify({
          from: "Regal Office & Home <onlinequotes@regalfurn.co.zw>",
          to: [email],
          subject: "Your Quote Request Has Been Received — Regal Office & Home",
          html: `
            <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:32px;color:#1a1a1a;">
              <h2 style="font-size:22px;font-weight:bold;margin-bottom:8px;">Thank you, ${full_name}.</h2>
              <p style="font-size:15px;color:#444;line-height:1.7;margin-bottom:24px;">
                We've received your quote request for <strong>${product_interest || "your selected product"}</strong>
                and our sales team will be in touch within 24 hours.
              </p>
              <div style="background:#f5f5f5;padding:20px 24px;border-left:3px solid #1a1a1a;margin-bottom:32px;font-size:14px;">
                <p style="margin:0 0 6px;"><strong>Product:</strong> ${product_interest || "—"}</p>
                <p style="margin:0 0 6px;"><strong>Quantity:</strong> ${quantity ?? "—"}</p>
                ${message ? `<p style="margin:0;"><strong>Note:</strong> ${message}</p>` : ""}
              </div>
              <p style="font-size:14px;color:#666;">
                In the meantime, feel free to WhatsApp or call us directly.
              </p>
              <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e5e5;font-size:12px;color:#999;">
                Regal Office &amp; Home · regalfurniture.co.zw
              </div>
            </div>
          `,
        }),
      });
    }

    // ── WhatsApp notification via Meta Cloud API ───────────────────────────────
    // Requires a pre-approved template in Meta Business Manager.
    // Template name stored in WHATSAPP_TEMPLATE_NAME env var.
    // Template body (5 parameters): {{1}}=name, {{2}}=company, {{3}}=product, {{4}}=qty, {{5}}=email
    if (WA_PHONE_NUMBER_ID && WA_ACCESS_TOKEN && WA_SALES_NUMBER) {
      await fetch(`https://graph.facebook.com/v19.0/${WA_PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WA_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: WA_SALES_NUMBER,
          type: "template",
          template: {
            name: WA_TEMPLATE_NAME,
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: full_name },
                  { type: "text", text: company_name || "N/A" },
                  { type: "text", text: product_interest || "N/A" },
                  { type: "text", text: String(quantity ?? "N/A") },
                  { type: "text", text: email },
                ],
              },
            ],
          },
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-rfq-notification error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
