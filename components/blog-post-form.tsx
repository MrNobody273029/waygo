'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/lang-provider';
import { RichTextEditor } from '@/components/rich-text-editor';

type FormData = {
  slug: string;
  titleEn: string; titleKa: string; titleRu: string;
  excerptEn: string; excerptKa: string; excerptRu: string;
  contentEn: string; contentKa: string; contentRu: string;
  metaTitleEn: string; metaTitleKa: string; metaTitleRu: string;
  metaDescEn: string; metaDescKa: string; metaDescRu: string;
  keywords: string;
  coverImage: string;
  category: string;
  tags: string;
  featured: boolean;
  published: boolean;
  readTimeMin: number;
};

type Props = {
  initialData?: Partial<FormData> & { id?: string };
  mode: 'new' | 'edit';
};

type LangTab = 'en' | 'ka' | 'ru';

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-extrabold text-on-background uppercase tracking-wide">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-secondary">{hint}</p>}
    </div>
  );
}

export function BlogPostForm({ initialData, mode }: Props) {
  const { t } = useLang();
  const router = useRouter();
  const [langTab, setLangTab] = useState<LangTab>('en');
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    slug: initialData?.slug ?? '',
    titleEn: initialData?.titleEn ?? '',
    titleKa: initialData?.titleKa ?? '',
    titleRu: initialData?.titleRu ?? '',
    excerptEn: initialData?.excerptEn ?? '',
    excerptKa: initialData?.excerptKa ?? '',
    excerptRu: initialData?.excerptRu ?? '',
    contentEn: initialData?.contentEn ?? '',
    contentKa: initialData?.contentKa ?? '',
    contentRu: initialData?.contentRu ?? '',
    metaTitleEn: initialData?.metaTitleEn ?? '',
    metaTitleKa: initialData?.metaTitleKa ?? '',
    metaTitleRu: initialData?.metaTitleRu ?? '',
    metaDescEn: initialData?.metaDescEn ?? '',
    metaDescKa: initialData?.metaDescKa ?? '',
    metaDescRu: initialData?.metaDescRu ?? '',
    keywords: initialData?.keywords ?? '',
    coverImage: initialData?.coverImage ?? '',
    category: initialData?.category ?? '',
    tags: initialData?.tags ?? '',
    featured: initialData?.featured ?? false,
    published: initialData?.published ?? false,
    readTimeMin: initialData?.readTimeMin ?? 5,
  });

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function setTitleEn(val: string) {
    set('titleEn', val);
    if (!initialData?.slug) set('slug', slugify(val));
  }

  const uploadCover = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploadingCover(true);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'waygo/blog');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const { url } = await res.json();
        set('coverImage', url);
      }
      setUploadingCover(false);
    };
    input.click();
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSave(publish?: boolean) {
    setSaving(true);
    const payload = {
      ...form,
      tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
      published: publish !== undefined ? publish : form.published,
      readTimeMin: Number(form.readTimeMin),
    };

    let res: Response;
    if (mode === 'edit' && initialData?.id) {
      res = await fetch(`/api/admin/blog/${initialData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      showToast(publish ? t.blog.postPublished : t.blog.postSaved);
      if (mode === 'new') {
        router.replace(`/admin/blog/${data.id}/edit`);
      } else {
        set('published', data.published);
      }
    }
  }

  const langTabs: { key: LangTab; label: string }[] = [
    { key: 'en', label: t.blog.langTabEn },
    { key: 'ka', label: t.blog.langTabKa },
    { key: 'ru', label: t.blog.langTabRu },
  ];

  const titleKey = `title${langTab.charAt(0).toUpperCase() + langTab.slice(1)}` as 'titleEn' | 'titleKa' | 'titleRu';
  const excerptKey = `excerpt${langTab.charAt(0).toUpperCase() + langTab.slice(1)}` as 'excerptEn' | 'excerptKa' | 'excerptRu';
  const contentKey = `content${langTab.charAt(0).toUpperCase() + langTab.slice(1)}` as 'contentEn' | 'contentKa' | 'contentRu';
  const metaTitleKey = `metaTitle${langTab.charAt(0).toUpperCase() + langTab.slice(1)}` as 'metaTitleEn' | 'metaTitleKa' | 'metaTitleRu';
  const metaDescKey = `metaDesc${langTab.charAt(0).toUpperCase() + langTab.slice(1)}` as 'metaDescEn' | 'metaDescKa' | 'metaDescRu';

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-on-background text-surface px-4 py-3 text-sm font-semibold shadow-lg animate-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">check_circle</span>
          {toast}
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/blog')}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-outline-variant text-secondary hover:bg-slate-50 transition"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div>
            <h1 className="text-h2 font-extrabold text-on-background">
              {mode === 'new' ? t.blog.newPost : t.blog.editPost}
            </h1>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {form.published ? (
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl border border-outline-variant px-4 py-2.5 text-sm font-semibold text-secondary hover:bg-slate-50 transition"
            >
              <span className="material-symbols-outlined text-[16px]">visibility_off</span>
              {t.blog.unpublishPost}
            </button>
          ) : (
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl bg-tertiary text-white px-4 py-2.5 text-sm font-bold hover:bg-tertiary/90 transition shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">publish</span>
              {t.blog.publishPost}
            </button>
          )}
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl bg-primary-container text-white px-5 py-2.5 text-sm font-bold hover:bg-primary transition shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">{saving ? 'hourglass_empty' : 'save'}</span>
            {saving ? t.blog.savingPost : t.blog.savePost}
          </button>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* Main editor column */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">

          {/* Language tabs */}
          <div className="flex items-center gap-0.5 rounded-xl bg-slate-100 p-1 w-fit">
            {langTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setLangTab(tab.key)}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                  langTab === tab.key
                    ? 'bg-white text-primary-container shadow-sm'
                    : 'text-secondary hover:text-on-background'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Title */}
          <Field label={t.blog.titleLabel}>
            <input
              value={form[titleKey]}
              onChange={e => langTab === 'en' ? setTitleEn(e.target.value) : set(titleKey, e.target.value)}
              placeholder={`${t.blog.titleLabel} (${langTab.toUpperCase()})`}
              className="rounded-xl border border-outline-variant px-4 py-3 text-h3 font-extrabold text-on-background placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
            />
          </Field>

          {/* Excerpt */}
          <Field label={t.blog.excerptLabel}>
            <textarea
              value={form[excerptKey]}
              onChange={e => set(excerptKey, e.target.value)}
              placeholder={`${t.blog.excerptLabel} (${langTab.toUpperCase()})`}
              rows={2}
              className="rounded-xl border border-outline-variant px-4 py-3 text-body-md text-on-background placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white resize-none"
            />
          </Field>

          {/* Rich text editor */}
          <Field label={t.blog.contentLabel}>
            <RichTextEditor
              key={contentKey}
              value={form[contentKey]}
              onChange={v => set(contentKey, v)}
              placeholder={`${t.blog.contentLabel} (${langTab.toUpperCase()})…`}
            />
          </Field>

          {/* SEO Section */}
          <div className="rounded-2xl border border-outline-variant bg-white p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[18px] text-secondary">travel_explore</span>
              <h3 className="font-extrabold text-sm uppercase tracking-widest text-secondary">SEO ({langTab.toUpperCase()})</h3>
            </div>

            <Field label={t.blog.metaTitleLabel}>
              <input
                value={form[metaTitleKey]}
                onChange={e => set(metaTitleKey, e.target.value)}
                placeholder={form[titleKey] || `${t.blog.metaTitleLabel}…`}
                className="rounded-xl border border-outline-variant px-4 py-2.5 text-sm text-on-background placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              />
            </Field>

            <Field label={t.blog.metaDescLabel}>
              <textarea
                value={form[metaDescKey]}
                onChange={e => set(metaDescKey, e.target.value)}
                placeholder={`${t.blog.metaDescLabel}…`}
                rows={2}
                className="rounded-xl border border-outline-variant px-4 py-2.5 text-sm text-on-background placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white resize-none"
              />
            </Field>

            {langTab === 'en' && (
              <Field label={t.blog.keywordsLabel} hint="car rental, tbilisi, georgia, waygo…">
                <input
                  value={form.keywords}
                  onChange={e => set('keywords', e.target.value)}
                  placeholder="car rental, georgia, tbilisi…"
                  className="rounded-xl border border-outline-variant px-4 py-2.5 text-sm text-on-background placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                />
              </Field>
            )}
          </div>
        </div>

        {/* Sidebar / metadata */}
        <aside className="w-72 flex-shrink-0 flex flex-col gap-5 sticky top-28">

          {/* Status */}
          <div className="rounded-2xl border border-outline-variant bg-white p-5 flex flex-col gap-3">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-secondary">Status</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-on-background">{t.blog.publishedLabel}</span>
              <div
                onClick={() => set('published', !form.published)}
                className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${form.published ? 'bg-primary-container' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.published ? 'translate-x-5' : ''}`} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-on-background">{t.blog.featuredLabel}</span>
              <div
                onClick={() => set('featured', !form.featured)}
                className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${form.featured ? 'bg-tertiary' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.featured ? 'translate-x-5' : ''}`} />
              </div>
            </div>
          </div>

          {/* Cover image */}
          <div className="rounded-2xl border border-outline-variant bg-white p-5 flex flex-col gap-3">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-secondary">{t.blog.coverImageLabel}</h3>
            {form.coverImage ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.coverImage} alt="Cover" className="w-full h-36 object-cover rounded-xl" />
                <button
                  onClick={uploadCover}
                  disabled={uploadingCover}
                  className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-on-background shadow hover:bg-white transition"
                >
                  <span className="material-symbols-outlined text-[13px]">edit</span>
                  {t.blog.changeCover}
                </button>
              </div>
            ) : (
              <button
                onClick={uploadCover}
                disabled={uploadingCover}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-outline-variant py-8 text-secondary hover:border-primary-container hover:text-primary-container transition group"
              >
                <span className="material-symbols-outlined text-[32px] group-hover:text-primary-container transition">add_photo_alternate</span>
                <span className="text-sm font-semibold">{uploadingCover ? 'Uploading…' : t.blog.uploadCover}</span>
              </button>
            )}
          </div>

          {/* Metadata */}
          <div className="rounded-2xl border border-outline-variant bg-white p-5 flex flex-col gap-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-secondary">Metadata</h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-secondary uppercase tracking-wide">{t.blog.slugLabel}</label>
              <div className="flex items-center rounded-xl border border-outline-variant overflow-hidden">
                <span className="bg-slate-50 px-2.5 py-2 text-xs text-secondary font-mono border-r border-outline-variant">/blog/</span>
                <input
                  value={form.slug}
                  onChange={e => set('slug', slugify(e.target.value))}
                  placeholder="my-article"
                  className="flex-1 px-3 py-2 text-xs font-mono text-on-background focus:outline-none bg-white"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-secondary uppercase tracking-wide">{t.blog.categoryLabel}</label>
              <input
                value={form.category}
                onChange={e => set('category', e.target.value)}
                placeholder="Travel, Tips…"
                className="rounded-xl border border-outline-variant px-3 py-2 text-sm text-on-background placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-secondary uppercase tracking-wide">{t.blog.tagsLabel}</label>
              <input
                value={form.tags}
                onChange={e => set('tags', e.target.value)}
                placeholder="travel, tips, georgia"
                className="rounded-xl border border-outline-variant px-3 py-2 text-sm text-on-background placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-secondary uppercase tracking-wide">{t.blog.readTimeLabel}</label>
              <input
                type="number"
                min={1}
                max={60}
                value={form.readTimeMin}
                onChange={e => set('readTimeMin', Number(e.target.value))}
                className="rounded-xl border border-outline-variant px-3 py-2 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white w-full"
              />
            </div>
          </div>

          {/* Save bottom button (mobile) */}
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="lg:hidden flex items-center justify-center gap-2 rounded-xl bg-primary-container text-white px-5 py-3 font-bold text-sm hover:bg-primary transition shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">{saving ? 'hourglass_empty' : 'save'}</span>
            {saving ? t.blog.savingPost : t.blog.savePost}
          </button>
        </aside>
      </div>
    </div>
  );
}
