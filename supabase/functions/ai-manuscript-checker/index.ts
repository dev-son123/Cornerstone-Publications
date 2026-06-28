// supabase/functions/ai-manuscript-checker/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { title, abstract } = await req.json();

    if (!title || !abstract) {
      return new Response(
        JSON.stringify({ error: "Title and abstract are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: `You are an expert academic journal editor for the Journal of Clinical Nursing and Allied Health Practice (JCNAP). Review this manuscript submission and provide a detailed assessment.

Title: ${title}

Abstract: ${abstract}

Respond ONLY with a valid JSON object in this exact format:
{
  "score": <number 0-100>,
  "recommendation": "<Strong Accept|Minor Revisions|Major Revisions|Reject>",
  "ready_to_submit": <true|false>,
  "abstract_structure": {
    "background": <true|false>,
    "objectives": <true|false>,
    "methods": <true|false>,
    "results": <true|false>,
    "conclusion": <true|false>
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "summary": "<2 sentence overall assessment>"
}`
        }]
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "{}";

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = { score: 0, recommendation: "Error", summary: "Could not parse response." };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[ai-manuscript-checker] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
