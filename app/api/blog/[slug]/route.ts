import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug, published: true },
    include: { author: { select: { fullName: true } } },
  });

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}
