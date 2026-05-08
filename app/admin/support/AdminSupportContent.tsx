'use client';

import { useMemo, useState } from 'react';
import { MessageCircle, Send, XCircle, ChevronDown, ChevronRight, User, Bot, Shield, Clock, Search } from 'lucide-react';
import { useLang } from '@/components/lang-provider';

type SupportMessage = {
  id: string;
  sender: 'user' | 'assistant' | 'admin' | 'system';
  content: string;
  createdAt: string;
};

type SupportConversation = {
  id: string;
  userId: string | null;
  guestName: string | null;
  guestEmail: string | null;
  guestLang: string;
  status: 'open' | 'escalated' | 'closed';
  escalated: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string | null;
    role: string;
  } | null;
  messages: SupportMessage[];
};

type UserGroup = {
  key: string;
  name: string;
  email: string;
  isRegistered: boolean;
  conversations: SupportConversation[];
  escalatedCount: number;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString('ka-GE', {
    timeZone: 'Asia/Tbilisi',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function shortDate(value: string) {
  return new Date(value).toLocaleDateString('ka-GE', {
    timeZone: 'Asia/Tbilisi',
    month: 'short',
    day: '2-digit',
  });
}


function senderIcon(sender: SupportMessage['sender']) {
  if (sender === 'user') return User;
  if (sender === 'assistant') return Bot;
  if (sender === 'admin') return Shield;
  return Clock;
}

export function AdminSupportContent({
  initialConversations,
}: {
  initialConversations: SupportConversation[];
}) {
  const { t } = useLang();
  const [conversations, setConversations] = useState(initialConversations);
  const [openUsers, setOpenUsers] = useState<Record<string, boolean>>({});
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    initialConversations[0]?.id ?? null
  );
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [search, setSearch] = useState('');

  function senderLabel(sender: SupportMessage['sender']) {
    if (sender === 'user') return t.admin.supportChatSenderUser;
    if (sender === 'assistant') return t.admin.supportChatSenderAI;
    if (sender === 'admin') return t.admin.supportChatSenderAdmin;
    return t.admin.supportChatSenderSystem;
  }

  const groups = useMemo<UserGroup[]>(() => {
    const map = new Map<string, UserGroup>();

    conversations.forEach(c => {
      const key =
        c.user?.id ||
        c.guestEmail ||
        c.guestName ||
        `guest-${c.id}`;

      const name =
        c.user?.fullName ||
        c.guestName ||
        t.admin.supportChatAnonymousGuest;

      const email =
        c.user?.email ||
        c.guestEmail ||
        t.admin.supportChatNoEmail;

      if (!map.has(key)) {
        map.set(key, {
          key,
          name,
          email,
          isRegistered: Boolean(c.user),
          conversations: [],
          escalatedCount: 0,
        });
      }

      const group = map.get(key)!;
      group.conversations.push(c);
if (c.escalated) group.escalatedCount += 1;
    });

return Array.from(map.values())
  .map(g => ({
    ...g,
    conversations: g.conversations.sort((a, b) =>
      Number(b.escalated || b.status === 'escalated') -
        Number(a.escalated || a.status === 'escalated') ||
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ),
  }))
  .sort((a, b) =>
    b.escalatedCount - a.escalatedCount ||
    new Date(b.conversations[0]?.updatedAt ?? 0).getTime() -
      new Date(a.conversations[0]?.updatedAt ?? 0).getTime()
  );
  }, [conversations, t]);
  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;

    return groups.filter(group => {
      const name = group.name.toLowerCase();
      const email = group.email.toLowerCase();

      return name.includes(q) || email.includes(q);
    });
  }, [groups, search]);
  const selectedConversation =
    conversations.find(c => c.id === selectedConversationId) ?? null;

  async function sendAdminMessage() {
    if (!selectedConversation || !draft.trim() || sending) return;

    const text = draft.trim();
    setDraft('');
    setSending(true);

    try {
      const res = await fetch(`/api/admin/support-conversations/${selectedConversation.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to send message');
      }

      setConversations(prev =>
        prev.map(c =>
          c.id === selectedConversation.id
            ? {
                ...c,
                status: 'escalated',
                escalated: false,
                updatedAt: new Date().toISOString(),
                messages: [
                  ...c.messages,
                  {
                    id: data.message.id,
                    sender: data.message.sender,
                    content: data.message.content,
                    createdAt: data.message.createdAt,
                  },
                ],
              }
            : c
        )
      );
    } catch (err) {
      console.error('Admin support send error:', err);
      alert(t.admin.supportChatSendError);
      setDraft(text);
    } finally {
      setSending(false);
    }
  }

  async function closeConversation() {
    if (!selectedConversation || closing) return;

    const ok = window.confirm(t.admin.supportChatConfirmClose);
    if (!ok) return;

    setClosing(true);

    try {
      const res = await fetch(`/api/admin/support-conversations/${selectedConversation.id}/close`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to close conversation');
      }

      setConversations(prev =>
        prev.map(c =>
          c.id === selectedConversation.id
            ? {
                ...c,
                status: 'closed',
                escalated: false,
                updatedAt: data.conversation.updatedAt,
                messages: [
                  ...c.messages,
                  {
                    id: `system-${Date.now()}`,
                    sender: 'system',
                    content: t.admin.supportChatClosedByAdmin,
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : c
        )
      );
    } catch (err) {
      console.error('Admin support close error:', err);
      alert(t.admin.supportChatCloseError);
    } finally {
      setClosing(false);
    }
  }

  function toggleUser(key: string) {
    setOpenUsers(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  return (
    <div className="space-y-5 md:space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-[22px] md:text-3xl font-black text-slate-950">
            {t.admin.supportChatTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t.admin.supportChatSub}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 md:flex">
          <div className="rounded-2xl border bg-white px-4 py-3 shadow-soft">
            <p className="text-xs font-bold text-slate-400">{t.admin.supportChatUsers}</p>
            <p className="text-2xl font-black text-slate-950">{groups.length}</p>
          </div>
          <div className="rounded-2xl border bg-white px-4 py-3 shadow-soft">
            <p className="text-xs font-bold text-slate-400">{t.admin.supportChatEscalated}</p>
            <p className="text-2xl font-black text-red-600">
{conversations.filter(c => c.escalated).length}
            </p>
          </div>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-3xl border bg-white p-10 text-center shadow-soft">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <MessageCircle size={30} className="text-slate-400" />
          </div>
          <p className="font-black text-slate-900">{t.admin.supportChatNone}</p>
          <p className="mt-1 text-sm text-slate-500">
            {t.admin.supportChatNoneSub}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[390px_1fr]">
          <div className="space-y-3">
            <div className="rounded-3xl border bg-white p-3 shadow-soft">

  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
    <Search size={17} className="text-slate-400" />
    <input
      value={search}
      onChange={e => setSearch(e.target.value)}
      placeholder={t.admin.supportChatSearch}
      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
    />
  </div>
            </div>

            {filteredGroups.length === 0 ? (
              <div className="rounded-3xl border bg-white p-6 text-center text-sm font-semibold text-slate-500 shadow-soft">
                {t.admin.supportChatNoResults}
              </div>
            ) : (
              filteredGroups.map(group => {
                  const isOpen = openUsers[group.key] ?? group.escalatedCount > 0;
              const latest = group.conversations[0];

              return (
                <div key={group.key} className="overflow-hidden rounded-3xl border bg-white shadow-soft">
                  <button
                    type="button"
                    onClick={() => toggleUser(group.key)}
                    className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-slate-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
                      <User size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-black text-slate-950">{group.name}</p>
                        {group.escalatedCount > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-black text-white">
                            {group.escalatedCount > 9 ? '9+' : group.escalatedCount}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-slate-500">{group.email}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {group.conversations.length} {t.admin.supportChatSession} · {t.admin.supportChatLast}: {shortDate(latest.updatedAt)}
                      </p>
                    </div>

                    {isOpen ? (
                      <ChevronDown size={17} className="text-slate-400" />
                    ) : (
                      <ChevronRight size={17} className="text-slate-400" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="border-t bg-slate-50/70 p-2">
                      {group.conversations.map((c, index) => {
                        const selected = selectedConversationId === c.id;
                        const lastMessage = c.messages[c.messages.length - 1];

                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setSelectedConversationId(c.id)}
                            className={`mb-2 flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition last:mb-0 ${
                              selected
                                ? 'border-primary/30 bg-white ring-2 ring-primary-fixed/40'
                                : 'border-transparent bg-white hover:border-slate-200'
                            }`}
                          >
                            <div
                              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                                c.status === 'closed'
                                  ? 'bg-slate-100 text-slate-400'
                                  : c.escalated
                                  ? 'bg-red-50 text-red-600'
                                  : 'bg-blue-50 text-blue-600'
                              }`}
                            >
                              <MessageCircle size={16} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-black text-slate-900">
                                  {t.admin.supportChatSessionLabel} #{group.conversations.length - index}
                                </p>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                    c.status === 'closed'
                                      ? 'bg-slate-100 text-slate-500'
                                      : c.escalated
                                      ? 'bg-red-50 text-red-700'
                                      : 'bg-blue-50 text-blue-700'
                                  }`}
                                >
                                  {c.status}
                                </span>
                              </div>
                              <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                {lastMessage?.content || t.admin.supportChatNoMessages}
                              </p>
                              <p className="mt-1 text-[11px] text-slate-400">
                                {formatDate(c.updatedAt)}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
              })
            )}
          </div>

          <div className="min-h-[620px] overflow-hidden rounded-3xl border bg-white shadow-soft">
            {!selectedConversation ? (
              <div className="flex h-full min-h-[620px] flex-col items-center justify-center p-10 text-center">
                <MessageCircle size={42} className="mb-4 text-slate-300" />
                <p className="font-black text-slate-900">{t.admin.supportChatSelect}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {t.admin.supportChatSelectSub}
                </p>
              </div>
            ) : (
              <div className="flex h-full min-h-[620px] flex-col">
                <div className="flex flex-col gap-3 border-b bg-slate-50 px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-black text-slate-950">
                        {selectedConversation.user?.fullName ||
                          selectedConversation.guestName ||
                          t.admin.supportChatAnonymousGuest}
                      </h2>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                          selectedConversation.status === 'closed'
                            ? 'bg-slate-100 text-slate-500'
                            : selectedConversation.escalated
                            ? 'bg-red-50 text-red-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {selectedConversation.status}
                      </span>

                      {selectedConversation.escalated && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-black text-white">
                          {t.admin.supportChatNeedsAction}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 truncate text-sm text-slate-500">
                      {selectedConversation.user?.email ||
                        selectedConversation.guestEmail ||
                        t.admin.supportChatNoEmail}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Session ID: {selectedConversation.id}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeConversation}
                    disabled={selectedConversation.status === 'closed' || closing}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <XCircle size={16} />
                    {selectedConversation.status === 'closed'
                      ? t.admin.supportChatClosed
                      : closing
                      ? t.admin.supportChatClosing
                      : t.admin.supportChatClose}
                  </button>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 px-4 py-5">
                  {selectedConversation.messages.length === 0 ? (
                    <p className="text-sm text-slate-400">{t.admin.supportChatNoMessages}</p>
                  ) : (
                    selectedConversation.messages.map(message => {
                      const Icon = senderIcon(message.sender);

                      return (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender === 'user'
                              ? 'justify-start'
                              : message.sender === 'admin'
                              ? 'justify-end'
                              : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                              message.sender === 'user'
                                ? 'rounded-bl-md bg-white text-slate-900 border'
                                : message.sender === 'admin'
                                ? 'rounded-br-md bg-primary-container text-white'
                                : message.sender === 'assistant'
                                ? 'rounded-bl-md bg-slate-900 text-white'
                                : 'rounded-xl border border-amber-200 bg-amber-50 text-amber-900'
                            }`}
                          >
                            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-black uppercase opacity-70">
                              <Icon size={12} />
                              {senderLabel(message.sender)} · {formatDate(message.createdAt)}
                            </div>
                            {message.content}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="border-t bg-white p-4">
                  {selectedConversation.status === 'closed' ? (
                    <div className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
                      {t.admin.supportChatClosedNotice}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <textarea
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendAdminMessage();
                          }
                        }}
                        rows={2}
                        placeholder={t.admin.supportChatPlaceholder}
                        className="min-h-[48px] flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-fixed/40"
                      />
                      <button
                        type="button"
                        onClick={sendAdminMessage}
                        disabled={!draft.trim() || sending}
                        className="flex w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  )}

                  {selectedConversation.status !== 'closed' && (
                    <p className="mt-2 text-xs text-slate-400">
                      {t.admin.supportChatKeyHint}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}