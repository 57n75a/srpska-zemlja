'use client';

import { useState } from 'react';
import { PRICING_TIERS, TermId, calculateTotal } from '@/lib/pricing';

// Minimal wiring example: pick a region/block via the API, select unit ids,
// then POST /api/reservations. The full zoomable grid UI from the demo
// artifact can be dropped in here — this keeps just the data flow that
// matters: fetching real availability and submitting a real reservation.
export default function ReservePage() {
  const [regionId, setRegionId] = useState(0);
  const [blockIndex, setBlockIndex] = useState(0);
  const [units, setUnits] = useState<{ id: number; unitIndex: number; status: string }[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [term, setTerm] = useState<TermId>('YEAR_1');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function loadBlock() {
    const res = await fetch(`/api/units?regionId=${regionId}&blockIndex=${blockIndex}`);
    const data = await res.json();
    setUnits(data.units || []);
    setSelected([]);
  }

  function toggle(id: number, isAvailable: boolean) {
    if (!isAvailable) return;
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function reserve() {
    setStatus('Creating member...');
    const memberRes = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const { member } = await memberRes.json();

    setStatus('Submitting reservation...');
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: member.id, unitIds: selected, term }),
    });

    if (res.ok) {
      setStatus('Reserved. (Payment integration is a follow-up step — see spec §5/§6.)');
      loadBlock();
    } else {
      const err = await res.json();
      setStatus('Error: ' + JSON.stringify(err));
    }
  }

  const total = calculateTotal(selected.length, term);

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 28, fontFamily: 'Georgia, serif' }}>
      <h1>Reserve your ground</h1>

      <label>Region ID (0–99): <input type="number" value={regionId} min={0} max={99} onChange={(e) => setRegionId(Number(e.target.value))} /></label>
      <label style={{ marginLeft: 12 }}>Block (0–99): <input type="number" value={blockIndex} min={0} max={99} onChange={(e) => setBlockIndex(Number(e.target.value))} /></label>
      <button onClick={loadBlock} style={{ marginLeft: 12 }}>Load block</button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 32px)', gap: 2, margin: '20px 0' }}>
        {units.map((u) => (
          <div
            key={u.id}
            onClick={() => toggle(u.id, u.status === 'AVAILABLE')}
            style={{
              width: 32, height: 32, border: '1px solid #999',
              background: selected.includes(u.id) ? '#7A1F1F' : u.status === 'AVAILABLE' ? '#fff' : '#ccc',
              cursor: u.status === 'AVAILABLE' ? 'pointer' : 'not-allowed',
            }}
            title={`Unit ${u.unitIndex} — ${u.status}`}
          />
        ))}
      </div>

      <label>Term:
        <select value={term} onChange={(e) => setTerm(e.target.value as TermId)}>
          {PRICING_TIERS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </label>

      <p>{selected.length} m² selected — ${total.toLocaleString()} total</p>

      <label>Email: <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <button onClick={reserve} disabled={selected.length === 0 || !email} style={{ marginLeft: 12 }}>
        Reserve
      </button>

      {status && <p>{status}</p>}
    </main>
  );
}
