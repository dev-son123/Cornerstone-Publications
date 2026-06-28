// src/pages/NotFound.tsx
// 404 page — add this route in App.tsx:
// <Route path="*" element={<NotFound />} />

import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #fce7f3 0%, #fff 60%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      padding: '20px', textAlign: 'center',
    }}>
      {/* Big 404 */}
      <div style={{
        fontSize: 120, fontWeight: 900, lineHeight: 1,
        background: 'linear-gradient(135deg, #d63384, #b5165a)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        marginBottom: 16,
      }}>
        404
      </div>

      {/* Message */}
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e', margin: '0 0 12px' }}>
        Page Not Found
      </h1>
      <p style={{ fontSize: 16, color: '#888', maxWidth: 400, lineHeight: 1.6, margin: '0 0 32px' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '12px 28px', background: '#d63384', color: '#fff',
            border: 'none', borderRadius: 50, fontSize: 15, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Go to Homepage
        </button>
        <button
          onClick={() => navigate('/journal')}
          style={{
            padding: '12px 28px', background: '#fff', color: '#d63384',
            border: '2px solid #d63384', borderRadius: 50, fontSize: 15, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Visit Journal
        </button>
        <button
          onClick={() => navigate('/contact')}
          style={{
            padding: '12px 28px', background: '#f9fafb', color: '#555',
            border: '1.5px solid #eee', borderRadius: 50, fontSize: 15, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Contact Us
        </button>
      </div>

      {/* Logo */}
      <img
        src="/logo.jpeg"
        alt="Cornerstone"
        style={{ width: 60, height: 60, borderRadius: '50%', marginTop: 48, objectFit: 'cover', opacity: 0.5 }}
      />
    </div>
  );
}
