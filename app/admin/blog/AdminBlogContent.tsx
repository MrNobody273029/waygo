'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/lang-provider';
import { useState } from 'react';
import type { Lang } from '@/lib/i18n';

type Post = {
  id: string;
  slug: string;
  titleEn: string; titleKa: string; titleRu: string;
  coverImage: string | null;
  category: string | null;
  featured: boolean;
  published: boolean;
  readTimeMin: number;
  publishedAt: Date | null;
  createdAt: Date;
  author: { fullName: string };
};

function getTitle(post: Post, lang: Lang) {
  if (lang === 'ka') return post.titleKa || post.titleEn;
  if (lang === 'ru') return post.titleRu || post.titleEn;
  return post.titleEn;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function AdminBlogContent({ posts: initialPosts }: { posts: Post[] }) {
  const { lang, t } = useLang();
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm(t.blog.confirmDelete)) return;
    setDeleting(id);
    await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
    setPosts(posts.filter(p => p.id !== id));
    setDeleting(null);
  }

  async function handleTogglePublish(post: Post) {
    setToggling(post.id);
    const res = await fetch(`/api/admin/blog/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !post.published }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPosts(posts.map(p => p.id === post.id ? { ...p, published: updated.published, publishedAt: updated.publishedAt } : p));
    }
    setToggling(null);
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h1 font-extrabold text-on-background">{t.blog.adminTitle}</h1>
          <p className="text-body-md text-secondary mt-1">{t.blog.adminSubtitle}</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 rounded-xl bg-primary-container text-white px-5 py-2.5 font-bold text-sm hover:bg-primary transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          {t.blog.newPost}
        </Link>
      </div>

      {/* Table */}
      {posts.length === 0 ? (
        <div className="rounded-2xl border border-outline-variant bg-white py-20 text-center">
          <span className="material-symbols-outlined text-[64px] text-slate-200 block mb-4">article</span>
          <p className="text-body-lg font-semibold text-secondary mb-4">{t.blog.noPostsAdmin}</p>
          <Link href="/admin/blog/new" className="inline-flex items-center gap-2 rounded-xl bg-primary-container text-white px-5 py-2.5 font-bold text-sm hover:bg-primary transition-all">
            <span className="material-symbols-outlined text-[18px]">add</span>
            {t.blog.newPost}
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-outline-variant bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant bg-slate-50">
                  <th className="px-5 py-3.5 text-left text-[11px] font-black uppercase tracking-widest text-secondary">Article</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-black uppercase tracking-widest text-secondary hidden md:table-cell">Category</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-black uppercase tracking-widest text-secondary">Status</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-black uppercase tracking-widest text-secondary hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3.5 text-right text-[11px] font-black uppercase tracking-widest text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {posts.map(post => (
                  <tr key={post.id} className="hover:bg-slate-50/50 transition-colors group">
                    {/* Title + thumbnail */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {post.coverImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={post.coverImage} alt="" className="h-12 w-16 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="h-12 w-16 rounded-lg bg-primary-fixed/10 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-[20px] text-primary/30">article</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-extrabold text-sm text-on-background line-clamp-1">{getTitle(post, lang)}</p>
                          <p className="text-[11px] text-secondary font-mono mt-0.5">/{post.slug}</p>
                          {post.featured && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-tertiary uppercase tracking-wide">
                              <span className="material-symbols-outlined text-[10px]">star</span>
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="px-4 py-4 hidden md:table-cell">
                      {post.category ? (
                        <span className="rounded-full bg-primary-fixed/20 px-2.5 py-0.5 text-[11px] font-bold text-primary-container">
                          {post.category}
                        </span>
                      ) : (
                        <span className="text-secondary text-xs">—</span>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        post.published
                          ? 'bg-tertiary/10 text-tertiary'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${post.published ? 'bg-tertiary' : 'bg-slate-400'}`} />
                        {post.published ? t.blog.statusPublished : t.blog.statusDraft}
                      </span>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <p className="text-xs text-on-background font-semibold">{formatDate(post.createdAt)}</p>
                      {post.publishedAt && (
                        <p className="text-[11px] text-secondary">pub: {formatDate(post.publishedAt)}</p>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        {/* Toggle publish */}
                        <button
                          onClick={() => handleTogglePublish(post)}
                          disabled={toggling === post.id}
                          title={post.published ? t.blog.unpublishPost : t.blog.publishPost}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                            post.published
                              ? 'text-tertiary hover:bg-tertiary/10'
                              : 'text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {toggling === post.id ? 'hourglass_empty' : post.published ? 'visibility' : 'visibility_off'}
                          </span>
                        </button>

                        {/* View */}
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          title="View on site"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary hover:bg-slate-100 transition"
                        >
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        </Link>

                        {/* Edit */}
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          title={t.blog.editPost}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary hover:bg-primary-fixed/20 hover:text-primary-container transition"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={deleting === post.id}
                          title={t.blog.deletePost}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary hover:bg-error/10 hover:text-error transition"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {deleting === post.id ? 'hourglass_empty' : 'delete'}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
