import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { dbCarToUiCar } from '@/lib/sample-data';
import { Resend } from 'resend';
import { adminNotificationLayout } from '@/lib/email';

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://waygo.ge';
const ADMIN_EMAIL = 'admin@waygo.ge';

export async function GET() {
  const dbCars = await prisma.car.findMany({
    where: { isActive: true, listingStatus: 'APPROVED' },
    include: { owner: { select: { fullName: true, isVerified: true, rating: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(dbCars.map(dbCarToUiCar));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id as string;
  const hostVerified = (session.user as any).hostVerified as boolean;

  if (!hostVerified) {
    return NextResponse.json({ error: 'Host verification required before listing a car' }, { status: 403 });
  }

  const body = await req.json();

  const [car, owner] = await Promise.all([
    prisma.car.create({
      data: {
        ownerId: userId,
        brand: body.brand,
        model: body.model,
        year: parseInt(body.year, 10),
        plateNumber: body.plateNumber,
        dailyPrice: parseInt(body.dailyPrice, 10),
        location: body.location,
        carType: body.carType ?? 'Economy',
        transmission: body.transmission ?? 'Automatic',
        features: body.features ?? [],
        imageUrls: body.imageUrls ?? [],
        description: body.description ?? null,
        techPassportFront: body.techPassportFront ?? null,
        techPassportBack: body.techPassportBack ?? null,
        color: body.color ?? '',
        seats: parseInt(body.seats ?? '5', 10),
        doors: parseInt(body.doors ?? '4', 10),
        fuelType: body.fuelType ?? 'Petrol',
        airportTbilisiState: body.airportTbilisiState ?? 'none',
        airportTbilisiPrice: parseInt(body.airportTbilisiPrice ?? '0', 10),
        airportKutaisiState: body.airportKutaisiState ?? 'none',
        airportKutaisiPrice: parseInt(body.airportKutaisiPrice ?? '0', 10),
        airportBatumiState: body.airportBatumiState ?? 'none',
        airportBatumiPrice: parseInt(body.airportBatumiPrice ?? '0', 10),
        cityDeliveryEnabled: body.cityDeliveryEnabled ?? false,
        cityDeliveryCity: body.cityDeliveryCity ?? '',
        cityDeliveryPrice: parseInt(body.cityDeliveryPrice ?? '0', 10),
        returnPolicy: body.returnPolicy ?? 'same',
        minDays: parseInt(body.minDays ?? '1', 10),
        advanceNotice: parseInt(body.advanceNotice ?? '2', 10),
        listingStatus: 'PENDING',
      },
    }),
    prisma.profile.findUnique({
      where: { id: userId },
      select: { fullName: true, email: true },
    }),
  ]);

  await prisma.profile.update({
    where: { id: userId },
    data: { role: 'HOST' },
  });

  if (owner) {
    const carLabel = `${body.brand} ${body.model} ${body.year}`;
    const adminUrl = `${SITE_URL}/admin/verifications`;
    const html = adminNotificationLayout(
      `<p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;">&#128663; ახალი მანქანის განცხადება</p>
      <p style="margin:0 0 24px;font-size:22px;font-weight:800;color:#0f172a;">პასუხი გეკუთვნის</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin:0 0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:1px;padding-bottom:6px;">ჰოსტი</td></tr>
          <tr><td style="font-size:17px;font-weight:700;color:#0f172a;padding-bottom:4px;">${owner.fullName}</td></tr>
          <tr><td style="font-size:13px;color:#64748b;">${owner.email ?? ''}</td></tr>
        </table>
      </div>
      <div style="background:#eff6ff;border-left:4px solid #1a56db;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#1a56db;text-transform:uppercase;letter-spacing:1px;">მანქანა</p>
        <p style="margin:0;font-size:16px;font-weight:700;color:#0f172a;">${carLabel}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#64748b;">სახ.ნიშანი: ${body.plateNumber} · ${body.location}</p>
      </div>
      <p style="margin:0;color:#64748b;font-size:14px;line-height:1.7;">ჰოსტმა ატვირთა მანქანის განცხადება. გადადი ადმინ პანელში, გაეცანი ფოტოებს და ტექ.პასპორტს, შემდეგ დაადასტურე ან უარყავი.</p>`,
      adminUrl,
      'ადმინ პანელში გადასვლა →'
    );

    try {
      await resend.emails.send({
        from: 'WAYGO <info@waygo.ge>',
        to: ADMIN_EMAIL,
        subject: `ახალი მანქანა: ${carLabel} — ${owner.fullName}`,
        html,
      });
    } catch (err) {
      console.error('Admin car listing notification email error:', err);
    }
  }

  return NextResponse.json({ carId: car.id });
}
