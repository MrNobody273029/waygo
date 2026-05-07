import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AdminAccountingContent } from './AdminAccountingContent';

export default async function AdminAccountingPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/');

  const now = new Date();
  const monthStr =
    searchParams.month ??
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [yr, mo] = monthStr.split('-').map(Number);

  const monthStart = new Date(yr, mo - 1, 1);
  const monthEnd = new Date(yr, mo, 1);

  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: ['completed', 'disputed'] },
      startDate: { gte: monthStart, lt: monthEnd },
    },
    select: {
      id: true,
      carBrand: true,
      carModel: true,
      carYear: true,
      startDate: true,
      endDate: true,
      totalPrice: true,
      platformFeeGel: true,
      guest: { select: { fullName: true } },
      insurancePolicy: { select: { planType: true } },
    },
    orderBy: { startDate: 'asc' },
  });

  const data = bookings.map(b => ({
    id: b.id,
    car: `${b.carBrand} ${b.carModel} ${b.carYear}`,
    guest: b.guest.fullName,
    startDate: b.startDate.toISOString(),
    endDate: b.endDate.toISOString(),
    totalPrice: b.totalPrice,
    platformFeeGel: b.platformFeeGel,
    insurancePlan: (b.insurancePolicy?.planType ?? null) as string | null,
  }));

  return <AdminAccountingContent data={data} month={monthStr} />;
}
