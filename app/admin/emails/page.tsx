'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Mail,
  Send,
  Paperclip,
  Inbox,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  Loader2,
} from 'lucide-react';

type Attachment = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType?: string | null;
  fileSize?: number | null;
};

type AdminEmail = {
  id: string;
  from: string;
  to: string;
  cc?: string | null;
  bcc?: string | null;
  subject: string;
  body: string;
  status: 'sent' | 'failed';
  resendId?: string | null;
  createdAt: string;
  attachments: Attachment[];
};

const fromOptions = [
  'info@waygo.ge',
  'support@waygo.ge',
  'admin@waygo.ge',
  'no-reply@waygo.ge',
];

function formatDate(date: string) {
  return new Intl.DateTimeFormat('ka-GE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

function formatSize(bytes?: number | null) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function AdminEmailsPage() {
  const [emails, setEmails] = useState<AdminEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<AdminEmail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [from, setFrom] = useState('info@waygo.ge');
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const selectedFilesSize = useMemo(() => {
    return files.reduce((sum, file) => sum + file.size, 0);
  }, [files]);

  async function loadEmails() {
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/emails', {
        cache: 'no-store',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load emails.');
      }

      setEmails(data.emails || []);
      setSelectedEmail(data.emails?.[0] || null);
    } catch (err: any) {
      setError(err.message || 'Failed to load emails.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEmails();
  }, []);

  function resetForm() {
    setFrom('info@waygo.ge');
    setTo('');
    setCc('');
    setBcc('');
    setSubject('');
    setBody('');
    setFiles([]);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!to.trim() || !subject.trim() || !body.trim()) {
      setError('To, subject and message are required.');
      return;
    }

    setIsSending(true);

    try {
      const formData = new FormData();

      formData.append('from', from);
      formData.append('to', to);
      formData.append('cc', cc);
      formData.append('bcc', bcc);
      formData.append('subject', subject);
      formData.append('body', body);

      files.forEach(file => {
        formData.append('attachments', file);
      });

      const res = await fetch('/api/admin/emails', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send email.');
      }

      setEmails(prev => [data.email, ...prev]);
      setSelectedEmail(data.email);
      setSuccess('Email sent successfully.');
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to send email.');
    } finally {
      setIsSending(false);
    }
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
            Admin
          </p>
          <h1 className="text-[22px] md:text-3xl font-black text-slate-950">Emails</h1>
          <p className="mt-2 text-sm text-slate-600">
            Send manual emails from Waygo and keep sent messages in one place.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Sent</p>
            <p className="mt-1 text-2xl font-black text-slate-950">
              {emails.filter(email => email.status === 'sent').length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Failed</p>
            <p className="mt-1 text-2xl font-black text-slate-950">
              {emails.filter(email => email.status === 'failed').length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Files</p>
            <p className="mt-1 text-2xl font-black text-slate-950">
              {emails.reduce((sum, email) => sum + email.attachments.length, 0)}
            </p>
          </div>
        </div>
      </div>

      {(error || success) && (
        <div
          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${
            error
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {error || success}
        </div>
      )}

      <div className="grid gap-4 md:gap-6 xl:grid-cols-[minmax(420px,0.9fr)_minmax(0,1.3fr)]">
        <form
          onSubmit={handleSend}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Send size={19} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-950">Compose</h2>
              <p className="text-sm text-slate-500">Send from Waygo domain.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">
                From
              </span>
              <select
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
              >
                {fromOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">
                To
              </span>
              <input
                value={to}
                onChange={e => setTo(e.target.value)}
                placeholder="client@example.com, partner@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">
                  CC
                </span>
                <input
                  value={cc}
                  onChange={e => setCc(e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">
                  BCC
                </span>
                <input
                  value={bcc}
                  onChange={e => setBcc(e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">
                Subject
              </span>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Email subject"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">
                Message
              </span>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Write your message..."
                rows={10}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
              />
            </label>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                    <Paperclip size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      Attach files
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      Images, PDFs, documents. Stored in Cloudinary.
                    </p>
                  </div>
                </div>

                <span className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white">
                  Browse
                </span>

                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={e => {
                    const selected = Array.from(e.target.files || []);
                    setFiles(prev => [...prev, ...selected]);
                    e.target.value = '';
                  }}
                />
              </label>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>{files.length} selected</span>
                    <span>{formatSize(selectedFilesSize)}</span>
                  </div>

                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm shadow-sm"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText size={16} className="shrink-0 text-slate-500" />
                        <span className="truncate font-semibold text-slate-800">
                          {file.name}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send email
                </>
              )}
            </button>
          </div>
        </form>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Inbox size={18} className="text-slate-500" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-700">
                  Sent emails
                </h2>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
                {emails.length}
              </span>
            </div>

            <div className="max-h-[760px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 p-8 text-sm font-semibold text-slate-500">
                  <Loader2 size={18} className="animate-spin" />
                  Loading emails...
                </div>
              ) : emails.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <Mail size={20} />
                  </div>
                  <p className="mt-3 text-sm font-black text-slate-800">
                    No sent emails yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Sent messages will appear here.
                  </p>
                </div>
              ) : (
                emails.map(email => {
                  const active = selectedEmail?.id === email.id;

                  return (
                    <button
                      key={email.id}
                      type="button"
                      onClick={() => setSelectedEmail(email)}
                      className={`block w-full border-b border-slate-100 px-5 py-4 text-left transition ${
                        active ? 'bg-slate-950 text-white' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p
                            className={`truncate text-sm font-black ${
                              active ? 'text-white' : 'text-slate-950'
                            }`}
                          >
                            {email.subject}
                          </p>
                          <p
                            className={`mt-1 truncate text-xs font-semibold ${
                              active ? 'text-slate-300' : 'text-slate-500'
                            }`}
                          >
                            To: {email.to}
                          </p>
                        </div>

                        {email.status === 'sent' ? (
                          <CheckCircle2
                            size={16}
                            className={active ? 'text-emerald-300' : 'text-emerald-500'}
                          />
                        ) : (
                          <AlertCircle
                            size={16}
                            className={active ? 'text-red-300' : 'text-red-500'}
                          />
                        )}
                      </div>

                      <div
                        className={`mt-3 flex items-center gap-3 text-xs ${
                          active ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <Clock size={13} />
                          {formatDate(email.createdAt)}
                        </span>

                        {email.attachments.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Paperclip size={13} />
                            {email.attachments.length}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            {selectedEmail ? (
              <div className="p-6">
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-black ${
                            selectedEmail.status === 'sent'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {selectedEmail.status}
                        </span>

                        {selectedEmail.resendId && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                            Resend ID
                          </span>
                        )}
                      </div>

                      <h2 className="mt-3 text-2xl font-black text-slate-950">
                        {selectedEmail.subject}
                      </h2>
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User size={15} className="text-slate-400" />
                      <span className="w-14 font-black text-slate-500">From</span>
                      <span className="font-semibold text-slate-900">
                        {selectedEmail.from}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User size={15} className="text-slate-400" />
                      <span className="w-14 font-black text-slate-500">To</span>
                      <span className="font-semibold text-slate-900">
                        {selectedEmail.to}
                      </span>
                    </div>

                    {selectedEmail.cc && (
                      <div className="flex items-center gap-2">
                        <User size={15} className="text-slate-400" />
                        <span className="w-14 font-black text-slate-500">CC</span>
                        <span className="font-semibold text-slate-900">
                          {selectedEmail.cc}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Clock size={15} className="text-slate-400" />
                      <span className="w-14 font-black text-slate-500">Date</span>
                      <span className="font-semibold text-slate-900">
                        {formatDate(selectedEmail.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="prose prose-slate mt-6 max-w-none whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {selectedEmail.body}
                </div>

                {selectedEmail.attachments.length > 0 && (
                  <div className="mt-8">
                    <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-slate-500">
                      Attachments
                    </h3>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {selectedEmail.attachments.map(file => (
                        <a
                          key={file.id}
                          href={file.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-slate-300 hover:bg-white"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
                            <FileText size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-900">
                              {file.fileName}
                            </p>
                            <p className="text-xs font-semibold text-slate-500">
                              {formatSize(file.fileSize)}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <Mail size={22} />
                </div>
                <h2 className="mt-4 text-lg font-black text-slate-950">
                  Select an email
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Sent email details will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}