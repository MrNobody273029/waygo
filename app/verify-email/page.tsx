'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLang } from '@/components/lang-provider';

function OtpInput({ value, onChange, disabled }: {
  value: string; onChange: (v: string) => void; disabled?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(6, '').split('').slice(0, 6);

  function handleChange(i: number, v: string) {
    const d = v.replace(/\D/g, '').slice(-1);
    const next = digits.map((c, idx) => (idx === i ? d : c)).join('').slice(0, 6);
    onChange(next);
    if (d && i < 5) refs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (!digits[i] && i > 0) {
        onChange(digits.map((c, idx) => (idx === i - 1 ? '' : c)).join(''));
        refs.current[i - 1]?.focus();
      } else {
        onChange(digits.map((c, idx) => (idx === i ? '' : c)).join(''));
      }
    } else if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted.padEnd(6, '').slice(0, 6));
      refs.current[Math.min(pasted.length, 5)]?.focus();
      e.preventDefault();
    }
  }

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          disabled={disabled}
          className="w-12 h-14 rounded-xl border-2 border-outline-variant bg-white text-center text-2xl font-black text-on-background outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-fixed disabled:opacity-50 caret-transparent"
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const { t } = useLang();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') ?? '';

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [needsPassword, setNeedsPassword] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const ic = 'w-full rounded-xl border border-outline-variant bg-white px-4 py-3.5 text-label-bold outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary-fixed';

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length < 6) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = (data as any).error;
        setError(err === 'expired_code' ? t.auth.verifyEmailExpired : t.auth.verifyEmailInvalidCode);
        setOtp('');
        return;
      }
      setSuccessMsg(t.auth.verifyEmailSuccess);
      if (password) {
        await signIn('credentials', { email, password, redirect: false });
        router.push('/dashboard');
      } else {
        setNeedsPassword(true);
        setSuccessMsg('');
      }
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setResendCooldown(60);
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch {
      // silently fail
    }
  }

  if (needsPassword) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-tertiary-fixed/30">
          <span className="material-symbols-outlined text-tertiary text-[32px]">verified</span>
        </div>
        <h1 className="text-h1 font-extrabold text-on-background">{t.auth.verifyEmailSuccess}</h1>
        <p className="text-secondary">{t.auth.signIn}</p>
        <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-primary-container px-8 py-3.5 font-bold text-white hover:bg-primary transition">
          <span className="material-symbols-outlined text-[18px]">login</span>
          {t.auth.login}
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-fixed/30">
          <span className="material-symbols-outlined text-primary text-[32px]">mark_email_read</span>
        </div>
        <h1 className="text-h1 font-extrabold text-on-background">{t.auth.verifyEmailTitle}</h1>
        {email && <p className="mt-2 text-secondary text-body-md">{t.auth.verifyEmailSub(email)}</p>}
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-xl bg-error-container/40 px-4 py-3">
          <span className="material-symbols-outlined text-error text-[18px]">error</span>
          <p className="text-label-bold font-semibold text-error">{error}</p>
        </div>
      )}
      {successMsg && (
        <div className="mb-5 flex items-center gap-3 rounded-xl bg-tertiary-fixed/30 px-4 py-3">
          <span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
          <p className="text-label-bold font-semibold text-tertiary">{successMsg}</p>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        {!emailParam && (
          <div>
            <label className="mb-1.5 block text-label-bold font-bold text-on-background">{t.auth.email}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={ic} placeholder="name@example.com" />
          </div>
        )}

        <div>
          <p className="mb-4 text-center text-label-bold font-bold text-on-background">{t.auth.verifyEmailCodeLabel}</p>
          <OtpInput value={otp} onChange={setOtp} disabled={loading} />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length < 6}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-container py-3.5 font-bold text-label-bold text-white transition hover:bg-primary active:scale-95 disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <><span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>{t.auth.verifyEmailVerifying}</>
          ) : (
            <><span className="material-symbols-outlined text-[18px]">verified</span>{t.auth.verifyEmailBtn}</>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="text-label-bold font-semibold text-primary hover:underline disabled:text-slate-400 disabled:no-underline cursor-pointer"
        >
          {resendCooldown > 0 ? t.auth.verifyEmailResendCooldown(resendCooldown) : t.auth.verifyEmailResend}
        </button>
      </div>

      <p className="mt-6 text-center text-label-bold text-secondary">
        <Link href="/login" className="font-bold text-primary hover:underline">{t.auth.backToLogin}</Link>
      </p>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center pt-[62px] md:pt-[73px] bg-surface px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center">
          <span className="text-2xl font-black text-on-background">WAYGO<span className="text-primary">.ge</span></span>
        </Link>
        <Suspense>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
