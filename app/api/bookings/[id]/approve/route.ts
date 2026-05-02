import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Resend } from 'resend';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateBooking, type InsurancePlan } from '@/lib/constants';
import { daysBetween } from '@/lib/utils';
import { bookingApprovedEmail, type BookingEmailData } from '@/lib/email';

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://waygo.ge';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id as string;

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      car: {
        select: {
          ownerId: true,
          brand: true, model: true, year: true,
          carType: true, transmission: true, fuelType: true,
          seats: true, location: true, color: true, imageUrls: true,
          dailyPrice: true,
        },
      },
      guest: { select: { email: true, fullName: true, lang: true } },
      insurancePolicy: { select: { planType: true, deductibleAmount: true } },
    },
  });

  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (booking.car?.ownerId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (booking.status !== 'awaiting_host') {
    return NextResponse.json({ error: 'Booking is not awaiting host approval' }, { status: 400 });
  }

  await prisma.booking.update({
    where: { id: params.id },
    data: { status: 'pending', hostApprovalDeadline: null },
  });

  // Send confirmation email to guest — fire and forget
  const { guest, car, insurancePolicy } = booking;
  if (guest?.email && car && insurancePolicy) {
    const validLangs = ['en', 'ka', 'ru'];
    const lang = validLangs.includes(guest.lang) ? (guest.lang as 'en' | 'ka' | 'ru') : 'en';
    const startStr = booking.startDate.toISOString().split('T')[0];
    const endStr = booking.endDate.toISOString().split('T')[0];
    const days = daysBetween(startStr, endStr);
    const totals = calculateBooking(car.dailyPrice, days, insurancePolicy.planType as InsurancePlan);

    const emailData: BookingEmailData = {
      guestName: guest.fullName,
      lang,
      booking: {
        id: booking.id,
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: 'pending',
        deliveryType: booking.deliveryType,
        deliveryCost: booking.deliveryCost,
        deliveryAddress: booking.deliveryAddress,
      },
      car: {
        brand: car.brand,
        model: car.model,
        year: car.year,
        type: car.carType,
        transmission: car.transmission,
        fuelType: car.fuelType,
        seats: car.seats,
        location: car.location,
        color: car.color,
        images: car.imageUrls,
      },
      totals,
      days,
      insurancePlan: insurancePolicy.planType as 'basic' | 'standard' | 'premium',
      grandTotal: booking.totalPrice,
      siteUrl: SITE_URL,
    };

    const { html, subject } = bookingApprovedEmail(emailData);
    resend.emails.send({
      from: 'Drivo.ge <no-reply@waygo.ge>',
      to: guest.email,
      subject,
      html,
    }).catch(console.error);
  }

  return NextResponse.json({ ok: true });
}
