import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { EditCarContent } from './EditCarContent';

export default async function EditCarPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = (session.user as any).id as string;
  const car = await prisma.car.findUnique({ where: { id: params.id } });

  if (!car) notFound();
  if (car.ownerId !== userId) redirect('/my-cars');

  return <EditCarContent car={car} />;
}
