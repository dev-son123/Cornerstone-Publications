import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Patterns to detect attacks
const THREAT_PATTERNS = [
  { pattern: /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,         type: "SQLi" },
  { pattern: /<script[\s\S]*?>[\s\S]*?<\/script>/i,     type: "XSS" },
  { pattern: /(\.\.[\/\\]){2,}/,                        type: "PathTraversal" },
  { pattern: /(union|select|insert|drop|delete)\s/i,    type: "SQLi" },
  { pattern: /javascript:/i,                            type: "XSS" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { ip_address, path, payload, user_agent } = body;

    // Scan payload for threats
    const payloadStr = JSON.stringify(payload || "");
    let threat_type = null;

    for (const { pattern, type } of THREAT_PATTERNS) {
      if (pattern.test(payloadStr) || pattern.test(path || "")) {
        threat_type = type;
        break;
      }
    }

    // Log the security event
    await supabase.from("auth_audit_log").insert({
      ip_address,
      event_type: threat_type ? `threat_detected:${threat_type}` : "request",
      email: null,
      metadata: { path, payload, user_agent, threat_type },
      created_at: new Date().toISOString(),
    });

    // Auto-block IP if threat detected
    if (threat_type) {
      await supabase.from("account_lockouts").upsert({
        email: `ip:${ip_address}`,
        failed_attempts: 99,
        locked_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "email" });

      return new Response(
        JSON.stringify({ threat_detected: true, type: threat_type, action: "ip_blocked" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ threat_detected: false }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});