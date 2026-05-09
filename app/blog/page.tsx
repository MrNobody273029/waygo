import { prisma } from '@/lib/db';
import { BlogListContent } from './BlogListContent';

export const metadata = {
  title: 'Blog — WAYGO',
  description: 'Insights, guides and news from WAYGO car rental',
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
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

  const categories = Array.from(
    new Set(posts.map(p => p.category).filter(Boolean))
  ) as string[];

  return <BlogListContent posts={posts} categories={categories} />;
}
