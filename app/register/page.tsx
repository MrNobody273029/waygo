'use client';
import { useState, useRef, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLang } from '@/components/lang-provider';

const COUNTRIES = [
  { code: 'GE', en: 'Georgia', ka: 'საქართველო', ru: 'Грузия' },
  { code: 'US', en: 'United States', ka: 'აშშ', ru: 'США' },
  { code: 'DE', en: 'Germany', ka: 'გერმანია', ru: 'Германия' },
  { code: 'FR', en: 'France', ka: 'საფრანგეთი', ru: 'Франция' },
  { code: 'GB', en: 'United Kingdom', ka: 'გაერთიანებული სამეფო', ru: 'Великобритания' },
  { code: 'TR', en: 'Turkey', ka: 'თურქეთი', ru: 'Турция' },
  { code: 'AZ', en: 'Azerbaijan', ka: 'აზერბაიჯანი', ru: 'Азербайджан' },
  { code: 'AM', en: 'Armenia', ka: 'სომხეთი', ru: 'Армения' },
  { code: 'UA', en: 'Ukraine', ka: 'უკრაინა', ru: 'Украина' },
  { code: 'PL', en: 'Poland', ka: 'პოლონეთი', ru: 'Польша' },
  { code: 'IL', en: 'Israel', ka: 'ისრაელი', ru: 'Израиль' },
  { code: 'RU', en: 'Russia', ka: 'რუსეთი', ru: 'Россия' },
  { code: 'OTHER', en: 'Other', ka: 'სხვა', ru: 'Другое' },
];

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  idNumber: string;
  country: string;
  birthDate: string;
  password: string;
  confirmPassword: string;
};

// ─── OTP Input Component ───────────────────────────────────────
function OtpInput({ value, onChange, disabled }: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
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
        const next = digits.map((c, idx) => (idx === i - 1 ? '' : c)).join('');
        onChange(next);
        refs.current[i - 1]?.focus();
      } else {
        const next = digits.map((c, idx) => (idx === i ? '' : c)).join('');
        onChange(next);
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < 5) {
      refs.current[i + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted.padEnd(6, '').slice(0, 6));
      const focus = Math.min(pasted.length, 5);
      refs.current[focus]?.focus();
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

// ─── Main Page ─────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    phone: '',
    idNumber: '',
    country: 'GE',
    birthDate: '',
    password: '',
    confirmPassword: '',
  });
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [registeredPassword, setRegisteredPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  // ─── Step 1: Register ────────────────────────────────────────
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError(t.auth.passwordMismatch);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          idNumber: form.idNumber,
          country: form.country,
          birthDate: form.birthDate,
          lang,
          password: form.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMsg = res.status === 409
          ? ((data as any).error === 'ID number already registered' ? t.auth.idTaken : t.auth.emailTaken)
          : ((data as any).error || 'Registration failed');
        setError(errMsg);
        return;
      }
      setRegisteredEmail(form.email);
      setRegisteredPassword(form.password);
      setResendCooldown(60);
      setStep('otp');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ─── Step 2: Verify OTP ──────────────────────────────────────
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length < 6) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail, code: otp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = (data as any).error;
        setError(err === 'expired_code' ? t.auth.verifyEmailExpired : t.auth.verifyEmailInvalidCode);
        setOtp('');
        return;
      }
      setSuccessMsg(t.auth.verifyEmailSuccess);
      await signIn('credentials', { email: registeredEmail, password: registeredPassword, redirect: false });
      router.push('/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setError('');
    setResendCooldown(60);
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail }),
      });
    } catch {
      // silently fail
    }
  }

  function countryLabel(c: typeof COUNTRIES[0]) {
    if (lang === 'ka') return c.ka;
    if (lang === 'ru') return c.ru;
    return c.en;
  }

  const ic = 'w-full rounded-xl border border-outline-variant bg-white px-4 py-3.5 text-label-bold outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary-fixed';

  const registerFeatures = [
    { icon: 'verified_user', text: t.auth.registerFeature1 },
    { icon: 'lock', text: t.auth.registerFeature2 },
    { icon: 'badge', text: t.auth.registerFeature3 },
    { icon: 'support_agent', text: t.auth.registerFeature4 },
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row pt-[62px] md:pt-[73px]">
      {/* Left panel */}
      <div className="hidden md:flex md:w-[40%] flex-col justify-between bg-on-background p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#1d4ed820,_transparent_60%),radial-gradient(ellipse_at_bottom_left,_#00624220,_transparent_60%)]" />
        <Link href="/" className="relative z-10 text-2xl font-black text-white">
          WAYGO<span className="text-primary-fixed-dim">.ge</span>
        </Link>
        <div className="relative z-10 space-y-5">
          <p className="text-3xl font-extrabold leading-tight text-white">{t.auth.registerLeftTitle}</p>
          <ul className="space-y-3">
            {registerFeatures.map(f => (
              <li key={f.icon} className="flex items-center gap-3 text-slate-300 text-label-bold">
                <span className="material-symbols-outlined text-primary-fixed-dim text-[18px]">{f.icon}</span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 text-label-sm text-slate-600">© {new Date().getFullYear()} WAYGO Georgia</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto bg-surface px-4 py-12 md:px-12">
        <div className="w-full max-w-lg">
          <Link href="/" className="mb-8 flex items-center justify-center md:hidden">
            <span className="text-2xl font-black text-on-background">WAYGO<span className="text-primary">.ge</span></span>
          </Link>

          {/* ── STEP 1: REGISTRATION FORM ───────────────────── */}
          {step === 'form' && (
            <>
              <div className="mb-8">
                <h1 className="text-h1 font-extrabold text-on-background">{t.auth.registerTitle}</h1>
                <p className="mt-2 text-secondary text-body-md">{t.auth.registerSub}</p>
              </div>

              {error && (
                <div className="mb-5 flex items-center gap-3 rounded-xl bg-error-container/40 px-4 py-3">
                  <span className="material-symbols-outlined text-error text-[18px]">error</span>
                  <p className="text-label-bold font-semibold text-error">{error}</p>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t.auth.fullName}>
                    <input type="text" value={form.fullName} onChange={set('fullName')} required className={ic} placeholder="Nika Beridze" autoComplete="name" />
                  </Field>
                  <Field label={t.auth.email}>
                    <input type="email" value={form.email} onChange={set('email')} required className={ic} placeholder="name@example.com" autoComplete="email" />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t.auth.phone}>
                    <input type="tel" value={form.phone} onChange={set('phone')} required className={ic} placeholder="+995 5XX XXX XXX" autoComplete="tel" />
                  </Field>
                  <Field label={t.auth.country}>
                    <select value={form.country} onChange={set('country')} className={ic}>
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>{countryLabel(c)}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t.auth.idNumber}>
                    <input type="text" value={form.idNumber} onChange={set('idNumber')} required className={ic} placeholder="01234567890" autoComplete="off" />
                  </Field>
                  <Field label={t.auth.birthDate}>
                    <div className="relative">
                      <input
                        type="date"
                        value={form.birthDate}
                        onChange={set('birthDate')}
                        required
                        max={new Date().toISOString().split('T')[0]}
                        min="1900-01-01"
                        className={`${ic} text-on-background`}
                      />
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                        <span className="material-symbols-outlined text-[18px] text-slate-400">cake</span>
                      </span>
                    </div>
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t.auth.password}>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={form.password}
                        onChange={set('password')}
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
                  </Field>
                  <Field label={t.auth.confirmPassword}>
                    <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} required className={ic} autoComplete="new-password" placeholder="••••••••" />
                  </Field>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-container py-3.5 font-bold text-label-bold text-white transition hover:bg-primary active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <><span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>{t.common.loading}</>
                  ) : (
                    <><span className="material-symbols-outlined text-[18px]">person_add</span>{t.auth.register}</>
                  )}
                </button>
              </form>

              <p className="mt-8 text-center text-label-bold text-secondary">
                {t.auth.hasAccount}{' '}
                <Link href="/login" className="font-bold text-primary hover:underline">{t.auth.signIn}</Link>
              </p>
            </>
          )}

          {/* ── STEP 2: OTP VERIFICATION ─────────────────────── */}
          {step === 'otp' && (
            <>
              <div className="mb-8 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-fixed/30">
                  <span className="material-symbols-outlined text-primary text-[32px]">mark_email_read</span>
                </div>
                <h1 className="text-h1 font-extrabold text-on-background">{t.auth.verifyEmailTitle}</h1>
                <p className="mt-2 text-secondary text-body-md">{t.auth.verifyEmailSub(registeredEmail)}</p>
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
                  {resendCooldown > 0
                    ? t.auth.verifyEmailResendCooldown(resendCooldown)
                    : t.auth.verifyEmailResend}
                </button>
              </div>

              <p className="mt-6 text-center text-label-bold text-secondary">
                <button onClick={() => { setStep('form'); setOtp(''); setError(''); }} className="font-bold text-primary hover:underline cursor-pointer">
                  ← {t.auth.backToLogin.replace('login', 'registration')}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-label-bold font-bold text-on-background">{label}</label>
      {children}
    </div>
  );
}
