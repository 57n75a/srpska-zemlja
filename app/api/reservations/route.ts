import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateTotal, getTier, VOJVODA_THRESHOLD_M2, TermId } from '@/lib/pricing';

// POST /api/reservations
// Body: { memberId: string, unitIds: number[], term: TermId }
//
// This creates a PENDING reservation and marks units HELD.
// Wiring to real payment (Stripe) happens in a follow-up webhook that
// flips status PENDING -> ACTIVE and units HELD -> RESERVED once
// payment clears. Left as a TODO here since it depends on your
// payment provider choice from the spec.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { memberId, unitIds, term } = body as {
    memberId: string;
    unitIds: number[];
    term: TermId;
  };

  if (!memberId || !Array.isArray(unitIds) || unitIds.length === 0 || !term) {
    return NextResponse.json({ error: 'memberId, unitIds[], and term are required' }, { status: 400 });
  }

  const tier = getTier(term); // throws on invalid term
  const totalPaid = calculateTotal(unitIds.length, term);

  const result = await prisma.$transaction(async (tx) => {
    // Lock check: make sure every requested unit is still available.
    const existing = await tx.unit.findMany({
      where: { id: { in: unitIds } },
      select: { id: true, status: true },
    });

    const unavailable = existing.filter((u) => u.status !== 'AVAILABLE');
    if (unavailable.length > 0) {
      throw new Error(`UNITS_UNAVAILABLE:${unavailable.map((u) => u.id).join(',')}`);
    }

    const reservation = await tx.reservation.create({
      data: {
        memberId,
        unitCount: unitIds.length,
        term: term as any,
        pricePerM2: tier.yearlyRatePerM2,
        totalPaid,
        status: 'PENDING',
      },
    });

    await tx.unit.updateMany({
      where: { id: { in: unitIds } },
      data: { status: 'HELD', ownerId: memberId },
    });

    // Promote to vojvoda if this pushes the member over the threshold.
    const memberUnitCount = await tx.unit.count({ where: { ownerId: memberId } });
    if (memberUnitCount >= VOJVODA_THRESHOLD_M2) {
      await tx.member.update({ where: { id: memberId }, data: { isVojvoda: true } });
    }

    return reservation;
  });

  return NextResponse.json({ reservation: result }, { status: 201 });
}
