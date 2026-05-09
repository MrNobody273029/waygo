import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

function adminOnly(session: any) {
  return !session || (session.user as any)?.role !== 'ADMIN';
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (adminOnly(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const post = await prisma.blogPost.findUnique({
    where: { id: params.id },
    include: { author: { select: { fullName: true } } },
  });

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (adminOnly(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();

  const existing = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const wasPublished = existing.published;
  const nowPublished = body.published ?? existing.published;

  const post = await prisma.blogPost.update({
    where: { id: params.id },
    data: {
      titleEn: body.titleEn ?? existing.titleEn,
      titleKa: body.titleKa ?? existing.titleKa,
      titleRu: body.titleRu ?? existing.titleRu,
      excerptEn: body.excerptEn ?? existing.excerptEn,
      excerptKa: body.excerptKa ?? existing.excerptKa,
      excerptRu: body.excerptRu ?? existing.excerptRu,
      contentEn: body.contentEn ?? existing.contentEn,
      contentKa: body.contentKa ?? existing.contentKa,
      contentRu: body.contentRu ?? existing.contentRu,
      metaTitleEn: body.metaTitleEn ?? existing.metaTitleEn,
      metaTitleKa: body.metaTitleKa ?? existing.metaTitleKa,
      metaTitleRu: body.metaTitleRu ?? existing.metaTitleRu,
      metaDescEn: body.metaDescEn ?? existing.metaDescEn,
      metaDescKa: body.metaDescKa ?? existing.metaDescKa,
      metaDescRu: body.metaDescRu ?? existing.metaDescRu,
      keywords: body.keywords ?? existing.keywords,
      coverImage: body.coverImage ?? existing.coverImage,
      category: body.category ?? existing.category,
      tags: body.tags ?? existing.tags,
      featured: body.featured ?? existing.featured,
      published: nowPublished,
      publishedAt: !wasPublished && nowPublished ? new Date() : existing.publishedAt,
      readTimeMin: body.readTimeMin ?? existing.readTimeMin,
      slug: body.slug ?? existing.slug,
    },
  });

  return NextResponse.json(post);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (adminOnly(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.blogPost.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
