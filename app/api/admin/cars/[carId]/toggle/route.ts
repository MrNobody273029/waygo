import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { carId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const car = await prisma.car.findUnique({ where: { id: params.carId }, select: { id: true, isActive: true } });
  if (!car) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.car.update({
    where: { id: params.carId },
    data: { isActive: !car.isActive },
    select: { id: true, isActive: true },
  });

  return NextResponse.json({ ok: true, isActive: updated.isActive });
}
