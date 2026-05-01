import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { phase, photoUrls } = await req.json();

  if (!['pickup', 'return'].includes(phase)) {
    return NextResponse.json({ error: 'Invalid phase' }, { status: 400 });
  }

  if (!Array.isArray(photoUrls) || photoUrls.length !== 7) {
    return NextResponse.json({ error: '7 photos required' }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    select: { id: true, guestId: true, status: true, endDate: true },
  });

  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const profileId = (session.user as any).id;
  if (booking.guestId !== profileId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (phase === 'pickup' && booking.status !== 'pending') {
    return NextResponse.json({ error: 'Booking not pending' }, { status: 400 });
  }

  if (phase === 'return') {
    if (booking.status !== 'confirmed') {
      return NextResponse.json({ error: 'Booking not confirmed' }, { status: 400 });
    }
    if (new Date() < booking.endDate) {
      return NextResponse.json({ error: 'Return date not reached' }, { status: 400 });
    }
  }

  const existing = await prisma.conditionReport.findFirst({
    where: { bookingId: params.id, phase },
  });
  if (existing) {
    return NextResponse.json({ error: 'Report already submitted' }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.conditionReport.create({
      data: { bookingId: params.id, phase, photoUrls },
    }),
    prisma.booking.update({
      where: { id: params.id },
      data: { status: phase === 'pickup' ? 'confirmed' : 'completed' },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
