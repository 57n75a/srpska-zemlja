import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/members?email=someone@example.com
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'email is required' }, { status: 400 });

  const member = await prisma.member.findUnique({
    where: { email },
    include: {
      units: { select: { id: true, regionId: true, blockIndex: true, status: true } },
      reservations: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!member) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ member });
}

// POST /api/members
// Body: { email: string, displayName?: string }
// Real auth (magic-link/OAuth) should call this on first sign-in.
export async function POST(req: NextRequest) {
  const { email, displayName } = await req.json();
  if (!email) return NextResponse.json({ error: 'email is required' }, { status: 400 });

  const member = await prisma.member.upsert({
    where: { email },
    update: {},
    create: { email, displayName },
  });

  return NextResponse.json({ member }, { status: 201 });
}
