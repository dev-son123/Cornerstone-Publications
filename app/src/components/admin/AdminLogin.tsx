// src/components/admin/AdminLogin.tsx
// Renders: password step → TOTP step → or TOTP enrollment QR

import React, { useState } from "react";
import { useAdminAuth } from "../../hooks/useAdminAuth";

interface Props {
  onAuthenticated: () => void;
}

export function AdminLogin({ onAuthenticated }: Props) {
  const {
    step, loading, error,
    totpQR, totpSecret,
    loginWithPassword, verifyTOTP, confirmEnrollment,
  } = useAdminAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [showPass, setShowPass] = useState(false);

  React.useEffect(() => {
    if (step === "dashboard") onAuthenticated();
  }, [step, onAuthenticated]);

  if (loading && step === "idle") {
    return (
      <div style={styles.center}>
        <div style={styles.spinner} />
        <p style={styles.hint}>Checking session...</p>
      </div>
    );
  }

  // ── TOTP Enrollment (first time) ────────────────────────
  if (step === "enroll_totp") {
    return (
      <div style={styles.card}>
        <h2 style={styles.title}>Set up 2-Factor Auth</h2>
        <p style={styles.sub}>
          Scan this QR code with <strong>Google Authenticator</strong> or <strong>Authy</strong>,
          then enter the 6-digit code to confirm.
        </p>

        {totpQR && (
          <div style={styles.qrWrap}
            dangerouslySetInnerHTML={{ __html: totpQR }} />
        )}

        {totpSecret && (
          <div style={styles.secretBox}>
            <p style={styles.secretLabel}>Can't scan? Enter this key manually:</p>
            <code style={styles.secret}>{totpSecret}</code>
          </div>
        )}

        <label style={styles.label}>6-digit code from your app</label>
        <input
          style={styles.input}
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          value={totpCode}
          onChange={e => setTotpCode(e.target.value.replace(/\D/g, ""))}
          onKeyDown={e => e.key === "Enter" && confirmEnrollment(totpCode)}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button
          style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }}
          onClick={() => confirmEnrollment(totpCode)}
          disabled={loading || totpCode.length !== 6}
        >
          {loading ? "Verifying..." : "Confirm & Enter Dashboard"}
        </button>
      </div>
    );
  }

  // ── TOTP Verification ───────────────────────────────────
  if (step === "totp") {
    return (
      <div style={styles.card}>
        <div style={styles.iconWrap}>🔐</div>
        <h2 style={styles.title}>Enter authenticator code</h2>
        <p style={styles.sub}>
          Open <strong>Google Authenticator</strong> or <strong>Authy</strong> and enter
          the 6-digit code for <em>Cornerstone Admin</em>.
        </p>

        <label style={styles.label}>6-digit code</label>
        <input
          style={{ ...styles.input, letterSpacing: "0.25em", textAlign: "center", fontSize: 22 }}
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="— — — — — —"
          value={totpCode}
          onChange={e => setTotpCode(e.target.value.replace(/\D/g, ""))}
          onKeyDown={e => e.key === "Enter" && verifyTOTP(totpCode)}
          autoFocus
        />

        {error && <p style={styles.error}>{error}</p>}

        <button
          style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }}
          onClick={() => verifyTOTP(totpCode)}
          disabled={loading || totpCode.length !== 6}
        >
          {loading ? "Verifying..." : "Verify →"}
        </button>

        <p style={styles.hint}>Code refreshes every 30 seconds</p>
      </div>
    );
  }

  // ── Password Step ────────────────────────────────────────
  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Welcome Back</h2>
      <p style={styles.sub}>Sign in to Cornerstone Admin Portal</p>

      <label style={styles.label}>Email address</label>
      <input
        style={styles.input}
        type="email"
        placeholder="admin@cornerstonepublications.in"
        value={email}
        onChange={e => setEmail(e.target.value)}
        autoFocus
      />

      <label style={styles.label}>Password</label>
      <div style={{ position: "relative" }}>
        <input
          style={{ ...styles.input, paddingRight: 44 }}
          type={showPass ? "text" : "password"}
          placeholder="Enter your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && loginWithPassword(email, password)}
        />
        <button
          style={styles.eyeBtn}
          onClick={() => setShowPass(p => !p)}
          type="button"
        >
          {showPass ? "🙈" : "👁️"}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <button
        style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }}
        onClick={() => loginWithPassword(email, password)}
        disabled={loading || !email || !password}
      >
        {loading ? "Signing in..." : "Continue →"}
      </button>

      <p style={styles.hint}>
        After sign-in, you'll be asked for your authenticator code.
      </p>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  center: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", minHeight: "100vh", gap: 12,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  card: {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: 16,
    padding: "40px 36px",
    maxWidth: 420,
    width: "100%",
    margin: "auto",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  },
  title: {
    fontSize: 26, fontWeight: 700, color: "#ffffff", margin: "0 0 8px",
  },
  sub: {
    fontSize: 14, color: "rgba(255, 255, 255, 0.9)", margin: "0 0 24px", lineHeight: 1.5,
  },
  label: {
    display: "block", fontSize: 13, fontWeight: 500,
    color: "rgba(255, 255, 255, 0.95)", marginBottom: 6, marginTop: 16,
  },
  input: {
    width: "100%", boxSizing: "border-box",
    border: "1.5px solid rgba(255, 255, 255, 0.3)", borderRadius: 10,
    padding: "11px 14px", fontSize: 15, outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
    background: "rgba(255, 255, 255, 0.1)",
    color: "#ffffff",
  },
  btn: {
    width: "100%", marginTop: 24,
    background: "#e91e8c", color: "white",
    border: "none", borderRadius: 10, padding: "13px 0",
    fontSize: 15, fontWeight: 600, cursor: "pointer",
    transition: "opacity 0.2s",
  },
  error: {
    color: "#ff6b6b", fontSize: 13, marginTop: 10,
    background: "rgba(255, 107, 107, 0.2)", padding: "8px 12px", borderRadius: 8,
  },
  hint: {
    fontSize: 12, color: "rgba(255, 255, 255, 0.8)", textAlign: "center", marginTop: 16,
  },
  iconWrap: {
    fontSize: 40, textAlign: "center", marginBottom: 12,
  },
  qrWrap: {
    display: "flex", justifyContent: "center",
    margin: "16px 0", background: "white",
    border: "1px solid #eee", borderRadius: 8, padding: 12,
  },
  secretBox: {
    background: "rgba(255, 255, 255, 0.1)", borderRadius: 8, padding: "10px 14px", margin: "12px 0",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  secretLabel: { fontSize: 12, color: "rgba(255, 255, 255, 0.8)", margin: "0 0 6px" },
  secret: {
    fontSize: 13, letterSpacing: "0.1em", color: "#ffffff",
    wordBreak: "break-all", display: "block",
  },
  eyeBtn: {
    position: "absolute", right: 10, top: "50%",
    transform: "translateY(-50%)", background: "none",
    border: "none", cursor: "pointer", fontSize: 16, padding: 4,
  },
  spinner: {
    width: 32, height: 32, border: "3px solid #eee",
    borderTop: "3px solid #e91e8c", borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};
