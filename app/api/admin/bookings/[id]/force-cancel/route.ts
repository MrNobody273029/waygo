import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateCancellation } from '@/lib/constants';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const booking = await prisma.booking.findUnique({ where: { id: params.id } });
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (['cancelled', 'completed', 'rejected'].includes(booking.status)) {
    return NextResponse.json({ error: 'Already in terminal state' }, { status: 400 });
  }

  const calc = calculateCancellation({
    startDate: booking.startDate,
    createdAt: booking.createdAt,
    status: booking.status,
    totalPrice: booking.totalPrice,
    platformFeeGel: booking.platformFeeGel,
  });

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: params.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationOtpCode: null,
        cancellationOtpExpiry: null,
      },
    });

    if (calc.totalRefund > 0) {
      await tx.transaction.create({
        data: {
          bookingId: params.id,
          providerId: `admin_refund_${params.id}`,
          amount: calc.totalRefund,
          type: 'refund',
          status: 'succeeded',
        },
      });
    }

    await tx.carAvailability.updateMany({
      where: { bookingId: params.id },
      data: { bookingId: null },
    });
  });

  return NextResponse.json({ ok: true, calc });
}
