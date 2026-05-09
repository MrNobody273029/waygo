import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const featured = searchParams.get('featured') === 'true';
  const limit = parseInt(searchParams.get('limit') ?? '20');

  const posts = await prisma.blogPost.findMany({
    where: {
      published: true,
      ...(category ? { category } : {}),
      ...(featured ? { featured: true } : {}),
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    select: {
      id: true,
      slug: true,
      titleEn: true,
      titleKa: true,
      titleRu: true,
      excerptEn: true,
      excerptKa: true,
      excerptRu: true,
      coverImage: true,
      category: true,
      tags: true,
      featured: true,
      readTimeMin: true,
      publishedAt: true,
      author: { select: { fullName: true } },
    },
  });

  return NextResponse.json(posts);
}
