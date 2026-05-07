import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const content = typeof body.content === 'string' ? body.content.trim() : '';

  if (!content) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  const conversation = await prisma.supportConversation.findUnique({
    where: { id: params.id },
  });

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  if (conversation.status === 'closed') {
    return NextResponse.json(
      { error: 'Conversation is closed' },
      { status: 400 }
    );
  }

  const message = await prisma.supportMessage.create({
    data: {
      conversationId: conversation.id,
      sender: 'admin',
      content,
    },
  });

  await prisma.supportConversation.update({
    where: { id: conversation.id },
    data: {
      status: 'escalated',
      escalated: true,
    },
  });

  return NextResponse.json({
    success: true,
    message: {
      id: message.id,
      sender: message.sender,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    },
  });
}