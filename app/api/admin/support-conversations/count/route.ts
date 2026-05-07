import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const conversations = await prisma.supportConversation.findMany({
    where: {
      status: 'escalated',
      escalated: true,
    },
    select: {
      id: true,
      userId: true,
      guestEmail: true,
      guestName: true,
    },
  });

  const uniqueUsers = new Set(
    conversations.map(c =>
      c.userId ||
      c.guestEmail ||
      c.guestName ||
      c.id
    )
  );

  return NextResponse.json({
    escalatedCount: uniqueUsers.size,
  });
}