import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profileId = (session.user as any).id;

  const notifications = await prisma.notification.findMany({
    where: { userId: profileId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { id: true, type: true, bookingId: true, message: true, isRead: true, createdAt: true },
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return NextResponse.json({ notifications, unreadCount });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profileId = (session.user as any).id;
  const { ids } = await req.json();

  if (!Array.isArray(ids)) return NextResponse.json({ error: 'ids array required' }, { status: 400 });

  await prisma.notification.updateMany({
    where: { userId: profileId, id: { in: ids } },
    data: { isRead: true },
  });

  return NextResponse.json({ ok: true });
}
