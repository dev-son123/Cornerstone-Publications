import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  }

  try {
    const { type, payload } = await req.json();

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set in Supabase secrets');
    }

    let emailOptions;

    if (type === 'status_update') {
      const { email, authorName, title, status } = payload;
      emailOptions = {
        from: 'Cornerstone <info@cornerstoneresearch.in>',
        to: [email],
        subject: `Update: Manuscript "${title}" is now ${status}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <p>Dear ${authorName || 'Author'},</p>
            <p>The status of your manuscript "<strong>${title}</strong>" has been updated to: <span style="font-weight: bold; color: #d63384;">${status}</span>.</p>
            <p>You can track further progress in your Author Dashboard.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888;">&copy; 2026 Cornerstone Research And Publication Services</p>
          </div>
        `,
      };
    } else if (type === 'broadcast') {
      const { subject, body, recipients } = payload;
      emailOptions = {
        from: 'Cornerstone <info@cornerstoneresearch.in>',
        to: recipients, // Array of emails
        subject: subject,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            ${body}
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888;">&copy; 2026 Cornerstone Research And Publication Services</p>
          </div>
        `,
      };
    } else {
      throw new Error(`Unknown email type: ${type}`);
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailOptions),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: res.status,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 400,
    });
  }
});
