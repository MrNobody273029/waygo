import { prisma } from '@/lib/db';
import { AdminUsersContent } from './AdminUsersContent';

export const metadata = { title: 'Admin — Users' };

export default async function AdminUsers() {
  const users = await prisma.profile.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      country: true,
      role: true,
      isVerified: true,
      rating: true,
      createdAt: true,
      _count: { select: { bookings: true, cars: true } },
    },
  });

  return <AdminUsersContent users={users} />;
}
