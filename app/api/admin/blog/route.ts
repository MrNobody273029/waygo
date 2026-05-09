import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

function adminOnly(session: any) {
  return !session || (session.user as any)?.role !== 'ADMIN';
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (adminOnly(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { fullName: true } } },
  });

  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (adminOnly(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const adminId = (session!.user as any).id as string;

  const baseSlug = slugify(body.slug || body.titleEn || 'post');
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const post = await prisma.blogPost.create({
    data: {
      slug,
      titleEn: body.titleEn ?? '',
      titleKa: body.titleKa ?? '',
      titleRu: body.titleRu ?? '',
      excerptEn: body.excerptEn ?? '',
      excerptKa: body.excerptKa ?? '',
      excerptRu: body.excerptRu ?? '',
      contentEn: body.contentEn ?? '',
      contentKa: body.contentKa ?? '',
      contentRu: body.contentRu ?? '',
      metaTitleEn: body.metaTitleEn ?? null,
      metaTitleKa: body.metaTitleKa ?? null,
      metaTitleRu: body.metaTitleRu ?? null,
      metaDescEn: body.metaDescEn ?? null,
      metaDescKa: body.metaDescKa ?? null,
      metaDescRu: body.metaDescRu ?? null,
      keywords: body.keywords ?? null,
      coverImage: body.coverImage ?? null,
      category: body.category ?? null,
      tags: body.tags ?? [],
      featured: body.featured ?? false,
      published: body.published ?? false,
      publishedAt: body.published ? new Date() : null,
      readTimeMin: body.readTimeMin ?? 5,
      authorId: adminId,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
