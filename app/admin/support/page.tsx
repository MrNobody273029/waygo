import { prisma } from '@/lib/db';
import { AdminSupportContent } from './AdminSupportContent';

export const dynamic = 'force-dynamic';

export default async function AdminSupportPage() {
  const conversations = await prisma.supportConversation.findMany({
    orderBy: [{ escalated: 'desc' }, { updatedAt: 'desc' }],
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
      messages: {
        orderBy: { createdAt: 'asc' },
        take: 200,
      },
    },
  });

  const data = conversations.map(c => ({
    id: c.id,
    userId: c.userId,
    guestName: c.guestName,
    guestEmail: c.guestEmail,
    guestLang: c.guestLang,
    status: c.status,
    escalated: c.escalated,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    user: c.user,
    messages: c.messages.map(m => ({
      id: m.id,
      sender: m.sender,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
  }));

  return <AdminSupportContent initialConversations={data} />;
}