import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
  role: z.enum(['guest', 'host']),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id as string;
  const review = await prisma.review.findFirst({
    where: { bookingId: params.id, reviewerId: userId },
  });

  return NextResponse.json({ review: review ?? null });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id as string;
  const input = schema.parse(await req.json());

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { car: { select: { ownerId: true } } },
  });

  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (booking.status !== 'completed') {
    return NextResponse.json({ error: 'Booking not completed' }, { status: 400 });
  }

  const isGuest = booking.guestId === userId;
  const isHost = booking.car?.ownerId === userId;

  if (!isGuest && !isHost) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (input.role === 'guest' && !isGuest) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (input.role === 'host' && !isHost) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const revieweeId = input.role === 'guest' ? (booking.car?.ownerId ?? '') : booking.guestId;
  if (!revieweeId) return NextResponse.json({ error: 'Invalid reviewee' }, { status: 400 });

  const existing = await prisma.review.findFirst({
    where: { bookingId: params.id, reviewerId: userId },
  });
  if (existing) return NextResponse.json({ error: 'Already reviewed' }, { status: 409 });

  await prisma.review.create({
    data: { bookingId: params.id, reviewerId: userId, revieweeId, role: input.role, rating: input.rating, comment: input.comment },
  });

  const allReviews = await prisma.review.findMany({
    where: { revieweeId },
    select: { rating: true },
  });
  const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
  await prisma.profile.update({
    where: { id: revieweeId },
    data: { rating: parseFloat(avg.toFixed(2)), reviewCount: allReviews.length },
  });

  return NextResponse.json({ ok: true });
}
