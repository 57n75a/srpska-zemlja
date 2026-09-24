'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [displayName, setDisplayName] = useState(session?.user?.name || '');
  const [saved, setSaved] = useState(false);

  if (status === 'loading') return <main style={{ padding: 40 }}>Loading...</main>;
  if (!session) return <main style={{ padding: 40, fontFamily: 'Georgia, serif' }}>
    <p>You need to <a href="/login">sign in</a> to view your account.</p>
  </main>;

  async function save() {
    await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: session!.user!.email, displayName }),
    });
    setSaved(true);
  }

  return (
    <main style={{ maxWidth: 480, margin: '40px auto', padding: 24, fontFamily: 'Georgia, serif' }}>
      <h1>Account</h1>
      <p>Signed in as {session.user?.email}</p>
      {(session.user as any)?.isVojvoda && <p><strong>Vojvoda member</strong></p>}

      <label style={{ display: 'block', marginTop: 20 }}>
        Display name
        <input
          value={displayName}
          onChange={(e) => { setDisplayName(e.target.value); setSaved(false); }}
          style={{ display: 'block', width: '100%', padding: 8, marginTop: 6 }}
        />
      </label>
      <button onClick={save} style={{ marginTop: 14, padding: '10px 18px' }}>Save</button>
      {saved && <p style={{ color: '#4C6B4F' }}>Saved.</p>}
    </main>
  );
}
