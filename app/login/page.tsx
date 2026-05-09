'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLang } from '@/components/lang-provider';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [notVerifiedEmail, setNotVerifiedEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setNotVerifiedEmail('');
    setLoading(true);
    const result = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      if (result.error === 'EMAIL_NOT_VERIFIED') {
        setNotVerifiedEmail(email);
        setError(t.auth.emailNotVerified);
      } else {
        setError(t.auth.invalidCredentials);
      }
    } else {
      router.push('/cars?welcome=1');
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row pt-[62px] md:pt-[120px]">
      {/* Left decorative panel */}
      <div className="hidden md:flex md:w-[45%] flex-col justify-between bg-on-background p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#1d4ed820,_transparent_60%),radial-gradient(ellipse_at_bottom_left,_#00624220,_transparent_60%)]" />
        <Link href="/" className="relative z-10 text-2xl font-black text-white">
          WAYGO<span className="text-primary-fixed-dim">.ge</span>
        </Link>
        <div className="relative z-10 space-y-6">
          <p className="text-4xl font-extrabold leading-tight text-white">{t.auth.loginLeftTitle}</p>
          <p className="text-slate-400 text-body-md leading-relaxed">{t.auth.loginLeftSub}</p>
          <div className="flex gap-3 flex-wrap">
            {[t.auth.loginTag1, t.auth.loginTag2, t.auth.loginTag3].map(tag => (
              <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-label-sm font-semibold text-slate-300">{tag}</span>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-label-sm text-slate-600">© {new Date().getFullYear()} WAYGO Georgia</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-surface px-4 py-16 md:px-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center justify-center md:hidden">
            <span className="text-2xl font-black text-on-background">WAYGO<span className="text-primary">.ge</span></span>
          </Link>

          <div className="mb-8">
            <h1 className="text-h1 font-extrabold text-on-background">{t.auth.loginTitle}</h1>
            <p className="mt-2 text-secondary text-body-md">{t.auth.loginSub}</p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl bg-error-container/40 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-error text-[18px]">error</span>
                <p className="text-label-bold font-semibold text-error">{error}</p>
              </div>
              {notVerifiedEmail && (
                <div className="mt-2 pl-7">
                  <Link
                    href={`/verify-email?email=${encodeURIComponent(notVerifiedEmail)}`}
                    className="text-label-sm font-bold text-primary hover:underline"
                  >
                    Verify email →
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-label-bold font-bold text-on-background">{t.auth.email}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-outline-variant bg-white px-4 py-3.5 text-label-bold outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary-fixed"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-label-bold font-bold text-on-background">{t.auth.password}</label>
                <Link href="/forgot-password" className="text-label-sm font-semibold text-primary hover:underline">
                  {t.auth.forgotPassword}
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-outline-variant bg-white px-4 py-3.5 pr-12 text-label-bold outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary-fixed"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-on-background transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-container py-3.5 font-bold text-label-bold text-white transition hover:bg-primary active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <><span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>{t.common.loading}</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">login</span>{t.auth.login}</>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-label-bold text-secondary">
            {t.auth.noAccount}{' '}
            <Link href="/register" className="font-bold text-primary hover:underline">{t.auth.signUp}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
