import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AdminBlogContent } from './AdminBlogContent';

export const metadata = { title: 'Admin — Blog' };

export default async function AdminBlogPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/');

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { fullName: true } } },
  });

  return <AdminBlogContent posts={posts} />;
}
