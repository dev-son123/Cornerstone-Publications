/// <reference types="react" />
/** @jsxRuntime classic */
/** @jsx React.createElement */
// src/components/admin/AdminLogin.tsx
// Magic Link login — enter email → get link in email → click → logged in

import React, { useState } from "react";
import { useAdminAuth } from "../../hooks/useAdminAuth";

interface Props {
  onAuthenticated: () => void;
}

const adminLoginCSS = `
.admin-login-page {
  min-height: 100vh;
  background: radial-gradient(ellipse at top left, #f9a8d4 0%, #fce7f3 30%, #fff 60%, #fce7f3 80%, #f9a8d4 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: system-ui, sans-serif;
  padding: 20px;
  gap: 20px;
}
.admin-login-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #fce7f3;
  border-top-color: #e91e8c;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.admin-login-card {
  background: #fff;
  border-radius: 20px;
  padding: 36px 32px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 4px 24px rgba(233, 30, 140, 0.08);
  border: 1.5px solid #fce7f3;
}
.admin-login-badge {
  background: #fff;
  border-radius: 16px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  max-width: 420px;
  width: 100%;
}
.admin-login-badge img {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
}
.admin-login-badge-title {
  margin: 0;
  font-weight: 700;
  font-size: 15px;
  color: #1a1a2e;
}
.admin-login-badge-sub {
  margin: 0;
  font-size: 12px;
  color: #e91e8c;
}
.admin-login-heading {
  font-size: 38px;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 8px;
  letter-spacing: -1px;
}
.admin-login-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 12px;
  text-align: center;
}
.admin-login-sub {
  color: #888;
  font-size: 14px;
  margin: 0 0 8px;
  line-height: 1.6;
}
.admin-login-note {
  color: #aaa;
  font-size: 13px;
  margin: 0 0 28px;
  line-height: 1.6;
}
.admin-login-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}
.admin-login-divider-line {
  flex: 1;
  height: 1px;
  background: #eee;
}
.admin-login-divider-text {
  font-size: 11px;
  color: #ccc;
  white-space: nowrap;
}
.admin-login-input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f9fafb;
  border-radius: 50px;
  border: 1.5px solid #f0f0f0;
  padding: 0 18px;
  margin-bottom: 14px;
}
.admin-login-input-icon {
  font-size: 16px;
}
.admin-login-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 14px 8px;
  font-size: 14px;
  outline: none;
  font-family: inherit;
  color: #333;
}
.admin-login-btn {
  width: 100%;
  padding: 13px 0;
  background: #e91e8c;
  color: #fff;
  border: none;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-bottom: 16px;
}
.admin-login-btn.btn-outline {
  background: transparent;
  color: #e91e8c;
  border: 1.5px solid #e91e8c;
  margin-top: 16px;
}
.admin-login-btn.btn-disabled {
  opacity: 0.6;
  pointer-events: none;
}
.admin-login-error {
  color: #c62828;
  background: #ffebee;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 13px;
  margin-bottom: 14px;
  text-align: center;
}
.admin-login-hint {
  font-size: 12px;
  color: #aaa;
  text-align: center;
  line-height: 1.6;
  margin: 0;
}
.admin-login-info-box {
  background: #f9fafb;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 12px 16px;
  margin-top: 16px;
}
.admin-login-info-text {
  margin: 0;
  font-size: 13px;
  color: #888;
}
.admin-login-highlight {
  color: #e91e8c;
}
.admin-login-icon {
  font-size: 56px;
  text-align: center;
  margin-bottom: 16px;
}
.admin-login-back-btn {
  background: none;
  border: none;
  color: #aaa;
  font-size: 13px;
  cursor: pointer;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
`;

export function AdminLogin({ onAuthenticated }: Props) {
  const { step, loading, error, sendMagicLink } = useAdminAuth();
  const [email, setEmail] = useState("info.cornerstoneresearch@gmail.com");

  React.useEffect(() => {
    if (step === "dashboard") onAuthenticated();
  }, [step, onAuthenticated]);

  const sendBtnClass = loading || !email ? "admin-login-btn btn-disabled" : "admin-login-btn";
  const resendBtnClass = loading ? "admin-login-btn btn-outline btn-disabled" : "admin-login-btn btn-outline";

  // ── Loading ───────────────────────────────────────────────
  if (loading && step === "idle") {
    return (
      <div className="admin-login-page">
        <style>{adminLoginCSS}</style>
        <div className="admin-login-spinner" />
      </div>
    );
  }

  // ── Email sent confirmation ───────────────────────────────
  if (step === "sent") {
    return (
      <div className="admin-login-page">
        <style>{adminLoginCSS}</style>
        <div className="admin-login-card">
          <div className="admin-login-icon">📬</div>
          <h2 className="admin-login-title">Check your email</h2>
          <p className="admin-login-sub">
            We sent a login link to <strong className="admin-login-highlight">info.cornerstoneresearch@gmail.com</strong>
          </p>
          <p className="admin-login-sub">
            Click the link in the email to access the admin dashboard.
            The link expires in 1 hour.
          </p>
          <div className="admin-login-info-box">
            <p className="admin-login-info-text">
              💡 Check your spam folder if you don't see it within 2 minutes.
            </p>
          </div>
          <button
            className={resendBtnClass}
            onClick={() => sendMagicLink(email)}
            disabled={loading}
          >
            {loading ? "Sending..." : "Resend link"}
          </button>
        </div>
      </div>
    );
  }

  // ── Email input ───────────────────────────────────────────
  return (
    <div className="admin-login-page">
      <style>{adminLoginCSS}</style>

      {/* Brand badge */}
      <div className="admin-login-badge">
        <img
          src="/logo.jpeg"
          alt="Cornerstone"
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div>
          <p className="admin-login-badge-title">
            Cornerstone Admin Portal
          </p>
          <p className="admin-login-badge-sub">
            🔒 Secure Admin Access
          </p>
        </div>
      </div>

      <div className="admin-login-card">
        <h1 className="admin-login-heading">Welcome Back</h1>
        <p className="admin-login-sub">Sign in to Cornerstone Admin Portal</p>
        <p className="admin-login-note">
          We'll send a secure login link to your email
        </p>

        {/* Divider */}
        <div className="admin-login-divider">
          <div className="admin-login-divider-line" />
          <span className="admin-login-divider-text">CONTINUE BELOW</span>
          <div className="admin-login-divider-line" />
        </div>

        {/* Email input */}
        <div className="admin-login-input-wrap">
          <span className="admin-login-input-icon">✉️</span>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMagicLink(email)}
            className="admin-login-input"
            autoFocus
          />
        </div>

        {/* Error */}
        {error && (
          <p className="admin-login-error">{error}</p>
        )}

        {/* Submit */}
        <button
          className={sendBtnClass}
          onClick={() => sendMagicLink(email)}
          disabled={loading || !email}
        >
          {loading ? "Sending link..." : "Send Magic Link →"}
        </button>

        <p className="admin-login-hint">
          A secure one-click login link will be sent to your email.<br />
          No password needed.
        </p>
      </div>

      {/* Back to site */}
      <button
        onClick={() => window.location.href = "/"}
        className="admin-login-back-btn"
      >
        ← Return to Website
      </button>
    </div>
  );
}
