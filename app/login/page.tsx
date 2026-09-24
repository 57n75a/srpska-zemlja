'use client';

import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <main style={{ maxWidth: 380, margin: '80px auto', padding: 24, fontFamily: 'Georgia, serif', textAlign: 'center' }}>
      <img src="/logo.png" alt="Srpska Zemlja" style={{ width: 64, height: 64, borderRadius: '50%', marginBottom: 16 }} />
      <h1 style={{ fontSize: '1.4rem' }}>Sign in</h1>
      <p style={{ color: '#4A3F30', fontSize: '0.92rem', marginBottom: 28 }}>
        Sign in to reserve ground and manage your account.
      </p>

      <button onClick={() => signIn('google')} style={btnStyle}>Continue with Google</button>
      <button onClick={() => signIn('facebook')} style={btnStyle}>Continue with Meta</button>
      <button onClick={() => signIn('apple')} style={btnStyle}>Continue with Apple</button>

      <p style={{ fontSize: '0.78rem', color: '#4A3F30', marginTop: 24 }}>
        By continuing, you agree this reservation is a platform record, not a
        land title, until real coordinates are legally transferred.
      </p>
    </main>
  );
}

const btnStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '12px', marginBottom: 10,
  border: '1px solid #C9BBA0', background: '#fff', fontFamily: 'Georgia, serif',
  fontSize: '0.95rem', cursor: 'pointer',
};
