import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Returns available dates and booked dates for a car
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const rows = await prisma.carAvailability.findMany({
    where: { carId: params.id },
    select: { date: true, bookingId: true },
    orderBy: { date: 'asc' },
  });

  const available: string[] = [];
  const booked: string[] = [];

  for (const row of rows) {
    const d = row.date.toISOString().split('T')[0];
    if (row.bookingId) booked.push(d);
    else available.push(d);
  }

  return NextResponse.json({ available, booked });
}

// Host updates available dates for their car
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id as string;
  const car = await prisma.car.findUnique({ where: { id: params.id }, select: { ownerId: true } });
  if (!car) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (car.ownerId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { add, remove } = await req.json() as { add: string[]; remove: string[] };

  // Get booked dates so we never remove them
  const bookedRows = await prisma.carAvailability.findMany({
    where: { carId: params.id, bookingId: { not: null } },
    select: { date: true },
  });
  const bookedSet = new Set(bookedRows.map(r => r.date.toISOString().split('T')[0]));

  const safeRemove = (remove ?? []).filter(d => !bookedSet.has(d));

  await prisma.$transaction([
    // Add new dates (upsert to avoid duplicates)
    ...(add ?? []).map(d =>
      prisma.carAvailability.upsert({
        where: { carId_date: { carId: params.id, date: new Date(d) } },
        update: {},
        create: { carId: params.id, date: new Date(d) },
      })
    ),
    // Remove non-booked dates
    prisma.carAvailability.deleteMany({
      where: {
        carId: params.id,
        bookingId: null,
        date: { in: safeRemove.map(d => new Date(d)) },
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
