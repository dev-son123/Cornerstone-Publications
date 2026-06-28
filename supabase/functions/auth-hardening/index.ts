import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { email, ip_address, event_type } = body;

    // Check if account is locked
    const { data: lockout } = await supabase
      .from("account_lockouts")
      .select("*")
      .eq("email", email)
      .single();

    if (lockout && lockout.locked_until && new Date(lockout.locked_until) > new Date()) {
      const minutesLeft = Math.ceil(
        (new Date(lockout.locked_until).getTime() - Date.now()) / 60000
      );
      return new Response(
        JSON.stringify({ blocked: true, message: `Account locked. Try again in ${minutesLeft} minutes.` }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log auth event
    await supabase.from("auth_audit_log").insert({
      email,
      ip_address,
      event_type,
      created_at: new Date().toISOString(),
    });

    // Handle failed login — increment counter
    if (event_type === "login_failed") {
      const attempts = (lockout?.failed_attempts || 0) + 1;
      const locked_until = attempts >= 5
        ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
        : null;

      await supabase.from("account_lockouts").upsert({
        email,
        failed_attempts: attempts,
        locked_until,
        updated_at: new Date().toISOString(),
      }, { onConflict: "email" });

      if (attempts >= 5) {
        return new Response(
          JSON.stringify({ blocked: true, message: "Too many failed attempts. Account locked for 15 minutes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // On successful login — reset lockout
    if (event_type === "login_success") {
      await supabase.from("account_lockouts").upsert({
        email,
        failed_attempts: 0,
        locked_until: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "email" });
    }

    return new Response(
      JSON.stringify({ blocked: false, message: "OK" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});