'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/lang-provider';

// ─── OTP Input (same component pattern as register) ───────────
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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useLang();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const ic = 'w-full rounded-xl border border-outline-variant bg-white px-4 py-3.5 text-label-bold outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary-fixed';

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = (data as any).error;
        setError(err === 'no_account' ? t.auth.forgotPasswordNoAccount : 'Something went wrong.');
        return;
      }
      setSentEmail(email);
      setResendCooldown(60);
      setStep('code');
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
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sentEmail }),
      });
    } catch {
      // silently fail
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) { setError(t.auth.passwordMismatch); return; }
    if (otp.length < 6) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sentEmail, code: otp, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = (data as any).error;
        if (err === 'expired_code') setError(t.auth.forgotPasswordExpired);
        else if (err === 'invalid_code') setError(t.auth.forgotPasswordInvalidCode);
        else setError('Something went wrong.');
        setOtp('');
        return;
      }
      setSuccessMsg(t.auth.forgotPasswordSuccess);
      setTimeout(() => router.push('/login'), 2000);
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center pt-[62px] md:pt-[73px] bg-surface px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center">
          <span className="text-2xl font-black text-on-background">WAYGO<span className="text-primary">.ge</span></span>
        </Link>

        {/* ── STEP 1: EMAIL ──────────────────────────────────── */}
        {step === 'email' && (
          <>
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-fixed/30">
                <span className="material-symbols-outlined text-primary text-[32px]">lock_reset</span>
              </div>
              <h1 className="text-h1 font-extrabold text-on-background">{t.auth.forgotPasswordTitle}</h1>
              <p className="mt-2 text-secondary text-body-md">{t.auth.forgotPasswordSub}</p>
            </div>

            {error && (
              <div className="mb-5 flex items-center gap-3 rounded-xl bg-error-container/40 px-4 py-3">
                <span className="material-symbols-outlined text-error text-[18px]">error</span>
                <p className="text-label-bold font-semibold text-error">{error}</p>
              </div>
            )}

            <form onSubmit={handleSendCode} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-label-bold font-bold text-on-background">{t.auth.forgotPasswordEmailLabel}</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className={ic}
                  placeholder="name@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-container py-3.5 font-bold text-label-bold text-white transition hover:bg-primary active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <><span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>{t.auth.forgotPasswordSending}</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">send</span>{t.auth.forgotPasswordSendBtn}</>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-label-bold text-secondary">
              <Link href="/login" className="font-bold text-primary hover:underline">{t.auth.backToLogin}</Link>
            </p>
          </>
        )}

        {/* ── STEP 2: CODE + NEW PASSWORD ────────────────────── */}
        {step === 'code' && (
          <>
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-fixed/30">
                <span className="material-symbols-outlined text-primary text-[32px]">mark_email_read</span>
              </div>
              <h1 className="text-h1 font-extrabold text-on-background">{t.auth.forgotPasswordTitle}</h1>
              <p className="mt-2 text-secondary text-body-md">{t.auth.forgotPasswordCodeSent(sentEmail)}</p>
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

            <form onSubmit={handleReset} className="space-y-6">
              <div>
                <p className="mb-4 text-center text-label-bold font-bold text-on-background">{t.auth.forgotPasswordCodeLabel}</p>
                <OtpInput value={otp} onChange={setOtp} disabled={loading} />
              </div>

              <div>
                <label className="mb-1.5 block text-label-bold font-bold text-on-background">{t.auth.forgotPasswordNewPassword}</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className={`${ic} pr-12`}
                    placeholder="min. 8 chars"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-on-background transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[20px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-label-bold font-bold text-on-background">{t.auth.forgotPasswordConfirmPassword}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className={ic}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-container py-3.5 font-bold text-label-bold text-white transition hover:bg-primary active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <><span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>{t.auth.forgotPasswordResetting}</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">lock_reset</span>{t.auth.forgotPasswordResetBtn}</>
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
        )}
      </div>
    </div>
  );
}
