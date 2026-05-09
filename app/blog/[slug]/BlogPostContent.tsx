'use client';
import Link from 'next/link';
import { useLang } from '@/components/lang-provider';
import type { Lang } from '@/lib/i18n';

type Post = {
  id: string;
  slug: string;
  titleEn: string; titleKa: string; titleRu: string;
  excerptEn: string | null; excerptKa: string | null; excerptRu: string | null;
  contentEn: string; contentKa: string; contentRu: string;
  metaTitleEn: string | null; metaTitleKa: string | null; metaTitleRu: string | null;
  coverImage: string | null;
  category: string | null;
  tags: string[];
  featured: boolean;
  readTimeMin: number;
  publishedAt: Date | null;
  keywords: string | null;
  author: { fullName: string };
};

type RelatedPost = {
  id: string; slug: string;
  titleEn: string; titleKa: string; titleRu: string;
  excerptEn: string | null; excerptKa: string | null; excerptRu: string | null;
  coverImage: string | null; category: string | null; tags: string[];
  featured: boolean; readTimeMin: number; publishedAt: Date | null;
  author: { fullName: string };
};

function pick(en: string, ka: string, ru: string, lang: Lang, fallback = '') {
  const map: Record<Lang, string> = { en, ka, ru };
  return map[lang] || en || fallback;
}

function pickNullable(en: string | null, ka: string | null, ru: string | null, lang: Lang) {
  const map: Record<Lang, string | null> = { en, ka, ru };
  return map[lang] || en;
}

function formatDate(date: Date | null, lang: Lang) {
  if (!date) return '';
  const localeMap: Record<Lang, string> = { en: 'en-US', ka: 'ka-GE', ru: 'ru-RU' };
  return new Date(date).toLocaleDateString(localeMap[lang], {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function RelatedCard({ post, lang, t }: { post: RelatedPost; lang: Lang; t: any }) {
  const title = pick(post.titleEn, post.titleKa, post.titleRu, lang);
  const excerpt = pickNullable(post.excerptEn, post.excerptKa, post.excerptRu, lang);
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex gap-4 rounded-xl border border-outline-variant bg-white p-4 hover:shadow-card-hover transition-all hover:-translate-y-0.5"
    >
      {post.coverImage ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={post.coverImage} alt={title} className="h-20 w-28 flex-shrink-0 rounded-lg object-cover" />
      ) : (
        <div className="h-20 w-28 flex-shrink-0 rounded-lg bg-primary-fixed/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-[24px] text-primary/30">article</span>
        </div>
      )}
      <div className="flex flex-col gap-1 min-w-0">
        <h3 className="text-label-bold font-extrabold text-on-background line-clamp-2 group-hover:text-primary transition-colors">{title}</h3>
        {excerpt && <p className="text-label-sm text-secondary line-clamp-2">{excerpt}</p>}
        <span className="text-[11px] text-secondary mt-auto">{t.blog.minRead(post.readTimeMin)}</span>
      </div>
    </Link>
  );
}

export function BlogPostContent({ post, related }: { post: Post; related: RelatedPost[] }) {
  const { lang, t } = useLang();

  const title = pick(post.titleEn, post.titleKa, post.titleRu, lang);
  const content = pick(post.contentEn, post.contentKa, post.contentRu, lang, post.contentEn);
  const excerpt = pickNullable(post.excerptEn, post.excerptKa, post.excerptRu, lang);
  const tags = post.tags ?? [];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <main className="min-h-screen bg-surface pt-24 pb-20">
      {/* Hero cover */}
      {post.coverImage && (
        <div className="relative h-[420px] md:h-[520px] w-full overflow-hidden mb-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.coverImage} alt={title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-secondary mb-6 pt-8">
          <Link href="/blog" className="hover:text-primary transition-colors font-semibold">
            {t.blog.backToBlog}
          </Link>
          {post.category && (
            <>
              <span>/</span>
              <span className="text-primary font-semibold">{post.category}</span>
            </>
          )}
        </div>

        <div className="flex gap-10">
          {/* Main column */}
          <article className="flex-1 min-w-0">
            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {post.featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-tertiary/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-tertiary">
                  <span className="material-symbols-outlined text-[12px]">star</span>
                  {t.blog.featured}
                </span>
              )}
              {post.category && (
                <span className="rounded-full bg-primary-fixed/20 px-3 py-1 text-[11px] font-bold text-primary-container">
                  {post.category}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-display font-extrabold text-on-background mb-4 leading-tight">
              {title}
            </h1>

            {/* Excerpt */}
            {excerpt && (
              <p className="text-body-lg text-secondary mb-6 border-l-4 border-primary-container pl-4">
                {excerpt}
              </p>
            )}

            {/* Author row */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-outline-variant">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-white font-black text-sm">
                  {post.author.fullName[0]}
                </div>
                <div>
                  <p className="font-extrabold text-sm text-on-background">{post.author.fullName}</p>
                  <p className="text-[12px] text-secondary">
                    {t.blog.publishedOn} {formatDate(post.publishedAt, lang)} · {t.blog.minRead(post.readTimeMin)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 rounded-xl border border-outline-variant px-3 py-1.5 text-sm font-semibold text-secondary hover:bg-slate-50 transition"
              >
                <span className="material-symbols-outlined text-[16px]">share</span>
                {t.blog.share}
              </button>
            </div>

            {/* Rich text content */}
            <div
              className="prose prose-slate prose-lg max-w-none
                prose-headings:font-extrabold prose-headings:text-on-background
                prose-h1:text-display prose-h2:text-h1 prose-h3:text-h2
                prose-p:text-on-background prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-on-background
                prose-blockquote:border-primary-container prose-blockquote:text-secondary
                prose-code:bg-slate-100 prose-code:text-slate-800 prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:text-sm
                prose-pre:bg-slate-900 prose-pre:text-slate-100
                prose-img:rounded-xl prose-img:shadow-card-hover
                prose-ul:text-on-background prose-ol:text-on-background
                prose-hr:border-outline-variant"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-outline-variant">
                <span className="text-sm font-bold text-secondary">{t.blog.tags}:</span>
                {tags.map(tag => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </article>

          {/* Sidebar (desktop only) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28 space-y-6">
              {post.category && (
                <div className="rounded-xl border border-outline-variant bg-white p-4">
                  <p className="text-[11px] font-black uppercase tracking-widest text-secondary mb-2">{t.blog.category}</p>
                  <span className="inline-block rounded-full bg-primary-fixed/20 px-3 py-1 text-sm font-bold text-primary-container">
                    {post.category}
                  </span>
                </div>
              )}

              {tags.length > 0 && (
                <div className="rounded-xl border border-outline-variant bg-white p-4">
                  <p className="text-[11px] font-black uppercase tracking-widest text-secondary mb-3">{t.blog.tags}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(tag => (
                      <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-outline-variant bg-white p-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-secondary mb-3">{t.blog.by}</p>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-white font-black text-sm">
                    {post.author.fullName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-background">{post.author.fullName}</p>
                    <p className="text-[11px] text-secondary">WAYGO</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-outline-variant">
            <h2 className="text-h2 font-extrabold text-on-background mb-6">{t.blog.relatedPosts}</h2>
            <div className="flex flex-col gap-4">
              {related.map(rp => (
                <RelatedCard key={rp.id} post={rp} lang={lang} t={t} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
