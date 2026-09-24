'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 22px', borderBottom: '1px solid #C9BBA0',
      fontFamily: 'Georgia, serif',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: '#241C14' }}>
        <img src="/logo.png" alt="Srpska Zemlja" style={{ width: 36, height: 36, borderRadius: '50%' }} />
        <strong>Srpska Zemlja</strong>
      </Link>
      <nav style={{ display: 'flex', gap: 18, alignItems: 'center', fontSize: '0.92rem' }}>
        <Link href="/reserve">Reserve</Link>
        {session ? (
          <>
            <Link href="/account">Account</Link>
            <Link href="/dashboard">My ground</Link>
            <button onClick={() => signOut()} style={{ background: 'none', border: '1px solid #C9BBA0', padding: '6px 12px', cursor: 'pointer' }}>
              Sign out
            </button>
          </>
        ) : (
          <Link href="/login">Sign in</Link>
        )}
      </nav>
    </header>
  );
}
