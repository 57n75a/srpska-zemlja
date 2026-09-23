import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/units?regionId=0&blockIndex=4
// Returns the 100 units for a given block, or the region's block-level
// summary if blockIndex is omitted.
export async function GET(req: NextRequest) {
  const regionId = req.nextUrl.searchParams.get('regionId');
  const blockIndex = req.nextUrl.searchParams.get('blockIndex');

  if (regionId === null) {
    return NextResponse.json({ error: 'regionId is required' }, { status: 400 });
  }

  if (blockIndex !== null) {
    const units = await prisma.unit.findMany({
      where: { regionId: Number(regionId), blockIndex: Number(blockIndex) },
      orderBy: { unitIndex: 'asc' },
    });
    return NextResponse.json({ units });
  }

  // Block-level summary: count available/reserved per block in this region.
  const units = await prisma.unit.groupBy({
    by: ['blockIndex', 'status'],
    where: { regionId: Number(regionId) },
    _count: true,
  });
  return NextResponse.json({ blocks: units });
}
