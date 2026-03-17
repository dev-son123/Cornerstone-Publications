import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function ContactForm() {
  const empty = { name: "", email: "", phonenumber: "", subject: "", message: "" };
  const [form, setForm]     = useState(empty);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const set = (f: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [f]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.from("contacts").insert([{
      name:        form.name.trim(),
      email:       form.email.trim(),
      phonenumber: form.phonenumber.trim() || null,  // ✅ matches DB column
      subject:     form.subject.trim() || null,
      message:     form.message.trim() || null,
      status:      "new",
    }]);
    setLoading(false);
    if (err) {
      setError("Something went wrong. Please email us directly.");
      return;
    }
    setSuccess(true);
    setForm(empty);
  };

  // ── Success screen ─────────────────────────────────────────
  if (success) return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
      <h3 style={{ color: "#2e7d32", margin: "0 0 8px" }}>Message sent!</h3>
      <p style={{ color: "#555", margin: 0 }}>
        We'll respond within 24 hours on business days.
      </p>
      <button
        onClick={() => setSuccess(false)}
        style={{ marginTop: 20, padding: "8px 20px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer", background: "#fff" }}
      >
        Send another
      </button>
    </div>
  );

  // ── Styles ─────────────────────────────────────────────────
  const I: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    border: "1.5px solid #e0e0e0", borderRadius: 10,
    padding: "10px 13px", fontSize: 14,
    fontFamily: "inherit", outline: "none",
  };
  const L: React.CSSProperties = {
    display: "block", fontSize: 13,
    fontWeight: 500, color: "#444", marginBottom: 6,
  };

  // ── Form ───────────────────────────────────────────────────
  return (
    <div>
      {/* Row 1: Name + Email */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div>
          <label style={L}>Your Name <span style={{ color: "#e91e8c" }}>*</span></label>
          <input
            style={I} type="text"
            placeholder="Enter your name"
            value={form.name}
            onChange={set("name")}
            required
          />
        </div>
        <div>
          <label style={L}>Email <span style={{ color: "#e91e8c" }}>*</span></label>
          <input
            style={I} type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={set("email")}
            required
          />
        </div>
      </div>

      {/* Row 2: Phone Number */}
      <div style={{ marginBottom: 14 }}>
        <label style={L}>Phone Number</label>
        <input
          style={I} type="tel"
          placeholder="Enter your phone number (e.g. +91 99999 99999)"
          value={form.phonenumber}           // ✅ correctly uses phonenumber
          onChange={set("phonenumber")}      // ✅ correctly uses phonenumber
        />
      </div>

      {/* Row 3: Subject */}
      <div style={{ marginBottom: 14 }}>
        <label style={L}>Subject</label>
        <input
          style={I} type="text"
          placeholder="What can we help with?"
          value={form.subject}
          onChange={set("subject")}
        />
      </div>

      {/* Row 4: Message */}
      <div style={{ marginBottom: 20 }}>
        <label style={L}>Message</label>
        <textarea
          style={{ ...I, minHeight: 120, resize: "vertical" }}
          placeholder="Tell us more about your query..."
          value={form.message}
          onChange={set("message")}
        />
      </div>

      {/* Error */}
      {error && (
        <p style={{ color: "#c62828", background: "#ffebee", padding: "8px 12px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        onClick={submit}
        disabled={loading || !form.name || !form.email}
        style={{
          width: "100%", padding: "12px 0",
          background: "#e91e8c", color: "#fff",
          border: "none", borderRadius: 10,
          fontSize: 15, fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Sending..." : "Send Message →"}
      </button>
    </div>
  );
}