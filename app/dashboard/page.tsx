import { prisma } from '@/lib/prisma';
import { PRICING_TIERS } from '@/lib/pricing';
export const dynamic = 'force-dynamic';

// Server component — fetches directly via Prisma (no client-side API
// round-trip needed since this renders on the server).
//
// TODO: replace this hardcoded email with the authenticated user's
// email once auth (magic-link/OAuth, per the spec) is wired in.
const DEMO_EMAIL = 'demo@srpskazemlja.org';

export default async function DashboardPage() {
  const member = await prisma.member.findUnique({
    where: { email: DEMO_EMAIL },
    include: {
      units: { include: { region: true } },
      reservations: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!member) {
    return (
      <main style={{ padding: 40, fontFamily: 'serif' }}>
        <p>No member found for {DEMO_EMAIL}. Run the seed script and create a
        member via POST /api/members, or replace DEMO_EMAIL with a real
        session once auth is wired in.</p>
      </main>
    );
  }

  const totalM2 = member.units.length;
  const byRegion = member.units.reduce<Record<string, number>>((acc, u) => {
    const label = u.region.label;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '30px 28px', fontFamily: 'Georgia, serif' }}>
      <h1>Your ground</h1>
      <p>{member.displayName || member.email} {member.isVojvoda && <strong>· Vojvoda</strong>}</p>

      <section>
        <h2>{totalM2.toLocaleString()} m² total reserved</h2>
        <ul>
          {Object.entries(byRegion).map(([region, count]) => (
            <li key={region}>Region {region} — {count} m²</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Payment history</h2>
        <table cellPadding={8} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th align="left">Date</th><th align="left">Term</th><th align="left">Units</th><th align="right">Total</th><th align="left">Status</th></tr>
          </thead>
          <tbody>
            {member.reservations.map((r) => (
              <tr key={r.id}>
                <td>{r.createdAt.toDateString()}</td>
                <td>{PRICING_TIERS.find((t) => t.id === r.term)?.label ?? r.term}</td>
                <td>{r.unitCount} m²</td>
                <td align="right">${Number(r.totalPaid).toLocaleString()}</td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
