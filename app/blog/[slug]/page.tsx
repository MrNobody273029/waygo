import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { BlogPostContent } from './BlogPostContent';
import type { Metadata } from 'next';

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug, published: true },
  });
  if (!post) return {};

  return {
    title: `${post.metaTitleEn || post.titleEn} — WAYGO Blog`,
    description: post.metaDescEn || post.excerptEn || undefined,
    keywords: post.keywords || undefined,
    openGraph: {
      title: post.metaTitleEn || post.titleEn,
      description: post.metaDescEn || post.excerptEn || undefined,
      images: post.coverImage ? [post.coverImage] : [],
      type: 'article',
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug, published: true },
    include: { author: { select: { fullName: true } } },
  });

  if (!post) notFound();

  const related = await prisma.blogPost.findMany({
    where: {
      published: true,
      id: { not: post.id },
      ...(post.category ? { category: post.category } : {}),
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true, slug: true,
      titleEn: true, titleKa: true, titleRu: true,
      excerptEn: true, excerptKa: true, excerptRu: true,
      coverImage: true, category: true, tags: true,
      featured: true, readTimeMin: true, publishedAt: true,
      author: { select: { fullName: true } },
    },
  });

  return <BlogPostContent post={post} related={related} />;
}
