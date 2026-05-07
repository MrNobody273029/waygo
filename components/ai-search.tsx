'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/lang-provider';
import { GEORGIAN_CITIES_EN } from '@/lib/cities';

// ── Types ──────────────────────────────────────────────────────────────────

interface AIFilters {
  city?: string | null;
  carType?: string | null;
  transmission?: string | null;
  maxPrice?: number | null;
  fuelType?: string | null;
  minSeats?: number | null;
  brand?: string | null;
  days?: number | null;
  features?: string[];
}

interface AIResponse {
  filters: AIFilters;
  confidence: number;
  needs_escalation: boolean;
  question: string | null;
}

type SearchState = 'idle' | 'expanded' | 'thinking' | 'interpreted' | 'question';

// ── Constants ──────────────────────────────────────────────────────────────

const SUGGESTIONS = {
  en: [
    'What kind of car are you looking for?',
    'SUV in Batumi under 80₾/day',
    'Automatic sedan in Tbilisi',
    'Electric car with GPS',
    '7-seater for a family trip',
  ],
  ka: [
    'როგორ მანქანას ეძებთ?',
    'ბათუმში SUV 80₾-მდე',
    'ავტომატური სედანი თბილისში',
    'ელექტრო მანქანა GPS-ით',
    '7-ადგილიანი ოჯახისთვის',
  ],
  ru: [
    'Какую машину вы ищете?',
    'SUV в Батуми до 80₾',
    'Автомат в Тбилиси',
    'Электромобиль с GPS',
    '7 мест для семьи',
  ],
};

const TYPE_ICONS: Record<string, string> = {
  Economy: 'directions_car', Compact: 'directions_car', Sedan: 'drive_eta',
  SUV: 'directions_car', Minivan: 'airport_shuttle', Premium: 'workspace_premium',
  Pickup: 'local_shipping', Coupe: 'speed', Hatchback: 'directions_car', Convertible: 'wb_sunny',
};

const UI = {
  en: {
    badge: 'AI Search', badgeSub: 'Natural language',
    thinking: 'AI is thinking…', understood: 'I understood:',
    apply: 'Search', edit: 'Edit', answerBtn: 'Continue',
    empty: 'No filters detected. Try a different query.',
    hint: 'Ask in any language',
  },
  ka: {
    badge: 'AI ძიება', badgeSub: 'ბუნებრივი ენა',
    thinking: 'AI ამუშავებს…', understood: 'გავიგე:',
    apply: 'ძიება', edit: 'შეცვლა', answerBtn: 'გაგრძელება',
    empty: 'ვერ ამოიცნო. სხვა სიტყვებით სცადე.',
    hint: 'ნებისმიერ ენაზე',
  },
  ru: {
    badge: 'AI Поиск', badgeSub: 'Естественный язык',
    thinking: 'AI думает…', understood: 'Понял:',
    apply: 'Найти', edit: 'Изменить', answerBtn: 'Продолжить',
    empty: 'Ничего не распознано. Попробуйте иначе.',
    hint: 'На любом языке',
  },
};

// ── Helper: build filter chips ─────────────────────────────────────────────

function buildChips(f: AIFilters): { icon: string; label: string }[] {
  const chips: { icon: string; label: string }[] = [];
  if (f.city) chips.push({ icon: 'location_on', label: f.city });
  if (f.carType) chips.push({ icon: TYPE_ICONS[f.carType] ?? 'directions_car', label: f.carType });
  if (f.transmission) chips.push({ icon: 'settings', label: f.transmission });
  if (f.fuelType) chips.push({ icon: 'local_gas_station', label: f.fuelType });
  if (f.maxPrice) chips.push({ icon: 'monetization_on', label: `Max ${f.maxPrice} ₾` });
  if (f.minSeats) chips.push({ icon: 'group', label: `${f.minSeats}+ seats` });
  if (f.brand) chips.push({ icon: 'garage', label: f.brand });
  if (f.days) chips.push({ icon: 'calendar_month', label: `${f.days} days` });
  (f.features ?? []).forEach(feat =>
    chips.push({ icon: 'check_circle', label: feat })
  );
  return chips;
}

// ── ThinkingDots ───────────────────────────────────────────────────────────

function ThinkingDots() {
  return (
    <span className="flex items-center gap-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: '900ms' }}
        />
      ))}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function AISearch() {
  const { lang } = useLang();
  const router = useRouter();
  const ui = UI[lang] ?? UI.en;
  const suggestions = SUGGESTIONS[lang] ?? SUGGESTIONS.en;

  const [state, setState] = useState<SearchState>('idle');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<AIResponse | null>(null);
  const [followUp, setFollowUp] = useState('');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [error, setError] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const followUpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setInterval(() => setPlaceholderIdx(i => (i + 1) % suggestions.length), 3200);
    return () => clearInterval(id);
  }, [suggestions.length]);

  useEffect(() => {
    if (state === 'expanded') textareaRef.current?.focus();
    if (state === 'question') setTimeout(() => followUpRef.current?.focus(), 50);
  }, [state]);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (state === 'expanded' && !query.trim()) setState('idle');
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [state, query]);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setState('thinking');
    setError(false);
    try {
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      if (!res.ok) throw new Error();
      const data: AIResponse = await res.json();
      setResult(data);
      setState(data.question ? 'question' : 'interpreted');
    } catch {
      setError(true);
      setState('expanded');
    }
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      runSearch(query);
    }
  }

  function handleApply() {
    if (!result) return;
    const f = result.filters;
    const p = new URLSearchParams();
    if (f.city) p.set('city', f.city);
    if (f.carType) p.set('type', f.carType);
    if (f.transmission) p.set('transmission', f.transmission);
    if (f.maxPrice) p.set('maxPrice', String(f.maxPrice));
    if (f.fuelType) p.set('fuel', f.fuelType);
    if (f.minSeats) p.set('seats', String(f.minSeats));
    if (f.brand) p.set('brand', f.brand);
    if (f.features && f.features.length > 0) p.set('features', f.features.join(','));
    router.push(`/cars${p.toString() ? '?' + p.toString() : ''}`);
    setState('idle');
    setQuery('');
    setResult(null);
  }

  function handleFollowUp() {
    if (!followUp.trim()) return;
    const combined = `${query} ${followUp}`.trim();
    setQuery(combined);
    setFollowUp('');
    runSearch(combined);
  }

  function handleReset() {
    setState('idle');
    setQuery('');
    setResult(null);
    setFollowUp('');
    setError(false);
  }

  const chips = result ? buildChips(result.filters) : [];
  const placeholder = suggestions[placeholderIdx % suggestions.length];

  // ── Idle bar ─────────────────────────────────────────────────────────────
  if (state === 'idle') {
    return (
      <div ref={containerRef} className="mb-6">
        <button
          type="button"
          onClick={() => setState('expanded')}
          className="w-full group flex items-center gap-3 bg-white border border-slate-200 hover:border-primary/40 rounded-2xl px-4 py-3.5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-purple-600 shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-white text-[16px]">auto_awesome</span>
          </div>
          <span className="flex-1 text-left text-label-bold text-slate-400 font-medium truncate transition-opacity">
            {placeholder}
          </span>
          <span className="hidden md:flex items-center gap-1.5 shrink-0 text-[11px] font-bold text-primary bg-primary-fixed/20 px-2.5 py-1 rounded-full">
            <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
            {ui.badge}
          </span>
          <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-primary transition-colors shrink-0">arrow_forward</span>
        </button>
      </div>
    );
  }

  // ── Thinking state ────────────────────────────────────────────────────────
  if (state === 'thinking') {
    return (
      <div ref={containerRef} className="mb-6">
        <div className="bg-white border border-primary/20 rounded-2xl shadow-md overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-purple-600">
                <span className="material-symbols-outlined text-white text-[14px]">auto_awesome</span>
              </div>
              <span className="font-bold text-label-bold text-on-background">{ui.badge}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-label-sm text-secondary">{ui.thinking}</span>
              <ThinkingDots />
            </div>
          </div>
          <div className="px-4 py-3">
            <p className="text-label-sm text-slate-400 italic truncate">"{query}"</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Interpreted state ─────────────────────────────────────────────────────
  if (state === 'interpreted') {
    return (
      <div ref={containerRef} className="mb-6">
        <div className="bg-white border border-primary/20 rounded-2xl shadow-md overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-primary-fixed/20 to-transparent">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-purple-600">
              <span className="material-symbols-outlined text-white text-[14px]">auto_awesome</span>
            </div>
            <span className="font-bold text-label-bold text-primary">{ui.understood}</span>
          </div>

          <div className="px-4 py-3">
            {chips.length === 0 ? (
              <p className="text-label-sm text-secondary">{ui.empty}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {chips.map((chip, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 bg-primary-fixed/15 text-primary border border-primary/15 px-3 py-1.5 rounded-full text-label-sm font-semibold"
                  >
                    <span className="material-symbols-outlined text-[13px]">{chip.icon}</span>
                    {chip.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-surface-container-low/50">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-label-sm text-secondary font-semibold hover:text-on-background transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">edit</span>
              {ui.edit}
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-2 bg-primary-container text-white px-5 py-2.5 rounded-xl font-bold text-label-bold hover:bg-primary transition-colors active:scale-95 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">search</span>
              {ui.apply}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Question state ────────────────────────────────────────────────────────
  if (state === 'question' && result?.question) {
    const isCityQ = /city|town|location|ქალაქ|город/i.test(result.question);
    return (
      <div ref={containerRef} className="mb-6">
        <div className="bg-white border border-amber-200 rounded-2xl shadow-md overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-100 bg-amber-50/60">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-purple-600">
              <span className="material-symbols-outlined text-white text-[14px]">auto_awesome</span>
            </div>
            <span className="font-bold text-label-bold text-on-background">{ui.badge}</span>
          </div>

          <div className="px-4 py-3">
            <p className="text-label-bold text-on-background mb-3 flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">help_outline</span>
              {result.question}
            </p>

            {/* City quick-select — shows all Georgian cities */}
            {isCityQ && (
              <div className="flex flex-wrap gap-2 mb-3">
                {GEORGIAN_CITIES_EN.map(city => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      const combined = `${query} ${city}`.trim();
                      setQuery(combined);
                      setFollowUp('');
                      runSearch(combined);
                    }}
                    className="px-3 py-1.5 rounded-full border border-outline-variant text-label-sm font-semibold text-secondary hover:border-primary hover:text-primary transition-colors cursor-pointer"
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                ref={followUpRef}
                type="text"
                value={followUp}
                onChange={e => setFollowUp(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleFollowUp()}
                className="flex-1 rounded-xl border border-outline-variant px-3.5 py-2.5 text-label-bold font-semibold text-on-background outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed/30 placeholder:text-slate-400 transition"
                placeholder="…"
              />
              <button
                type="button"
                onClick={handleFollowUp}
                disabled={!followUp.trim()}
                className="flex items-center gap-1.5 bg-primary-container text-white px-4 py-2.5 rounded-xl font-bold text-label-bold hover:bg-primary transition-colors disabled:opacity-40 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span className="hidden sm:inline">{ui.answerBtn}</span>
              </button>
            </div>
          </div>

          <div className="px-4 py-2 border-t border-amber-100">
            <button type="button" onClick={handleReset} className="text-label-sm text-secondary hover:text-on-background transition cursor-pointer">
              ← {ui.edit}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Expanded state ────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="mb-6">
      <div className={`bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-200 ${
        error ? 'border border-error/40' : 'border border-primary/30 ring-2 ring-primary-fixed/20'
      }`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-purple-600 shadow-sm">
              <span className="material-symbols-outlined text-white text-[14px]">auto_awesome</span>
            </div>
            <div>
              <span className="font-bold text-label-bold text-on-background">{ui.badge}</span>
              <span className="ml-2 text-[11px] text-secondary">{ui.badgeSub}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-green-600 hidden sm:inline">AI Ready</span>
            <button
              type="button"
              onClick={handleReset}
              className="ml-2 flex items-center justify-center w-7 h-7 rounded-full hover:bg-surface-container-low transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-400">close</span>
            </button>
          </div>
        </div>

        <div className="px-4 pt-3 pb-2">
          {error && (
            <p className="text-label-sm text-error mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">error</span>
              Search failed. Please try again.
            </p>
          )}
          <textarea
            ref={textareaRef}
            rows={2}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full resize-none border-none p-0 focus:ring-0 font-semibold text-on-background text-[15px] placeholder:text-slate-400 bg-transparent outline-none leading-relaxed"
          />
          <p className="text-[11px] text-slate-400 mt-1">{ui.hint} · Enter ↵</p>
        </div>

        <div className="flex items-center justify-end px-4 py-2.5 border-t border-slate-100 bg-surface-container-low/30">
          <button
            type="button"
            onClick={() => runSearch(query)}
            disabled={!query.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-5 py-2.5 rounded-xl font-bold text-label-bold hover:opacity-90 transition-all active:scale-95 disabled:opacity-40 cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
            {ui.apply}
          </button>
        </div>
      </div>
    </div>
  );
}
