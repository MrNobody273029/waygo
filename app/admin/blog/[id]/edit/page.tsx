import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { BlogPostForm } from '@/components/blog-post-form';

export const metadata = { title: 'Admin — Edit Blog Post' };

export default async function EditBlogPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/');

  const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!post) notFound();

  return (
    <BlogPostForm
      mode="edit"
      initialData={{
        id: post.id,
        slug: post.slug,
        titleEn: post.titleEn, titleKa: post.titleKa, titleRu: post.titleRu,
        excerptEn: post.excerptEn ?? '', excerptKa: post.excerptKa ?? '', excerptRu: post.excerptRu ?? '',
        contentEn: post.contentEn, contentKa: post.contentKa, contentRu: post.contentRu,
        metaTitleEn: post.metaTitleEn ?? '', metaTitleKa: post.metaTitleKa ?? '', metaTitleRu: post.metaTitleRu ?? '',
        metaDescEn: post.metaDescEn ?? '', metaDescKa: post.metaDescKa ?? '', metaDescRu: post.metaDescRu ?? '',
        keywords: post.keywords ?? '',
        coverImage: post.coverImage ?? '',
        category: post.category ?? '',
        tags: post.tags.join(', '),
        featured: post.featured,
        published: post.published,
        readTimeMin: post.readTimeMin,
      }}
    />
  );
}
