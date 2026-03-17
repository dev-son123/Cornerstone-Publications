// supabase/functions/contact-notify/index.ts
// Deploy: supabase functions deploy contact-notify
//
// Required env vars (set in Supabase Dashboard → Settings → Edge Functions):
//   WATI_API_URL        = https://live-server-XXXXX.wati.io   (from WATI dashboard)
//   WATI_ACCESS_TOKEN   = your WATI bearer token
//   WATI_PHONE          = 919962900969  (your WhatsApp number, no + sign)
//   SHEETS_WEBHOOK_URL  = your Make.com webhook URL (see README)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    // Supabase webhook sends: { type, table, record, old_record }
    const contact = payload.record;

    if (!contact) {
      return new Response("No record", { status: 400 });
    }

    const { name, email, subject, message, created_at } = contact;
    const formattedDate = new Date(created_at).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    // ── WHATSAPP via WATI ────────────────────────────────────
    const watiUrl = Deno.env.get("WATI_API_URL");
    const watiToken = Deno.env.get("WATI_ACCESS_TOKEN");
    const watiPhone = Deno.env.get("WATI_PHONE");

    if (watiUrl && watiToken && watiPhone) {
      const whatsappMessage =
        `📬 *New Contact Form Submission*\n\n` +
        `*Name:* ${name}\n` +
        `*Email:* ${email}\n` +
        `*Subject:* ${subject || "—"}\n` +
        `*Message:* ${message || "—"}\n` +
        `*Time:* ${formattedDate} IST\n\n` +
        `Reply at: cornerstonepublications.in/contact`;

      await fetch(`${watiUrl}/api/v1/sendSessionMessage/${watiPhone}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${watiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messageText: whatsappMessage }),
      });
    }

    // ── GOOGLE SHEETS via Make.com webhook ───────────────────
    const sheetsWebhook = Deno.env.get("SHEETS_WEBHOOK_URL");

    if (sheetsWebhook) {
      await fetch(sheetsWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject: subject || "",
          message: message || "",
          timestamp: formattedDate,
          source: "cornerstonepublications.in",
        }),
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
