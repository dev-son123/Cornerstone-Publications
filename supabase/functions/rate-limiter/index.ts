import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Limits per action type
const LIMITS: Record<string, { max: number; window_minutes: number }> = {
  login:      { max: 5,  window_minutes: 15 },
  signup:     { max: 3,  window_minutes: 60 },
  contact:    { max: 5,  window_minutes: 60 },
  submission: { max: 5,  window_minutes: 60 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { ip_address, action } = body;

    const limit = LIMITS[action] || { max: 10, window_minutes: 60 };
    const windowStart = new Date(Date.now() - limit.window_minutes * 60 * 1000).toISOString();
    const key = `${ip_address}:${action}`;

    // Count recent requests
    const { data: existing } = await supabase
      .from("rate_limit_store")
      .select("*")
      .eq("key", key)
      .single();

    const now = new Date().toISOString();

    if (!existing) {
      await supabase.from("rate_limit_store").insert({ key, count: 1, window_start: now });
      return new Response(JSON.stringify({ allowed: true, remaining: limit.max - 1 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Reset window if expired
    if (existing.window_start < windowStart) {
      await supabase.from("rate_limit_store").update({ count: 1, window_start: now }).eq("key", key);
      return new Response(JSON.stringify({ allowed: true, remaining: limit.max - 1 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (existing.count >= limit.max) {
      return new Response(
        JSON.stringify({ allowed: false, message: `Rate limit exceeded. Max ${limit.max} per ${limit.window_minutes} min.` }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase.from("rate_limit_store").update({ count: existing.count + 1 }).eq("key", key);
    return new Response(
      JSON.stringify({ allowed: true, remaining: limit.max - existing.count - 1 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});