'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLang } from '@/components/lang-provider';

type Msg = {
  role: 'user' | 'assistant';
  content: string;
};

const COPY = {
  en: {
    label: 'AI Support',
    online: '24/7 online',
    title: 'WAYGO AI Support',
    subtitle: 'Ask about rentals, rules, insurance, bookings or your account.',
    welcome:
      'Hello! I can help with WAYGO rules, rentals, insurance, cancellations and bookings.',
    input: 'Ask a question…',
    send: 'Send',
    thinking: 'Thinking…',
    error: 'Something went wrong. Please try again.',
    escalated:
      'Your request has been sent to WAYGO support. Please wait for the support team. You can continue chatting here.',
  },
  ka: {
    label: 'AI მხარდაჭერა',
    online: '24/7 ონლაინ',
    title: 'WAYGO AI მხარდაჭერა',
    subtitle: '',
    welcome:
      'გამარჯობა! შემიძლია დაგეხმარო WAYGO-ს წესებში, გაქირავებაში, დაზღვევაში, გაუქმებაში და ჯავშნებში.',
    input: 'დასვი კითხვა…',
    send: 'გაგზავნა',
    thinking: 'ვფიქრობ…',
    error: 'შეცდომა მოხდა. სცადე თავიდან.',
    escalated:
      'მოთხოვნა გაგზავნილია WAYGO support-თან. გთხოვთ დაელოდოთ მხარდაჭერის გუნდს. შეგიძლია აქვე გააგრძელო კითხვა.',
  },
  ru: {
    label: 'AI поддержка',
    online: '24/7 онлайн',
    title: 'WAYGO AI поддержка',
    subtitle: 'Спросите про аренду, правила, страховку, бронирования или аккаунт.',
    welcome:
      'Здравствуйте! Я могу помочь с правилами WAYGO, арендой, страховкой, отменами и бронированиями.',
    input: 'Задайте вопрос…',
    send: 'Отправить',
    thinking: 'Думаю…',
    error: 'Что-то пошло не так. Попробуйте ещё раз.',
    escalated:
      'Запрос отправлен в поддержку WAYGO. Пожалуйста, дождитесь ответа команды. Вы можете продолжать писать здесь.',
  },
};

export function AISupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsEscalation, setNeedsEscalation] = useState(false);
  const [error, setError] = useState(false);

  const pathname = usePathname();
  const { data: session } = useSession();
  const { lang } = useLang();
  const t = COPY[lang] ?? COPY.en;

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLButtonElement>(null);

  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: t.welcome }]);
    }
  }, [open, messages.length, t.welcome]);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [open, messages, loading, needsEscalation, error]);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        floatRef.current && !floatRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  if (isAdmin) return null;

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setError(false);
    setLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: text }]);

    try {
      const res = await fetch('/api/support-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationId,
          lang,
          guestName: session?.user?.name ?? null,
          guestEmail: session?.user?.email ?? null,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || 'Support chat failed');
      }

      if (typeof data?.conversationId === 'string') {
        setConversationId(data.conversationId);
      }

      if (data?.needsEscalation && data?.escalationEmailSent !== false) {
        setNeedsEscalation(true);
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: typeof data?.reply === 'string' && data.reply.trim() ? data.reply : t.error,
        },
      ]);
    } catch (err) {
      console.error('AI support chat error:', err);

      setError(true);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: t.error,
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {open && (
        <div ref={panelRef} className="fixed inset-x-3 bottom-[92px] z-[80] mx-auto w-auto max-w-[430px] md:inset-auto md:right-6 md:bottom-28 md:w-[410px]">
          <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,.22)]">
            <div className="relative bg-gradient-to-br from-primary via-primary-container to-[#6d28d9] px-5 pb-5 pt-5 text-white">
              <div className="absolute right-4 top-4 h-20 w-20 rounded-full bg-white/10 blur-2xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
                    <span className="material-symbols-outlined text-[27px]">smart_toy</span>
                  </div>
                  <div>
                    <p className="text-[17px] font-black leading-tight">{t.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/90 transition hover:bg-white/20 cursor-pointer"
                    aria-label="Minimize AI support"
                  >
                    <span className="material-symbols-outlined text-[20px]">remove</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOpen(false); setMessages([]); setConversationId(null); setNeedsEscalation(false); setError(false); }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/90 transition hover:bg-white/20 cursor-pointer"
                    aria-label="Close AI support"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              </div>
            </div>

            <div
              ref={listRef}
              className="h-[360px] overflow-y-auto bg-surface-container-lowest px-4 py-4 md:h-[390px]"
            >
              <div className="space-y-3">
                {messages.map((m, i) => (
                  <div
                    key={`${m.role}-${i}`}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[13px] font-semibold leading-6 ${
                        m.role === 'user'
                          ? 'rounded-br-md bg-primary-container text-white'
                          : 'rounded-bl-md border border-outline-variant/40 bg-surface-container-low text-on-background'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-[13px] font-semibold text-secondary">
                      {t.thinking}
                    </div>
                  </div>
                )}

                {needsEscalation && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] font-semibold leading-5 text-amber-900">
                    {t.escalated}
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl border border-error/20 bg-error-container/30 px-4 py-3 text-[12px] font-semibold text-error">
                    {t.error}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-outline-variant/40 bg-white p-3">
              <div className="flex items-center gap-2 rounded-2xl border border-outline-variant/60 bg-white px-3 py-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.input}
                  disabled={loading}
                  className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-on-background outline-none placeholder:text-slate-400 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={t.send}
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        ref={floatRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label={t.label}
        className="group fixed bottom-[86px] right-4 z-[79] flex items-center gap-2 rounded-full bg-gradient-to-r from-primary via-primary-container to-[#6d28d9] p-1.5 pr-4 text-white shadow-[0_16px_50px_rgba(0,74,198,.38)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_65px_rgba(0,74,198,.48)] active:scale-95 cursor-pointer md:bottom-7 md:right-7"
      >
        <span className="relative flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25 backdrop-blur">
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-tertiary-fixed" />
          <span className="material-symbols-outlined text-[28px] transition-transform duration-300 group-hover:scale-110">
            {open ? 'close' : 'support_agent'}
          </span>
        </span>

        <span className="hidden flex-col items-start leading-tight sm:flex">
          <span className="text-[13px] font-black">{t.label}</span>
          <span className="text-[10px] font-bold text-white/75">{t.online}</span>
        </span>
      </button>
    </>
  );
}