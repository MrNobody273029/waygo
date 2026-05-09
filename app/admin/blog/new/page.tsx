import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { BlogPostForm } from '@/components/blog-post-form';

export const metadata = { title: 'Admin — New Blog Post' };

export default async function NewBlogPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/');

  return <BlogPostForm mode="new" />;
}
