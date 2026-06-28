// supabase/functions/ai-chatbot/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a helpful assistant for Cornerstone Research and Publication Services and the Journal of Clinical Nursing and Allied Health Practice (JCNAP). You answer questions from researchers and authors.

Key facts you know:
- Journal name: Journal of Clinical Nursing and Allied Health Practice (JCNAP)
- Publisher: Cornerstone Research and Publication Services
- Website: cornerstonepublications.in
- Email: info@cornerstonepublications.in
- Phone: +91 9962900969
- Article Processing Charge (APC): ₹1,200 per article
- Review time: 4-6 weeks
- Publication format: Open Access, PDF and HTML
- Submission: Online via the journal website
- Accepts: Original research, systematic reviews, case studies, clinical guidelines
- PhD Mentorship packages: Basic ₹5,000, Standard ₹9,000
- Research Notes: Physics ₹499, Nursing ₹499, Bundle ₹799

Guidelines:
- Manuscripts must be in English
- Format: APA or MLA citation style
- Plagiarism must be below 20%
- Authors retain copyright under Creative Commons license
- Double-blind peer review process
- Submission requires: full manuscript, copyright form, conflict of interest form

Respond helpfully and concisely. You can respond in both English and Tamil if the user writes in Tamil. Keep responses under 150 words.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, history = [] } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const messages = [
      ...history.slice(-6), // Keep last 3 exchanges for context
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text ?? "Sorry, I could not process your request. Please email info@cornerstonepublications.in";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[ai-chatbot] Error:", err);
    return new Response(
      JSON.stringify({ reply: "Sorry, something went wrong. Please email info@cornerstonepublications.in or call +91 9962900969." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
