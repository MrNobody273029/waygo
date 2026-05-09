'use client';
import Link from 'next/link';
import { useLang } from '@/components/lang-provider';
import type { Lang } from '@/lib/i18n';
import { useState } from 'react';

type Post = {
  id: string;
  slug: string;
  titleEn: string;
  titleKa: string;
  titleRu: string;
  excerptEn: string | null;
  excerptKa: string | null;
  excerptRu: string | null;
  coverImage: string | null;
  category: string | null;
  tags: string[];
  featured: boolean;
  readTimeMin: number;
  publishedAt: Date | null;
  author: { fullName: string };
};

function getTitle(post: Post, lang: Lang) {
  if (lang === 'ka') return post.titleKa || post.titleEn;
  if (lang === 'ru') return post.titleRu || post.titleEn;
  return post.titleEn;
}

function getExcerpt(post: Post, lang: Lang) {
  if (lang === 'ka') return post.excerptKa || post.excerptEn;
  if (lang === 'ru') return post.excerptRu || post.excerptEn;
  return post.excerptEn;
}

function formatDate(date: Date | null, lang: Lang) {
  if (!date) return '';
  const d = new Date(date);
  const localeMap: Record<Lang, string> = { en: 'en-US', ka: 'ka-GE', ru: 'ru-RU' };
  return d.toLocaleDateString(localeMap[lang], { year: 'numeric', month: 'long', day: 'numeric' });
}

function BlogCard({ post, lang, t }: { post: Post; lang: Lang; t: any }) {
  const title = getTitle(post, lang);
  const excerpt = getExcerpt(post, lang);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-white transition-all hover:shadow-card-hover hover:-translate-y-0.5"
    >
      {post.coverImage ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={post.coverImage}
          alt={title}
          className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="h-52 w-full bg-gradient-to-br from-primary-container/30 to-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-[48px] text-primary/30">article</span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2 flex-wrap">
          {post.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-tertiary/10 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-tertiary">
              <span className="material-symbols-outlined text-[12px]">star</span>
              {t.blog.featured}
            </span>
          )}
          {post.category && (
            <span className="rounded-full bg-primary-fixed/20 px-2.5 py-0.5 text-[11px] font-bold text-primary-container">
              {post.category}
            </span>
          )}
        </div>

        <h2 className="text-h3 font-extrabold text-on-background line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h2>

        {excerpt && (
          <p className="text-body-md text-secondary line-clamp-3 flex-1">{excerpt}</p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/50 mt-auto">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-container text-white text-[11px] font-black">
              {post.author.fullName[0]}
            </div>
            <div>
              <p className="text-[12px] font-semibold text-on-background">{post.author.fullName}</p>
              <p className="text-[11px] text-secondary">{formatDate(post.publishedAt, lang)}</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-secondary">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            {t.blog.minRead(post.readTimeMin)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function FeaturedCard({ post, lang, t }: { post: Post; lang: Lang; t: any }) {
  const title = getTitle(post, lang);
  const excerpt = getExcerpt(post, lang);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative overflow-hidden rounded-2xl bg-slate-900 min-h-[420px] flex items-end col-span-full"
    >
      {post.coverImage ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={post.coverImage}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container to-primary" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="relative z-10 flex flex-col gap-3 p-8 md:p-12 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-tertiary px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white">
            <span className="material-symbols-outlined text-[12px]">star</span>
            {t.blog.featured}
          </span>
          {post.category && (
            <span className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-[11px] font-bold text-white">
              {post.category}
            </span>
          )}
        </div>

        <h2 className="text-display text-white font-extrabold line-clamp-3 group-hover:underline underline-offset-4">
          {title}
        </h2>

        {excerpt && (
          <p className="text-body-lg text-white/80 line-clamp-2">{excerpt}</p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white text-[12px] font-black">
            {post.author.fullName[0]}
          </div>
          <span className="text-[13px] font-semibold text-white/90">{post.author.fullName}</span>
          <span className="text-white/50">·</span>
          <span className="text-[13px] text-white/70">{formatDate(post.publishedAt, lang)}</span>
          <span className="text-white/50">·</span>
          <span className="text-[13px] text-white/70">{t.blog.minRead(post.readTimeMin)}</span>
        </div>
      </div>
    </Link>
  );
}

export function BlogListContent({ posts, categories }: { posts: Post[]; categories: string[] }) {
  const { lang, t } = useLang();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const featured = posts.find(p => p.featured);
  const rest = posts.filter(p => !p.featured);

  const filtered = (activeCategory ? rest.filter(p => p.category === activeCategory) : rest).filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      getTitle(p, lang).toLowerCase().includes(q) ||
      (getExcerpt(p, lang) ?? '').toLowerCase().includes(q) ||
      (p.category ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-screen bg-surface pt-[62px] md:pt-[120px] pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-8">

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-display font-extrabold text-on-background mb-3">{t.blog.pageTitle}</h1>
          <p className="text-body-lg text-secondary max-w-xl mx-auto">{t.blog.pageSubtitle}</p>
        </div>

        {/* Featured */}
        {featured && !search && !activeCategory && (
          <div className="mb-10">
            <FeaturedCard post={featured} lang={lang} t={t} />
          </div>
        )}

        {/* Filters */}
        {(categories.length > 0 || posts.length > 4) && (
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {/* Search */}
            <div className="flex items-center gap-2 rounded-xl bg-white border border-outline-variant px-3 py-2 flex-1 min-w-[200px] max-w-sm">
              <span className="material-symbols-outlined text-[18px] text-secondary">search</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t.blog.searchPlaceholder}
                className="flex-1 bg-transparent text-sm text-on-background placeholder:text-secondary focus:outline-none"
              />
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  activeCategory === null
                    ? 'bg-primary-container text-white shadow-sm'
                    : 'bg-white border border-outline-variant text-secondary hover:bg-slate-50'
                }`}
              >
                {t.blog.filterAll}
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    activeCategory === cat
                      ? 'bg-primary-container text-white shadow-sm'
                      : 'bg-white border border-outline-variant text-secondary hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <span className="material-symbols-outlined text-[64px] text-slate-200 block mb-4">article</span>
            <p className="text-body-lg text-secondary">{t.blog.noPosts}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(post => (
              <BlogCard key={post.id} post={post} lang={lang} t={t} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
