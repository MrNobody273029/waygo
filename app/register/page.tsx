'use client';
import { useState } from 'react';
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
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    phone: '',
    idNumber: '',
    country: 'GE',
    password: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
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
          idNumber: form.idNumber || undefined,
          country: form.country,
          password: form.password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(res.status === 409 ? t.auth.emailTaken : ((data as any).error || 'Registration failed'));
        return;
      }

      await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      router.push('/dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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
          <p className="text-3xl font-extrabold leading-tight text-white">
            {t.auth.registerLeftTitle}
          </p>
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

      {/* Right form */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto bg-surface px-4 py-12 md:px-12">
        <div className="w-full max-w-lg">
          <Link href="/" className="mb-8 flex items-center justify-center md:hidden">
            <span className="text-2xl font-black text-on-background">
              WAYGO<span className="text-primary">.ge</span>
            </span>
          </Link>

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

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <Field label={`${t.auth.idNumber} (${t.auth.optional})`}>
                <input type="text" value={form.idNumber} onChange={set('idNumber')} className={ic} placeholder="01234567890" maxLength={20} />
              </Field>
            </div>

            <Field label={t.auth.country}>
              <select value={form.country} onChange={set('country')} className={ic}>
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {countryLabel(c)}
                  </option>
                ))}
              </select>
            </Field>

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
                    <span className="material-symbols-outlined text-[20px]">
                      {showPass ? 'visibility_off' : 'visibility'}
                    </span>
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
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>
                  {t.common.loading}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  {t.auth.register}
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-label-bold text-secondary">
            {t.auth.hasAccount}{' '}
            <Link href="/login" className="font-bold text-primary hover:underline">
              {t.auth.signIn}
            </Link>
          </p>
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
